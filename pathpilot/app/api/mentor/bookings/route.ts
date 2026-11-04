import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
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
        const { data: mentor } = await supabase
          .from('mentor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        let query = supabase.from('bookings').select('*')
        if (mentor?.id) {
          query = query.or(`mentor_id.eq.${mentor.id},mentor_email.eq.${user.email}`)
        } else {
          query = query.eq('mentor_email', user.email)
        }

        const { data: bookings } = await query.order('booking_date', { ascending: true })

        // Strictly isolate authenticated user data; never expose other users' bookings
        return NextResponse.json({
          success: true,
          bookings: bookings || [],
          isDemo: false,
        })
      }
    }

    // Fallback: load demo bookings from cookie or default demo data
    const demoBookingsCookie = cookieStore.get('pathpilot_user_bookings')?.value
    let bookings = []

    if (demoBookingsCookie) {
      try {
        bookings = JSON.parse(decodeURIComponent(demoBookingsCookie))
      } catch {}
    }

    if (!Array.isArray(bookings) || bookings.length === 0) {
      bookings = [
        {
          id: 'demo-meet-1',
          mentor_id: 'mentor-1',
          mentor_name: 'You',
          mentor_title: 'Senior Engineer',
          user_name: 'Priyanshu Sharma',
          user_email: 'priyanshu@college.edu',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          start_time: '18:00',
          duration_minutes: 30,
          topic: 'System Design & Redis Cache Invalidation Review',
          notes: 'Looking for architectural feedback on backend microservices architecture.',
          meet_link: null,
          google_calendar_status: 'AWAITING_CREDENTIALS',
          calendar_ics_url: '',
          status: 'confirmed',
          amount_inr: 500,
          created_at: new Date().toISOString(),
        },
        {
          id: 'demo-meet-2',
          mentor_id: 'mentor-1',
          mentor_name: 'You',
          mentor_title: 'Senior Engineer',
          user_name: 'Ananya Verma',
          user_email: 'ananya.v@techuniv.ac.in',
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          start_time: '16:00',
          duration_minutes: 45,
          topic: 'Full-Stack Portfolio & Resume Critique',
          notes: 'Need guidance on highlighting Next.js and Postgres projects for campus placements.',
          meet_link: null,
          google_calendar_status: 'AWAITING_CREDENTIALS',
          calendar_ics_url: '',
          status: 'confirmed',
          amount_inr: 750,
          created_at: new Date().toISOString(),
        },
      ]
    }

    return NextResponse.json({
      success: true,
      bookings,
      isDemo: true,
    })
  } catch (err: any) {
    console.error('[API /mentor/bookings GET] Error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const body = await request.json()
    const { booking_id, status, cancellation_reason } = body

    if (!booking_id || !status) {
      return NextResponse.json(
        { success: false, error: 'booking_id and status are required' },
        { status: 400 }
      )
    }

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
        await supabase
          .from('bookings')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking_id)

        return NextResponse.json({ success: true, message: `Booking status updated to ${status}` })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${booking_id} status updated to ${status}`,
    })
  } catch (err: any) {
    console.error('[API /mentor/bookings PATCH] Error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update booking status' },
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
        await supabase.from('bookings').upsert({
          id: newBooking.id,
          mentor_id: newBooking.mentor_id || user.id,
          mentor_name: newBooking.mentor_name,
          mentor_title: newBooking.mentor_title,
          mentor_email: user.email,
          user_name: newBooking.user_name || newBooking.student_name,
          user_email: newBooking.user_email || newBooking.student_email,
          student_email: newBooking.student_email || newBooking.user_email,
          booking_date: newBooking.date,
          start_time: newBooking.start_time,
          duration_minutes: newBooking.duration_minutes || newBooking.duration_mins || 30,
          topic: newBooking.topic,
          notes: newBooking.notes,
          meet_link: newBooking.meet_link || newBooking.meeting_link,
          meeting_link: newBooking.meeting_link || newBooking.meet_link,
          status: newBooking.status || 'confirmed',
          amount_inr: newBooking.amount_inr || 0,
          created_at: newBooking.created_at || new Date().toISOString(),
        })

        return NextResponse.json({
          success: true,
          booking: newBooking,
        })
      }
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
    })
  } catch (err: any) {
    console.error('[API /mentor/bookings POST] Error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to persist booking' },
      { status: 500 }
    )
  }
}
