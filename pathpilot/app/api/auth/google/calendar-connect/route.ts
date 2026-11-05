import { NextResponse } from 'next/server'
import { getGoogleCalendarAuthUrl } from '@/lib/google-calendar'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const redirectUri = `${origin}/api/auth/google/calendar-callback`

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    // If Google OAuth credentials are not yet set in .env.local, redirect with notice
    return NextResponse.redirect(`${origin}/mentor/settings?notice=google_ready`)
  }

  const authUrl = getGoogleCalendarAuthUrl(redirectUri, 'calendar_connect')
  return NextResponse.redirect(authUrl)
}
