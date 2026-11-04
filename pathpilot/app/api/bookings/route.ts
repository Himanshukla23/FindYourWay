import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('user_email') || searchParams.get('student_email')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      })

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        let query = supabase.from('bookings').select('*')
        if (userEmail) {
          query = query.eq('student_email', userEmail)
        } else {
          query = query.eq('user_id', user.id)
        }
        const { data: bookings } = await query.order('booking_date', { ascending: true })

        if (bookings && bookings.length > 0) {
          return NextResponse.json({
            success: true,
            total: bookings.length,
            bookings,
          })
        }
      }
    }

    // Fallback: read from cookie
    const raw = cookieStore.get('pathpilot_user_bookings')?.value
    let bookings: any[] = []

    if (raw) {
      try {
        bookings = JSON.parse(decodeURIComponent(raw))
      } catch {}
    }

    if (Array.isArray(bookings) && bookings.length > 0) {
      if (userEmail) {
        const filtered = bookings.filter(
          (b) =>
            !b.user_email ||
            !userEmail ||
            b.user_email.toLowerCase() === userEmail.toLowerCase() ||
            b.student_email?.toLowerCase() === userEmail.toLowerCase()
        )
        return NextResponse.json({
          success: true,
          total: filtered.length,
          bookings: filtered.length > 0 ? filtered : bookings,
        })
      }
      return NextResponse.json({
        success: true,
        total: bookings.length,
        bookings,
      })
    }

    // Default mock demo bookings if none exist yet
    const demoBookings = [
      {
        id: 'demo-meet-1',
        mentor_id: 'mentor-1',
        mentor_name: 'Himanshu Shukla',
        mentor_title: 'Staff Platform Engineer',
        mentor_org: 'PathPilot Engineering',
        user_name: 'Priyanshu Sharma',
        user_email: 'priyanshu@college.edu',
        student_email: 'priyanshu@college.edu',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        start_time: '18:00',
        duration_minutes: 30,
        topic: 'System Design & Redis Cache Invalidation Review',
        notes: 'Looking for architectural feedback on backend microservices architecture.',
        meet_link: 'https://meet.google.com/pp-demo-sys1',
        google_calendar_status: 'CONFIRMED',
        calendar_ics_url: '',
        status: 'confirmed',
        amount_inr: 499,
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      total: demoBookings.length,
      bookings: demoBookings,
    })
  } catch (err: any) {
    console.error('[API /api/bookings GET] Error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const newBooking = await request.json()

    if (!newBooking || !newBooking.id) {
      return NextResponse.json(
        { success: false, error: 'Valid booking object with id is required' },
        { status: 400 }
      )
    }

    const raw = cookieStore.get('pathpilot_user_bookings')?.value
    let list: any[] = []
    if (raw) {
      try {
        list = JSON.parse(decodeURIComponent(raw))
      } catch {}
    }
    if (!Array.isArray(list)) list = []

    const filtered = list.filter((b) => b.id !== newBooking.id)
    filtered.unshift(newBooking)

    const response = NextResponse.json({
      success: true,
      booking: newBooking,
      bookings: filtered,
    })

    response.cookies.set('pathpilot_user_bookings', encodeURIComponent(JSON.stringify(filtered)), {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
    })

    return response
  } catch (err: any) {
    console.error('[API /api/bookings POST] Error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save booking' },
      { status: 500 }
    )
  }
}
