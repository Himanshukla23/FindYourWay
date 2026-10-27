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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ── Demo mode: skip auth enforcement ──────────────────────────────────────
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const hasDemoSession = request.cookies.get('pathpilot_demo_session')?.value === 'true'
  const isAuthenticated = !!user || hasDemoSession

  // ── Protected routes — must be signed in ──────────────────────────────────
  const protectedPaths = [
    '/dashboard',
    '/onboarding',
    '/resume',
    '/careers',
    '/roadmap',
    '/mentors',
    '/book',
    '/consultations',
    '/profile',
  ]

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !isAuthenticated) {
    const redirectUrl = new URL('/sign-in', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ── Auth pages — redirect if already signed in with a real Supabase account ─────────────────────────────
  const authPaths = ['/sign-in', '/sign-up']
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p))
  const isSwitchingAccount = request.nextUrl.searchParams.get('switch') === 'true'

  // Only redirect away from /sign-in or /sign-up if there is an ACTUAL verified user session
  // and the user is not explicitly requesting to switch accounts
  const isOnboarded = request.cookies.get('pathpilot_onboarded')?.value === 'true' ||
    user?.user_metadata?.onboarding_completed === true

  if (isAuthPage && !!user && !isSwitchingAccount) {
    if (isOnboarded) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // ── Redirect authenticated users to onboarding if not completed ───────────
  // Only for dashboard and other main pages (not onboarding itself)
  if (isAuthenticated && !!user && pathname !== '/onboarding') {
    const mainPages = ['/dashboard', '/resume', '/careers', '/roadmap', '/mentors', '/book', '/consultations', '/profile']
    const isMainPage = mainPages.some((p) => pathname.startsWith(p))

    if (isMainPage && !isOnboarded) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // ── If already onboarded and visits /onboarding, take directly to dashboard ─
  if (isAuthenticated && !!user && pathname === '/onboarding' && isOnboarded) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
