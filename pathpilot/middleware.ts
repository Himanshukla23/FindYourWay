import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware to protect authenticated routes and strictly isolate
 * Student and Mentor portals.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Fast-path: bypass API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Demo mode if Supabase not configured
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  // Initialize Supabase SSR client
  let user = null
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some((c) => c.name.startsWith('sb-') || c.name.includes('auth-token'))
  const hasDemoSession = request.cookies.get('pathpilot_demo_session')?.value === 'true'

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

      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      user = null
    }
  }

  const isAuthenticated = !!user || hasDemoSession

  // Role resolution: database user metadata first, cookie second, default student
  const userMetadataRole = user?.user_metadata?.role as 'student' | 'mentor' | undefined
  const cookieRole = request.cookies.get('pathpilot_user_role')?.value as 'student' | 'mentor' | undefined
  const role = userMetadataRole || cookieRole || 'student'
  const isOnboarded = request.cookies.get('pathpilot_onboarded')?.value === 'true' ||
    user?.user_metadata?.onboarding_completed === true

  // Helper to carry over cookies on redirect to prevent session loss
  const createRedirect = (url: string | URL) => {
    const targetUrl = url instanceof URL ? url : new URL(url, request.url)
    const redirectResponse = NextResponse.redirect(targetUrl)
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value)
    })
    return redirectResponse
  }

  // Base path convenience shortcuts
  if (pathname === '/mentor') {
    return createRedirect('/mentor/dashboard')
  }
  if (pathname === '/student') {
    return createRedirect('/dashboard')
  }

  // Route definitions
  const isMentorRoute = pathname === '/mentor' || pathname.startsWith('/mentor/')
  const isMentorAuthPage = pathname === '/mentor/sign-in' || pathname === '/mentor/sign-up'
  const isStudentAuthPage = pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/student/sign-in' || pathname === '/student/sign-up'
  const isAuthPage = isMentorAuthPage || isStudentAuthPage
  const isSwitchingAccount = request.nextUrl.searchParams.get('switch') === 'true'

  // Student private management routes that require authentication
  const studentPrivatePaths = [
    '/dashboard',
    '/student/dashboard',
    '/resume',
    '/roadmap',
    '/prep-map',
    '/consultations',
    '/onboarding',
    '/profile',
  ]
  const isStudentPrivateRoute = studentPrivatePaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

  // ── 1. Unauthenticated Route Protection ───────────────────────────────────
  if (!isAuthenticated) {
    if (isMentorRoute && !isMentorAuthPage) {
      const redirectUrl = new URL('/mentor/sign-in', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return createRedirect(redirectUrl)
    }
    if (isStudentPrivateRoute) {
      const redirectUrl = new URL('/student/sign-in', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return createRedirect(redirectUrl)
    }
    return supabaseResponse
  }

  // ── 2. Authenticated Routing & Role Isolation ─────────────────────────────
  // If already authenticated and visiting an auth page (sign-in/sign-up), redirect to dashboard
  if (isAuthPage && !!user && !isSwitchingAccount) {
    // Allow mentors to view student sign-in if switching intentionally
    if (pathname.includes('student') && role === 'mentor' && isSwitchingAccount) {
      return supabaseResponse
    }
    if (pathname.includes('mentor') && role === 'student' && isSwitchingAccount) {
      return supabaseResponse
    }
    const dest = role === 'mentor' ? '/mentor/dashboard' : (isOnboarded ? '/dashboard' : '/onboarding')
    return createRedirect(dest)
  }

  // A. Mentor Role Protection:
  if (role === 'mentor') {
    // If a mentor tries to access private student management portals, redirect to mentor portal
    if (isStudentPrivateRoute) {
      if (pathname === '/consultations' || pathname.startsWith('/consultations')) {
        return createRedirect('/mentor/bookings')
      }
      return createRedirect('/mentor/dashboard')
    }
    // Allow all mentor routes and public browsing (/mentors, /jobs, /careers, /)
    return supabaseResponse
  }

  // B. Student Role Protection:
  if (role === 'student') {
    // Prevent students from accessing private mentor portal
    if (isMentorRoute && !isMentorAuthPage) {
      return createRedirect('/dashboard')
    }
    // Student onboarding check
    if (!isOnboarded && isStudentPrivateRoute && pathname !== '/onboarding') {
      return createRedirect('/onboarding')
    }
    if (isOnboarded && pathname === '/onboarding') {
      return createRedirect('/dashboard')
    }
    return supabaseResponse
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
