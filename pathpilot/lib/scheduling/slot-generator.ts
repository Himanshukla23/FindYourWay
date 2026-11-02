import {
  WeeklyDaySchedule,
  AvailabilityException,
  MentorSchedulingSettings,
} from '@/types'
import { AvailableSlot } from '@/lib/api-client'

export interface SlotGeneratorOptions {
  mentorId: string
  weeklySchedule: WeeklyDaySchedule[]
  exceptions?: AvailabilityException[]
  settings?: Partial<MentorSchedulingSettings>
  existingBookings?: Array<{
    date?: string
    booking_date?: string
    start_time: string
    end_time?: string
    status?: string
  }>
  sessionDurationMins?: number
  daysAhead?: number
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + (m || 0)
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatDisplayTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 === 0 ? 12 : h % 12
  return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`
}

/**
 * Real-time slot calculation engine:
 * Computes authentic consultation windows based on:
 * 1. Mentor's recurring weekly intervals
 * 2. Date-specific blockouts / holiday exceptions
 * 3. Session duration & buffer intervals
 * 4. Advance booking window & minimum notice cutoff
 * 5. Collision checks with existing confirmed bookings
 */
export function generateAvailableSlots(options: SlotGeneratorOptions): AvailableSlot[] {
  const {
    mentorId,
    weeklySchedule,
    exceptions = [],
    settings = {},
    existingBookings = [],
    sessionDurationMins = 30,
    daysAhead = 14,
  } = options

  const bufferMinutes = settings.buffer_minutes ?? 15
  const noticeHours = settings.notice_hours ?? 4
  const timezone = settings.timezone || 'Asia/Kolkata'

  const slots: AvailableSlot[] = []
  const now = new Date()
  const noticeCutoffMs = now.getTime() + noticeHours * 60 * 60 * 1000

  // Build existing bookings collision map: "YYYY-MM-DD:HH:MM"
  const bookedSet = new Set<string>()
  existingBookings.forEach((b) => {
    const bDate = b.booking_date || b.date
    const status = (b.status || '').toLowerCase()
    if (bDate && b.start_time && status !== 'cancelled') {
      const formattedTime = b.start_time.slice(0, 5)
      bookedSet.add(`${bDate}:${formattedTime}`)
    }
  })

  // Build exceptions map by date
  const exceptionMap = new Map<string, AvailabilityException>()
  exceptions.forEach((ex) => {
    exceptionMap.set(ex.exception_date, ex)
  })

  // Build weekly schedule map: day_of_week -> WeeklyDaySchedule
  const scheduleMap = new Map<number, WeeklyDaySchedule>()
  weeklySchedule.forEach((ws) => {
    scheduleMap.set(ws.day_of_week, ws)
  })

  // Iterate over upcoming days starting tomorrow
  for (let dayOffset = 1; dayOffset <= daysAhead; dayOffset++) {
    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() + dayOffset)

    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const dayOfWeek = targetDate.getDay() // 0 = Sunday, 1 = Monday, etc.

    // 1. Check if whole day is blocked by exception
    const exception = exceptionMap.get(dateStr)
    if (exception && exception.is_unavailable) {
      continue // Mentor has marked this date as unavailable/vacation
    }

    // 2. Check weekly schedule
    const dayConfig = scheduleMap.get(dayOfWeek)
    if (!dayConfig || !dayConfig.is_active || dayConfig.slots.length === 0) {
      continue // Mentor does not accept sessions on this day of week
    }

    // Determine day intervals (or custom exception intervals)
    const intervals = (exception && !exception.is_unavailable && exception.start_time && exception.end_time)
      ? [{ start_time: exception.start_time, end_time: exception.end_time }]
      : dayConfig.slots

    const stepSize = sessionDurationMins + bufferMinutes

    for (const interval of intervals) {
      const startMin = timeToMinutes(interval.start_time)
      const endMin = timeToMinutes(interval.end_time)

      for (let slotStart = startMin; slotStart + sessionDurationMins <= endMin; slotStart += stepSize) {
        const slotEnd = slotStart + sessionDurationMins
        const startTimeStr = minutesToTime(slotStart)
        const endTimeStr = minutesToTime(slotEnd)

        // Check minimum notice requirement
        const [sh, sm] = startTimeStr.split(':').map(Number)
        const slotDateTime = new Date(targetDate)
        slotDateTime.setHours(sh, sm, 0, 0)

        if (slotDateTime.getTime() < noticeCutoffMs) {
          continue // Exclude slot due to minimum notice requirement
        }

        const isBooked = bookedSet.has(`${dateStr}:${startTimeStr}`)
        if (isBooked) {
          continue // Slot already reserved, avoid double-booking
        }

        const dateLabel = targetDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })

        const displayLabel = `${dateLabel}, ${formatDisplayTime(startTimeStr)} - ${formatDisplayTime(endTimeStr)} IST`

        slots.push({
          id: `slot-${mentorId}-${dateStr}-${startTimeStr}`,
          mentor_id: mentorId,
          date: dateStr,
          start_time: startTimeStr,
          end_time: endTimeStr,
          duration_minutes: sessionDurationMins,
          is_booked: false,
          display_label: displayLabel,
        })
      }
    }
  }

  return slots
}
