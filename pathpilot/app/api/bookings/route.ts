import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createGoogleMeetEvent } from '@/lib/google-calendar'
import { sendBookingNotifications } from '@/lib/email-service'

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
        const { data: bookings, error: dbError } = await query.order('booking_date', { ascending: true })

        if (dbError) {
          console.warn('[API /api/bookings GET] DB query warning:', dbError.message)
        }

        // If DB has bookings, return them. If empty (table may not exist yet, or no data),
        // fall through to cookie-based bookings as a supplement.
        if (bookings && bookings.length > 0) {
          return NextResponse.json({
            success: true,
            total: bookings.length,
            bookings: bookings,
            isDemo: false,
          })
        }

        // DB returned empty — try cookie-based bookings saved on booking page
        const cookieRaw = cookieStore.get('pathpilot_user_bookings')?.value
        let cookieBookings: any[] = []
        if (cookieRaw) {
          try { cookieBookings = JSON.parse(decodeURIComponent(cookieRaw)) } catch {}
        }

        // Filter cookie bookings to this user
        if (Array.isArray(cookieBookings) && cookieBookings.length > 0 && targetEmail) {
          const filtered = cookieBookings.filter(
            (b: any) =>
              b.user_email?.toLowerCase() === targetEmail.toLowerCase() ||
              b.student_email?.toLowerCase() === targetEmail.toLowerCase()
          )
          if (filtered.length > 0) {
            return NextResponse.json({ success: true, total: filtered.length, bookings: filtered, isDemo: false })
          }
        }

        // Strictly return this authenticated user's bookings (or [] if none exist)
        // NEVER return demo mock data for an authenticated user!
        return NextResponse.json({
          success: true,
          total: 0,
          bookings: [],
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

    // 1. Provision genuine Google Meet & Calendar Event
    let startTimeIso = new Date().toISOString()
    let endTimeIso = new Date(Date.now() + 1800000).toISOString()
    try {
      if (newBooking.date && newBooking.start_time) {
        const dateStr = newBooking.date.includes('T') ? newBooking.date.split('T')[0] : newBooking.date
        const timeStr = newBooking.start_time.length === 5 ? `${newBooking.start_time}:00` : newBooking.start_time
        const startDt = new Date(`${dateStr}T${timeStr}`)
        if (!isNaN(startDt.getTime())) {
          startTimeIso = startDt.toISOString()
          const durationMs = (newBooking.duration_minutes || newBooking.duration_mins || 30) * 60000
          endTimeIso = new Date(startDt.getTime() + durationMs).toISOString()
        }
      }
    } catch {}

    const calResult = await createGoogleMeetEvent({
      summary: `PathPilot 1:1 Mentorship: ${newBooking.topic || 'Consultation'}`,
      description: `1-on-1 Mentorship Session\nMentor: ${newBooking.mentor_name}\nStudent: ${newBooking.user_name || newBooking.student_name}\nTopic: ${newBooking.topic}\nNotes: ${newBooking.notes || 'None'}`,
      startTime: startTimeIso,
      endTime: endTimeIso,
      timeZone: newBooking.time_zone || 'Asia/Kolkata',
      studentEmail: newBooking.student_email || newBooking.user_email,
      mentorEmail: newBooking.mentor_email,
      bookingId: newBooking.id,
    })

    if (calResult.meetLink) {
      newBooking.meet_link = calResult.meetLink
      newBooking.meeting_link = calResult.meetLink
    }
    if (calResult.htmlLink) {
      newBooking.calendar_link = calResult.htmlLink
    }

    // 2. Dispatch email notifications asynchronously (non-blocking)
    sendBookingNotifications({
      bookingId: newBooking.id,
      mentorName: newBooking.mentor_name,
      mentorTitle: newBooking.mentor_title,
      mentorOrg: newBooking.mentor_org,
      mentorEmail: newBooking.mentor_email || '',
      studentName: newBooking.user_name || newBooking.student_name || 'Student',
      studentEmail: newBooking.student_email || newBooking.user_email || 'student@pathpilot.ai',
      date: newBooking.date,
      startTime: newBooking.start_time,
      durationMinutes: newBooking.duration_minutes || newBooking.duration_mins || 30,
      topic: newBooking.topic,
      notes: newBooking.notes,
      meetLink: newBooking.meet_link,
      calendarLink: calResult.htmlLink,
    }).catch((emailErr) => {
      console.warn('[API /api/bookings POST] Email dispatch warning:', emailErr)
    })

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
        const { error: upsertError } = await supabase.from('bookings').upsert({
          id: newBooking.id,
          user_id: user.id,
          mentor_id: newBooking.mentor_id,
          mentor_name: newBooking.mentor_name,
          mentor_title: newBooking.mentor_title,
          mentor_org: newBooking.mentor_org,
          mentor_email: newBooking.mentor_email || null,
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
        if (upsertError) {
          console.warn('[API /api/bookings POST] DB upsert warning:', upsertError.message)
        }

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
