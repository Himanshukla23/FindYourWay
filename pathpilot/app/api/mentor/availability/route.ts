import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { WeeklyDaySchedule, AvailabilityException, MentorSchedulingSettings } from '@/types'

const DEFAULT_WEEKLY_SCHEDULE: WeeklyDaySchedule[] = [
  {
    day_of_week: 1,
    day_name: 'Monday',
    is_active: true,
    slots: [
      { id: 'mon-1', start_time: '10:00', end_time: '13:00' },
      { id: 'mon-2', start_time: '15:00', end_time: '18:00' },
    ],
  },
  {
    day_of_week: 2,
    day_name: 'Tuesday',
    is_active: true,
    slots: [
      { id: 'tue-1', start_time: '10:00', end_time: '13:00' },
      { id: 'tue-2', start_time: '15:00', end_time: '18:00' },
    ],
  },
  {
    day_of_week: 3,
    day_name: 'Wednesday',
    is_active: true,
    slots: [
      { id: 'wed-1', start_time: '10:00', end_time: '13:00' },
      { id: 'wed-2', start_time: '15:00', end_time: '18:00' },
    ],
  },
  {
    day_of_week: 4,
    day_name: 'Thursday',
    is_active: true,
    slots: [
      { id: 'thu-1', start_time: '10:00', end_time: '13:00' },
      { id: 'thu-2', start_time: '15:00', end_time: '18:00' },
    ],
  },
  {
    day_of_week: 5,
    day_name: 'Friday',
    is_active: true,
    slots: [
      { id: 'fri-1', start_time: '10:00', end_time: '13:00' },
      { id: 'fri-2', start_time: '14:00', end_time: '17:00' },
    ],
  },
  {
    day_of_week: 6,
    day_name: 'Saturday',
    is_active: true,
    slots: [
      { id: 'sat-1', start_time: '11:00', end_time: '14:00' },
    ],
  },
  {
    day_of_week: 0,
    day_name: 'Sunday',
    is_active: false,
    slots: [],
  },
]

