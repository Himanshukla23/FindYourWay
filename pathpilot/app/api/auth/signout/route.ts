import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  return handleSignOut(request)
}

export async function GET(request: Request) {
  return handleSignOut(request)
}

async function handleSignOut(request: Request) {
  const cookieStore = await cookies()
  const origin = new URL(request.url).origin

  // 1. Sign out from Supabase server session if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
              // Server component / route handler cookie set
            }
          },
        },
      })
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[SignOut] Error signing out from Supabase:', err)
    }
  }

  // 2. Explicitly clear all session cookies
  const allCookies = cookieStore.getAll()
  const response = NextResponse.redirect(`${origin}/sign-in`, { status: 303 })

  // Delete demo session and onboarding cookies
  response.cookies.delete('pathpilot_demo_session')
  response.cookies.delete('pathpilot_onboarded')
  cookieStore.delete('pathpilot_demo_session')
  cookieStore.delete('pathpilot_onboarded')

  // Delete all Supabase auth cookie chunks (e.g. sb-*-auth-token, sb-*-auth-token.0)
  for (const c of allCookies) {
    if (c.name.startsWith('sb-') || c.name.startsWith('pathpilot_')) {
      response.cookies.delete(c.name)
      cookieStore.delete(c.name)
    }
  }

  return response
}
