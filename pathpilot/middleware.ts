import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware to protect authenticated routes.
 * Redirects unauthenticated users to /sign-in.
 * Redirects authenticated users away from auth pages to /dashboard.
 * Redirects new users who haven't completed onboarding to /onboarding.
 *
 * If Supabase is not configured (demo mode), middleware passes all requests through.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Fast-path: bypass API routes from middleware overhead ────────────────
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ── Demo mode: skip auth enforcement ──────────────────────────────────────
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some((c) => c.name.startsWith('sb-') || c.name.includes('auth-token'))
  const hasDemoSession = request.cookies.get('pathpilot_demo_session')?.value === 'true'

  let user = null
  if (hasAuthCookie) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      })

      // Strict 1.5s timeout for auth resolution so pages never lag
      const authResult: any = await Promise.race([
        supabase.auth.getUser(),
        new Promise((resolve) => setTimeout(() => resolve({ data: { user: null } }), 1500)),
      ])
      user = authResult?.data?.user || null
    } catch {
      user = null
    }
  }

  const isAuthenticated = !!user || hasDemoSession

  // ── Role & Verification Status Resolution ─────────────────────────────────
  const role = (user?.user_metadata?.role || request.cookies.get('pathpilot_user_role')?.value || 'student') as 'student' | 'mentor' | 'admin'
  const mentorStatus = user?.user_metadata?.mentor_status || 'approved'
  const isOnboarded = request.cookies.get('pathpilot_onboarded')?.value === 'true' ||
    user?.user_metadata?.onboarding_completed === true

  // ── Route Categorization ──────────────────────────────────────────────────
  const isMentorRoute = pathname.startsWith('/mentor') && !pathname.startsWith('/mentor/sign-in') && !pathname.startsWith('/mentor/sign-up')
  
  // Private student routes that strictly require authentication & are isolated from mentor accounts
  const studentPrivatePaths = [
    '/dashboard',
    '/student/dashboard',
    '/onboarding',
    '/book',
    '/consultations',
    '/student/bookings',
    '/profile',
    '/student/profile',
  ]
  const isPrivateStudentRoute = studentPrivatePaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

  const authPaths = [
    '/sign-in',
    '/sign-up',
    '/student/sign-in',
    '/student/sign-up',
    '/mentor/sign-in',
    '/mentor/sign-up',
  ]
  const isAuthPage = authPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const isSwitchingAccount = request.nextUrl.searchParams.get('switch') === 'true'

  // ── 1. Unauthenticated Route Protection ───────────────────────────────────
  if (!isAuthenticated) {
    if (isMentorRoute) {
      const redirectUrl = new URL('/mentor/sign-in', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    if (isPrivateStudentRoute) {
      const redirectUrl = new URL('/student/sign-in', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // ── 2. Authenticated Role-Based Cross-Portal Protection ───────────────────
  if (isAuthenticated && !isSwitchingAccount) {
    // A: Prevent Student accounts from accessing Mentor portal
    if (role === 'student' && isMentorRoute) {
      const redirectUrl = new URL('/student/dashboard', request.url)
      redirectUrl.searchParams.set('notice', 'mentor_access_denied')
      return NextResponse.redirect(redirectUrl)
    }

    // B: Prevent Mentor accounts from accessing private Student account portals
    // (Note: /jobs, /careers, /mentors, /resume, /roadmap are public and accessible to both roles)
    if (role === 'mentor' && isPrivateStudentRoute) {
      const redirectUrl = new URL('/mentor/dashboard', request.url)
      redirectUrl.searchParams.set('notice', 'student_access_denied')
      return NextResponse.redirect(redirectUrl)
    }

    // C: Mentor Verification Status Flow
    if (role === 'mentor' && mentorStatus === 'pending_approval' && pathname === '/mentor/dashboard') {
      const redirectUrl = new URL('/mentor/profile', request.url)
      redirectUrl.searchParams.set('notice', 'pending_approval')
      return NextResponse.redirect(redirectUrl)
    }

    // D: Redirect already authenticated users away from Auth pages
    if (isAuthPage && !!user) {
      if (role === 'mentor') {
        const dest = mentorStatus === 'pending_approval' ? '/mentor/profile' : '/mentor/dashboard'
        return NextResponse.redirect(new URL(dest, request.url))
      } else {
        const dest = isOnboarded ? '/student/dashboard' : '/onboarding'
        return NextResponse.redirect(new URL(dest, request.url))
      }
    }

    // E: If student is not onboarded and tries to access private student dashboard
    if (role === 'student' && !isOnboarded && isPrivateStudentRoute && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // F: If student is already onboarded and visits /onboarding, take directly to dashboard
    if (role === 'student' && isOnboarded && pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