const DEFAULT_SETTINGS: MentorSchedulingSettings = {
  timezone: 'Asia/Kolkata',
  buffer_minutes: 15,
  notice_hours: 4,
  max_weeks_in_advance: 4,
}

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
          .select('id, timezone')
          .eq('user_id', user.id)
          .maybeSingle()

        if (mentor?.id) {
          // Fetch weekly availability
          const { data: weeklyData } = await supabase
            .from('mentor_weekly_availability')
            .select('*')
            .eq('mentor_id', mentor.id)
            .order('day_of_week', { ascending: true })

          // Fetch exceptions
          const { data: exceptionsData } = await supabase
            .from('mentor_availability_exceptions')
            .select('*')
            .eq('mentor_id', mentor.id)
            .order('exception_date', { ascending: true })

          // Fetch settings
          const { data: settingsData } = await supabase
            .from('mentor_scheduling_settings')
            .select('*')
            .eq('mentor_id', mentor.id)
            .maybeSingle()

          if (weeklyData && weeklyData.length > 0) {
            // Group weekly data by day_of_week
            const daysMap: Record<number, WeeklyDaySchedule> = {}
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

            dayNames.forEach((name, idx) => {
              daysMap[idx] = {
                day_of_week: idx,
                day_name: name,
                is_active: false,
                slots: [],
              }
            })

            weeklyData.forEach((row: any) => {
              const dow = row.day_of_week
              if (daysMap[dow]) {
                if (row.is_active) daysMap[dow].is_active = true
                daysMap[dow].slots.push({
                  id: row.id,
                  start_time: row.start_time.slice(0, 5),
                  end_time: row.end_time.slice(0, 5),
                })
              }
            })

            const scheduleList = [1, 2, 3, 4, 5, 6, 0].map(d => daysMap[d])

            return NextResponse.json({
              success: true,
              data: {
                weekly_schedule: scheduleList,
                exceptions: exceptionsData || [],
                settings: settingsData || { ...DEFAULT_SETTINGS, timezone: mentor.timezone || 'Asia/Kolkata' },
              },
              isDemo: false,
            })
          }
        }
      }
    }

    // Fallback: check demo cookies or return defaults
    const demoCookie = cookieStore.get('pathpilot_mentor_availability')?.value
    if (demoCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(demoCookie))
        return NextResponse.json({ success: true, data: parsed, isDemo: true })
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: {
        weekly_schedule: DEFAULT_WEEKLY_SCHEDULE,
        exceptions: [],
        settings: DEFAULT_SETTINGS,
      },
      isDemo: true,
    })
  } catch (err: any) {
    console.error('[API /mentor/availability GET] Error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const body = await request.json()
    const { weekly_schedule, exceptions, settings } = body

    if (!Array.isArray(weekly_schedule)) {
      return NextResponse.json(
        { success: false, error: 'Invalid weekly_schedule payload' },
        { status: 400 }
      )
    }

    // Validation: check slot order and overlaps
    for (const day of weekly_schedule) {
      if (!day.is_active || !day.slots) continue
      const sorted = [...day.slots].sort((a, b) => a.start_time.localeCompare(b.start_time))
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].start_time >= sorted[i].end_time) {
          return NextResponse.json(
            { success: false, error: `Invalid slot on ${day.day_name}: Start time (${sorted[i].start_time}) must be before end time (${sorted[i].end_time}).` },
            { status: 400 }
          )
        }
        if (i > 0 && sorted[i].start_time < sorted[i - 1].end_time) {
          return NextResponse.json(
            { success: false, error: `Overlapping slots detected on ${day.day_name} between ${sorted[i - 1].start_time}-${sorted[i - 1].end_time} and ${sorted[i].start_time}-${sorted[i].end_time}.` },
            { status: 400 }
          )
        }
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    let savedToSupabase = false

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

        if (mentor?.id) {
          // 1. Delete existing weekly slots and re-insert
          await supabase.from('mentor_weekly_availability').delete().eq('mentor_id', mentor.id)

          const insertRows: any[] = []
          weekly_schedule.forEach((day: WeeklyDaySchedule) => {
            if (day.is_active && day.slots.length > 0) {
              day.slots.forEach(slot => {
                insertRows.push({
                  mentor_id: mentor.id,
                  day_of_week: day.day_of_week,
                  start_time: slot.start_time,
                  end_time: slot.end_time,
                  is_active: true,
                })
              })
            }
          })

          if (insertRows.length > 0) {
            await supabase.from('mentor_weekly_availability').insert(insertRows)
          }

          // 2. Replace exceptions
          await supabase.from('mentor_availability_exceptions').delete().eq('mentor_id', mentor.id)
          if (Array.isArray(exceptions) && exceptions.length > 0) {
            const exRows = exceptions.map((ex: AvailabilityException) => ({
              mentor_id: mentor.id,
              exception_date: ex.exception_date,
              is_unavailable: ex.is_unavailable !== false,
              start_time: ex.start_time || null,
              end_time: ex.end_time || null,
              reason: ex.reason || 'Blocked',
            }))
            await supabase.from('mentor_availability_exceptions').insert(exRows)
          }

          // 3. Upsert settings
          if (settings) {
            await supabase.from('mentor_scheduling_settings').upsert({
              mentor_id: mentor.id,
              timezone: settings.timezone || 'Asia/Kolkata',
              buffer_minutes: settings.buffer_minutes || 15,
              notice_hours: settings.notice_hours || 4,
              max_weeks_in_advance: settings.max_weeks_in_advance || 4,
              updated_at: new Date().toISOString(),
            })
          }

          savedToSupabase = true
        }
      }
    }

    const payload = {
      weekly_schedule,
      exceptions: exceptions || [],
      settings: settings || DEFAULT_SETTINGS,
    }

    const response = NextResponse.json({
      success: true,
      data: payload,
      savedToSupabase,
      message: 'Availability schedule saved successfully!',
    })

    // Store in cookie for fallback & persistent demo operation
    response.cookies.set('pathpilot_mentor_availability', encodeURIComponent(JSON.stringify(payload)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      sameSite: 'lax',
    })

    return response
  } catch (err: any) {
    console.error('[API /mentor/availability POST] Error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save availability' },
      { status: 500 }
    )
  }
}
