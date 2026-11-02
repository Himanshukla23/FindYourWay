'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Copy,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  CalendarX,
  Layers,
} from 'lucide-react'
import {
  WeeklyDaySchedule,
  TimeSlotInterval,
  AvailabilityException,
  MentorSchedulingSettings,
} from '@/types'

const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'IST — India Standard Time (UTC+05:30)' },
  { value: 'UTC', label: 'UTC — Coordinated Universal Time (UTC+00:00)' },
  { value: 'America/New_York', label: 'EST/EDT — US Eastern Time' },
  { value: 'America/Chicago', label: 'CST/CDT — US Central Time' },
  { value: 'America/Los_Angeles', label: 'PST/PDT — US Pacific Time' },
  { value: 'Europe/London', label: 'GMT/BST — British Standard Time' },
  { value: 'Europe/Berlin', label: 'CET/CEST — Central European Time' },
  { value: 'Asia/Singapore', label: 'SGT — Singapore Time (UTC+08:00)' },
  { value: 'Asia/Dubai', label: 'GST — Gulf Standard Time (UTC+04:00)' },
]

export default function MentorAvailabilityPage() {
  const [schedule, setSchedule] = useState<WeeklyDaySchedule[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [settings, setSettings] = useState<MentorSchedulingSettings>({
    timezone: 'Asia/Kolkata',
    buffer_minutes: 15,
    notice_hours: 4,
    max_weeks_in_advance: 4,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // New exception form state
  const [newExDate, setNewExDate] = useState('')
  const [newExReason, setNewExReason] = useState('')
  const [isAddingException, setIsAddingException] = useState(false)
  const [minDate, setMinDate] = useState('')

  // Fetch availability configuration on mount
  useEffect(() => {
    setMinDate(new Date().toISOString().split('T')[0])
    async function loadAvailability() {
      try {
        setLoading(true)
        const res = await fetch('/api/mentor/availability')
        const json = await res.json()
        if (json.success && json.data) {
          setSchedule(json.data.weekly_schedule || [])
          setExceptions(json.data.exceptions || [])
          if (json.data.settings) {
            setSettings(json.data.settings)
          }
        }
      } catch (err: any) {
        console.error('Failed to load availability:', err)
        setErrorMessage('Could not load availability settings. Using defaults.')
      } finally {
        setLoading(false)
      }
    }
    loadAvailability()
  }, [])

  // Toggle Day active state
  function toggleDayActive(dayIndex: number) {
    setSchedule(prev =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day
        const willBeActive = !day.is_active
        return {
          ...day,
          is_active: willBeActive,
          slots:
            willBeActive && day.slots.length === 0
              ? [{ id: `slot-${Date.now()}`, start_time: '10:00', end_time: '14:00' }]
              : day.slots,
        }
      })
    )
  }

  // Add slot to a day
  function addSlot(dayIndex: number) {
    setSchedule(prev =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day
        const lastSlot = day.slots[day.slots.length - 1]
        let newStart = '15:00'
        let newEnd = '18:00'
        if (lastSlot && lastSlot.end_time < '21:00') {
          const [h] = lastSlot.end_time.split(':').map(Number)
          const nextH = Math.min(h + 1, 22)
          const nextEndH = Math.min(nextH + 2, 23)
          newStart = `${String(nextH).padStart(2, '0')}:00`
          newEnd = `${String(nextEndH).padStart(2, '0')}:00`
        }
        return {
          ...day,
          slots: [
            ...day.slots,
            { id: `slot-${Date.now()}-${Math.random()}`, start_time: newStart, end_time: newEnd },
          ],
        }
      })
    )
  }

  // Remove slot from a day
  function removeSlot(dayIndex: number, slotIndex: number) {
    setSchedule(prev =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day
        const updated = day.slots.filter((_, sIdx) => sIdx !== slotIndex)
        return {
          ...day,
          slots: updated,
          is_active: updated.length > 0 ? day.is_active : false,
        }
      })
    )
  }

  // Update slot time
  function updateSlotTime(
    dayIndex: number,
    slotIndex: number,
    field: 'start_time' | 'end_time',
    val: string
  ) {
    setSchedule(prev =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day
        const updated = [...day.slots]
        updated[slotIndex] = { ...updated[slotIndex], [field]: val }
        return { ...day, slots: updated }
      })
    )
  }

  // Quick Action: Copy Monday schedule to Weekdays (Tue - Fri)
  function copyMondayToWeekdays() {
    const monday = schedule.find(d => d.day_of_week === 1)
    if (!monday) return
    setSchedule(prev =>
      prev.map(day => {
        if (day.day_of_week >= 2 && day.day_of_week <= 5) {
          return {
            ...day,
            is_active: monday.is_active,
            slots: monday.slots.map(s => ({ ...s, id: `slot-${Date.now()}-${Math.random()}` })),
          }
        }
        return day
      })
    )
  }

  // Add Exception Date
  function handleAddException(e: React.FormEvent) {
    e.preventDefault()
    if (!newExDate) return

    // Prevent duplicate date
    if (exceptions.some(ex => ex.exception_date === newExDate)) {
      setErrorMessage(`A date override for ${newExDate} already exists.`)
      return
    }

    const newEx: AvailabilityException = {
      id: `ex-${Date.now()}`,
      exception_date: newExDate,
      is_unavailable: true,
      reason: newExReason.trim() || 'Blocked / Vacation',
    }

    setExceptions(prev => [...prev, newEx].sort((a, b) => a.exception_date.localeCompare(b.exception_date)))
    setNewExDate('')
    setNewExReason('')
    setIsAddingException(false)
  }

  // Remove Exception
  function removeException(id?: string, date?: string) {
    setExceptions(prev => prev.filter(ex => (id ? ex.id !== id : ex.exception_date !== date)))
  }

  // Calculate day total hours
  function calculateDayHours(slots: TimeSlotInterval[]): number {
    return slots.reduce((total, s) => {
      if (!s.start_time || !s.end_time || s.start_time >= s.end_time) return total
      const [sh, sm] = s.start_time.split(':').map(Number)
      const [eh, em] = s.end_time.split(':').map(Number)
      const diffMinutes = eh * 60 + em - (sh * 60 + sm)
      return total + diffMinutes / 60
    }, 0)
  }

  const totalWeeklyHours = schedule
    .filter(d => d.is_active)
    .reduce((sum, d) => sum + calculateDayHours(d.slots), 0)

  const activeDaysCount = schedule.filter(d => d.is_active && d.slots.length > 0).length

  // Save changes
  async function handleSave() {
    setSaving(true)
    setSaveSuccess(false)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/mentor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekly_schedule: schedule,
          exceptions,
          settings,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save availability settings.')
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while saving.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading your availability schedule...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduling & Consultation Hours</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Availability & Working Hours
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Configure your recurring weekly open windows, buffer rules, and holiday overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={copyMondayToWeekdays}
            title="Duplicate Monday's time intervals across Tuesday through Friday"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Copy Mon to Weekdays</span>
            <span className="md:hidden">Copy Mon</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Schedule</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Scheduling Error</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold">Availability Updated</p>
            <p className="text-xs text-emerald-700">
              Your consultation schedule has been saved and will be reflected on your mentee booking slots.
            </p>
          </div>
        </div>
      )}

      {/* ── Main Grid Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left 2 Cols: Weekly Calendar & Overrides */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Weekly Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Weekly Recurring Hours</h2>
                  <p className="text-xs text-slate-500">
                    Set specific consultation windows that automatically repeat each week.
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {totalWeeklyHours.toFixed(1)} hrs / week
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {schedule.map((day, dayIdx) => {
                const dayHours = calculateDayHours(day.slots)
                return (
                  <div
                    key={day.day_of_week}
                    className={`p-4 sm:p-5 transition-colors ${
                      day.is_active ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Day Label & Toggle */}
                      <div className="flex items-center gap-3 sm:w-44 shrink-0">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day.is_active}
                            onChange={() => toggleDayActive(dayIdx)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>

                        <div>
                          <p
                            className={`text-sm font-bold ${
                              day.is_active ? 'text-slate-800' : 'text-slate-400'
                            }`}
                          >
                            {day.day_name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {day.is_active ? (
                              <span className="text-emerald-600 font-medium">
                                {dayHours > 0 ? `${dayHours.toFixed(1)}h available` : 'Active'}
                              </span>
                            ) : (
                              'Unavailable'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Time Slots Area */}
                      <div className="flex-1 space-y-2.5">
                        {!day.is_active ? (
                          <div className="text-xs text-slate-400 italic py-1.5">
                            Off — no sessions will be booked on this day.
                          </div>
                        ) : (
                          <>
                            {day.slots.map((slot, sIdx) => (
                              <div
                                key={slot.id || sIdx}
                                className="flex items-center gap-2 sm:gap-3 flex-wrap"
                              >
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
                                  <input
                                    type="time"
                                    value={slot.start_time}
                                    onChange={e =>
                                      updateSlotTime(dayIdx, sIdx, 'start_time', e.target.value)
                                    }
                                    className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
                                  />
                                  <span className="text-slate-400 text-xs font-bold">–</span>
                                  <input
                                    type="time"
                                    value={slot.end_time}
                                    onChange={e =>
                                      updateSlotTime(dayIdx, sIdx, 'end_time', e.target.value)
                                    }
                                    className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeSlot(dayIdx, sIdx)}
                                  title="Remove slot"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addSlot(dayIdx)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 py-1 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Interval</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. Date-Specific Exceptions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                  <CalendarX className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Date Overrides & Blockouts</h2>
                  <p className="text-xs text-slate-500">
                    Block specific holidays, exam dates, or out-of-office vacations.
                  </p>
                </div>
              </div>

              {!isAddingException && (
                <button
                  type="button"
                  onClick={() => setIsAddingException(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Block a Date</span>
                </button>
              )}
            </div>

            <div className="p-5">
              {/* Add form */}
              {isAddingException && (
                <form
                  onSubmit={handleAddException}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Add New Blocked Date
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingException(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Select Date
                      </label>
                      <input
                        type="date"
                        required
                        value={newExDate}
                        min={minDate || undefined}
                        onChange={e => setNewExDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Reason (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. National Holiday, Vacation"
                        value={newExReason}
                        onChange={e => setNewExReason(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                    >
                      Add Blockout
                    </button>
                  </div>
                </form>
              )}

              {/* List of exceptions */}
              {exceptions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-slate-600">No date overrides configured</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Your weekly recurring hours will apply normally on all upcoming days.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {exceptions.map(ex => {
                    const d = new Date(ex.exception_date)
                    const formatted = !isNaN(d.getTime())
                      ? d.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : ex.exception_date
                    return (
                      <div
                        key={ex.id || ex.exception_date}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{formatted}</p>
                            <p className="text-[11px] text-slate-500">
                              {ex.reason || 'All Day Unavailable'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeException(ex.id, ex.exception_date)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Scheduling Settings & Live Summary */}
        <div className="space-y-6">
          {/* Scheduling Rules Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Booking Rules & Timezone</h3>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Your Primary Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Mentees see slots automatically converted to their local device timezone.
              </p>
            </div>

            {/* Buffer between sessions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Buffer Time Between Calls
              </label>
              <select
                value={settings.buffer_minutes}
                onChange={e =>
                  setSettings({ ...settings, buffer_minutes: parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
              >
                <option value={0}>No buffer (Back-to-back)</option>
                <option value={10}>10 minutes buffer</option>
                <option value={15}>15 minutes buffer (Recommended)</option>
                <option value={30}>30 minutes buffer</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Prevents consecutive calls from overlapping or running late.
              </p>
            </div>

            {/* Minimum notice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Minimum Notice Required
              </label>
              <select
                value={settings.notice_hours}
                onChange={e =>
                  setSettings({ ...settings, notice_hours: parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
              >
                <option value={1}>1 hour prior</option>
                <option value={2}>2 hours prior</option>
                <option value={4}>4 hours prior (Recommended)</option>
                <option value={12}>12 hours prior</option>
                <option value={24}>24 hours prior (1 day)</option>
                <option value={48}>48 hours prior (2 days)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Disallows surprise last-minute bookings without prep time.
              </p>
            </div>

            {/* Booking window */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Maximum Advance Window
              </label>
              <select
                value={settings.max_weeks_in_advance}
                onChange={e =>
                  setSettings({ ...settings, max_weeks_in_advance: parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
              >
                <option value={2}>2 weeks in advance</option>
                <option value={4}>4 weeks in advance (Recommended)</option>
                <option value={8}>8 weeks in advance</option>
              </select>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold">Schedule Health</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-2xl font-black text-white">{activeDaysCount}</p>
                <p className="text-[11px] text-slate-300">Active Days / Wk</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-2xl font-black text-white">{totalWeeklyHours.toFixed(1)}h</p>
                <p className="text-[11px] text-slate-300">Weekly Open Time</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Mentees booking with you will pick from slots generated according to your chosen weekly
              intervals, respecting your buffer and advance notice constraints.
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Blocked Dates:</span>
              <span className="font-bold text-amber-300">{exceptions.length} override(s)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
