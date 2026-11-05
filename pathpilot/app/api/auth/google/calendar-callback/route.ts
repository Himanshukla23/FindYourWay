import { NextResponse } from 'next/server'
import { exchangeGoogleCodeForTokens } from '@/lib/google-calendar'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/mentor/settings?error=google_connect_interrupted`)
  }

  const redirectUri = `${origin}/api/auth/google/calendar-callback`
  const tokens = await exchangeGoogleCodeForTokens(code, redirectUri)

  if (tokens) {
    try {
      const cookieStore = await cookies()
      const supabase = await createClient()
      const adminClient = await createAdminClient()
      const client = adminClient || supabase

      if (client && supabase && tokens.refresh_token) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Store token in user metadata or mentor record
          await client.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.user_metadata,
              google_calendar_connected: true,
              google_calendar_refresh_token: tokens.refresh_token,
            },
          }).catch(() => {})
        }
      }

      cookieStore.set('pathpilot_google_calendar_connected', 'true', {
        path: '/',
        maxAge: 2592000,
        sameSite: 'lax',
      })
    } catch (e) {
      console.warn('[CalendarCallback] Error persisting token:', e)
    }

    return NextResponse.redirect(`${origin}/mentor/settings?calendar=connected`)
  }

  return NextResponse.redirect(`${origin}/mentor/settings?notice=google_ready`)
}
