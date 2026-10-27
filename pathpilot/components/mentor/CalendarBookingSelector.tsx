'use client'

import React, { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Globe,
  AlertCircle
} from 'lucide-react'
import { AvailableSlot } from '@/lib/api-client'

interface CalendarBookingSelectorProps {
  slots: AvailableSlot[]
  selectedSlotId: string
  onSelectSlot: (slotId: string) => void
  userTimeZone: string
  onTimeZoneChange?: (tz: string) => void
  isLoading?: boolean
}

export function CalendarBookingSelector({
  slots,
  selectedSlotId,
  onSelectSlot,
  userTimeZone,
  onTimeZoneChange,
  isLoading = false
}: CalendarBookingSelectorProps) {
  const today = useMemo(() => new Date(), [])
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  // Group slots by date string YYYY-MM-DD
  const slotsByDate = useMemo(() => {
    const map = new Map<string, AvailableSlot[]>()
    for (const slot of slots) {
      try {
        let dateKey = ''
        if (slot.start_time.includes('T')) {
          dateKey = slot.start_time.split('T')[0]
        } else if (slot.date && slot.date.includes('-')) {
          dateKey = slot.date
        } else {
          // If relative label, fallback to today + offset
          const d = new Date(Date.now() + 86400000)
          dateKey = d.toISOString().split('T')[0]
        }

        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push(slot)
      } catch {
        // Safe skip on corrupt slot
      }
    }
    return map
  }, [slots])

  // Initial selected date defaults to the first available date with slots
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => {
    const dates = Array.from(slotsByDate.keys()).sort()
    return dates.length > 0 ? dates[0] : today.toISOString().split('T')[0]
  })

  // Available dates list
  const availableDateKeys = useMemo(() => {
    return Array.from(slotsByDate.keys())
  }, [slotsByDate])

  // Calendar Grid Calculations
  const year = currentMonthDate.getFullYear()
  const month = currentMonthDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' })

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1))
  }

  // Check if prev button should be disabled (cannot go to past months)
  const isPrevDisabled =
    year === today.getFullYear() && month <= today.getMonth()

  // Time slots for currently selected date
  const selectedDateSlots = useMemo(() => {
    return slotsByDate.get(selectedDateKey) || []
  }, [slotsByDate, selectedDateKey])

  // Format time display based on ISO
  const formatSlotTime = (isoString: string, displayLabel?: string) => {
    try {
      if (isoString.includes('T')) {
        const d = new Date(isoString)
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      }
    } catch {}
    if (displayLabel && displayLabel.includes(',')) {
      return displayLabel.split(',')[1]?.trim() || displayLabel
    }
    return '06:00 PM'
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
      {/* Timezone & Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>Select Date &amp; Time Slot</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose an available date to reveal bookable 30-minute consultation slots.
          </p>
        </div>

        {/* Time Zone Display */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shrink-0">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium text-slate-500">Timezone:</span>
          <span className="font-semibold text-slate-800">{userTimeZone}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Calendar Picker Panel (7 cols on desktop) */}
        <div className="md:col-span-7 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900">
              {monthName} {year}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isPrevDisabled}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty offset padding cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const cellDate = new Date(year, month, dayNum)
              const cellDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`

              const isPast =
                cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
              const hasSlots = slotsByDate.has(cellDateKey) && (slotsByDate.get(cellDateKey) || []).some(s => !s.is_booked)
              const isSelected = selectedDateKey === cellDateKey
              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === dayNum

              let cellClass = 'h-9 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all relative '

              if (isSelected) {
                cellClass += 'bg-blue-600 text-white shadow-xs font-bold ring-2 ring-blue-600 ring-offset-1 '
              } else if (isPast) {
                cellClass += 'text-slate-300 cursor-not-allowed '
              } else if (hasSlots) {
                cellClass += 'bg-white border border-blue-200 text-blue-900 hover:bg-blue-50 hover:border-blue-300 cursor-pointer shadow-2xs '
              } else {
                cellClass += 'text-slate-400 hover:bg-slate-100/60 cursor-not-allowed opacity-60 '
              }

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={isPast || !hasSlots}
                  onClick={() => {
                    setSelectedDateKey(cellDateKey)
                    // Auto-select first available slot for this date
                    const availableForDate = (slotsByDate.get(cellDateKey) || []).filter(s => !s.is_booked)
                    if (availableForDate.length > 0) {
                      onSelectSlot(availableForDate[0].id)
                    }
                  }}
                  className={cellClass}
                  title={
                    isPast
                      ? 'Past date'
                      : !hasSlots
                      ? 'No available slots'
                      : `${(slotsByDate.get(cellDateKey) || []).length} slots available`
                  }
                >
                  <span>{dayNum}</span>
                  {/* Slot indicator dot */}
                  {hasSlots && !isSelected && (
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-0.5" />
                  )}
                  {isToday && !isSelected && (
                    <span className="text-[9px] font-bold text-slate-500 absolute -top-1">·</span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Available Date</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span>Unavailable</span>
            </div>
          </div>
        </div>

        {/* Time Slot Panel (5 cols on desktop) */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Available Times
            </h4>
            <span className="text-xs font-medium text-slate-500">
              {new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              Refreshing mentor schedule...
            </div>
          ) : selectedDateSlots.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <AlertCircle className="w-5 h-5 text-slate-400 mx-auto" />
              <p>No available slots on this date.</p>
              <p className="text-[11px] text-slate-400">Please choose a highlighted date with slots from the calendar.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedDateSlots.map(slot => {
                const isSelected = selectedSlotId === slot.id
                const isBooked = slot.is_booked
                const timeStr = formatSlotTime(slot.start_time, slot.display_label)

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isBooked}
                    onClick={() => onSelectSlot(slot.id)}
                    className={`w-full p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between text-left cursor-pointer ${
                      isBooked
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-blue-50 border-2 border-blue-600 text-blue-900 font-bold shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{timeStr} ({slot.duration_minutes || 30} mins)</span>
                    </div>

                    {isBooked ? (
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                        Booked
                      </span>
                    ) : isSelected ? (
                      <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Selected
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        Available
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
