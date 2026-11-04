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
        const targetEmail = userEmail || user.email
        if (targetEmail) {
          query = query.or(`student_email.eq.${targetEmail},user_email.eq.${targetEmail},user_id.eq.${user.id}`)
        } else {
          query = query.eq('user_id', user.id)
        }
        const { data: bookings } = await query.order('booking_date', { ascending: true })

        // Strictly return this authenticated user's bookings (or [] if none exist)
        // NEVER fall through to demo cookies or mock data for an authenticated user!
        return NextResponse.json({
          success: true,
          total: (bookings || []).length,
          bookings: bookings || [],
          isDemo: false,
        })
      }
    }

    // Fallback ONLY for unauthenticated demo visitors
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
          isDemo: true,
        })
      }
      return NextResponse.json({
        success: true,
        total: bookings.length,
        bookings,
        isDemo: true,
      })
    }

    // Default mock demo bookings if none exist yet
    const demoBookings = [
      {
        id: 'demo-meet-1',
        mentor_id: 'mentor-1',
        mentor_name: 'Dr. Priya Narayan',
        mentor_title: 'Lead AI Researcher',
        mentor_org: 'Microsoft Research',
        user_name: 'Priyanshu Sharma',
        user_email: 'priyanshu@college.edu',
        student_email: 'priyanshu@college.edu',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        start_time: '18:00',
        duration_minutes: 30,
        topic: 'Breaking into AI/ML in 2026',
        notes: 'Looking for advice on AI engineering and publication track.',
        meet_link: 'https://meet.google.com/pp-demo-sys1',
        google_calendar_status: 'CONFIRMED',
        calendar_ics_url: '',
        status: 'confirmed',
        amount_inr: 999,
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      total: demoBookings.length,
      bookings: demoBookings,
      isDemo: true,
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
        // Upsert into Supabase bookings table
        await supabase.from('bookings').upsert({
          id: newBooking.id,
          user_id: user.id,
          mentor_id: newBooking.mentor_id,
          mentor_name: newBooking.mentor_name,
          mentor_title: newBooking.mentor_title,
          user_name: newBooking.user_name || newBooking.student_name,
          user_email: newBooking.user_email || newBooking.student_email || user.email,
          student_email: newBooking.student_email || newBooking.user_email || user.email,
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
