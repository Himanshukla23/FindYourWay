import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  const oauthError = searchParams.get('error_description') || searchParams.get('error')
  if (oauthError) {
    console.error('[OAuth Callback] Google OAuth error:', oauthError)
    return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(oauthError)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gmoeqwelvndvbmdqupdl.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // The `setAll` method was called from a Server Component.
              }
            },
          },
        }
      )
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data?.session) {
        // Clear demo cookie if present
        cookieStore.delete('pathpilot_demo_session')

        const requestedRole = searchParams.get('role') || 'student'
        const user = data.session.user
        let role = user?.user_metadata?.role

        // If new user without role, update metadata with requested role
        if (!role) {
          role = requestedRole
          await supabase.auth.updateUser({
            data: {
              role: requestedRole,
              mentor_status: requestedRole === 'mentor' ? 'approved' : undefined,
            },
          }).catch(() => {})
        }

        // Set role cookie
        cookieStore.set('pathpilot_user_role', role, { path: '/', maxAge: 2592000 })

        // Role-based target destination
        let target = next
        if (role === 'mentor') {
          if (!target.startsWith('/mentor')) {
            target = '/mentor/dashboard'
          }
        } else {
          if (target === '/onboarding' || target === '/dashboard') {
            target = '/student/dashboard'
          }
        }

        return NextResponse.redirect(`${origin}${target}`)
      } else if (error) {
        console.error('[OAuth Callback] Session exchange error:', error.message)
        return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(error.message)}`)
      }
    }
  }

  // Fallback: If no code in query params, inspect hash fragment in the browser (for Implicit Flow tokens)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gmoeqwelvndvbmdqupdl.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Completing Authentication - PathPilot AI</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .card {
      background: #FFFFFF;
      padding: 32px 40px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      text-align: center;
      max-width: 360px;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #E2E8F0;
      border-top-color: #1A73E8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h3 style="margin: 0 0 8px; color: #0F172A; font-size: 1.1rem; font-weight: 700;">Authenticating...</h3>
    <p style="margin: 0; color: #64748B; font-size: 0.875rem;">Completing Google authentication with PathPilot AI</p>
  </div>
  <script type="module">
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
    
    (async function() {
      try {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const params = new URLSearchParams(hash.substring(1));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token) {
            const supabase = createClient('${supabaseUrl}', '${supabaseAnonKey}');
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token: refresh_token || ''
            });
            if (!error) {
              document.cookie = 'pathpilot_demo_session=; path=/; max-age=0';
              window.location.replace('${next}');
              return;
            }
          }
        }
      } catch (e) {
        console.error('Hash fallback error:', e);
      }
      window.location.replace('/sign-in?error=oauth_missing_code');
    })();
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
