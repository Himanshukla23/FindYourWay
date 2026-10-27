'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Video,
  Download,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'
import { getBookings, cancelBooking, BookingResponse } from '@/lib/api-client'

export default function ConsultationsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const loadBookings = async () => {
    setIsLoading(true)
    try {
      const data = await getBookings()
      setBookings(data)
    } catch (err) {
      console.error('Failed to load bookings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this consultation? Your reserved slot will be released.')) {
      return
    }
    setCancellingId(id)
    try {
      await cancelBooking(id)
      await loadBookings()
    } catch (err) {
      console.error('Error cancelling booking:', err)
    } finally {
      setCancellingId(null)
    }
  }

  const backendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8000'

  const activeBookings = bookings.filter(b => b.status === 'confirmed')
  const pastOrCancelled = bookings.filter(b => b.status === 'cancelled')

  return (
    <div className="page-container animate-fade-in space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          1-on-1 Sessions
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Consultations &amp; Mentorship
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl">
          Track upcoming 1-on-1 sessions, join Google Meet rooms, download iCalendar invites, and manage schedule adjustments.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Loading your booked sessions...
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Consultations Scheduled Yet</h3>
            <p className="text-xs text-slate-600 mt-1">
              Connect with engineering leaders from Google, Microsoft, and Flipkart for mock interviews, resume feedback, and career roadmaps.
            </p>
          </div>
          <Link
            href="/mentors"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all"
          >
            <span>Browse Mentors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Bookings Section */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Upcoming Confirmed Sessions ({activeBookings.length})</span>
            </h2>

            {activeBookings.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 text-center">
                You have no upcoming active sessions. Browse mentors to book your next session.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBookings.map(booking => {
                  const icsUrl = booking.calendar_ics_url?.startsWith('http')
                    ? booking.calendar_ics_url
                    : `${backendUrl}${booking.calendar_ics_url}`

                  return (
                    <div
                      key={booking.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                              <CheckCircle2 className="w-3 h-3" /> Confirmed
                            </span>
                            <h3 className="text-base font-bold text-slate-900">
                              {booking.mentor_name}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {booking.mentor_title} • {booking.mentor_org}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            ₹{booking.amount_inr}
                          </span>
                        </div>

                        <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1.5">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>{booking.date} at {booking.start_time} (30 mins)</span>
                          </div>
                          <div className="text-slate-600 text-[11px]">
                            <strong>Topic:</strong> {booking.topic}
                          </div>
                          {booking.notes && (
                            <div className="text-slate-500 text-[11px] italic">
                              "{booking.notes}"
                            </div>
                          )}
                        </div>
                      </div>

                        {/* Card Action Controls */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {booking.meet_link ? (
                              <a
                                href={booking.meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition-all"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join Meet</span>
                              </a>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center gap-1 border border-slate-200">
                                <Video className="w-3 h-3 text-slate-400" />
                                <span>Google Meet (Pending Auth)</span>
                              </span>
                            )}

                            {booking.meet_link && (
                              <a
                                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`1:1 Mentorship: ${booking.mentor_name} (${booking.topic})`)}&details=${encodeURIComponent(`Topic: ${booking.topic}\nMentor: ${booking.mentor_name}\n\nJoin Google Meet: ${booking.meet_link}`)}&location=${encodeURIComponent(booking.meet_link)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-medium text-xs flex items-center gap-1.5 transition-all"
                              >
                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                <span>Google Calendar</span>
                              </a>
                            )}

                          <a
                            href={icsUrl}
                            download={`consultation-${booking.id}.ics`}
                            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>.ICS</span>
                          </a>
                        </div>

                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline disabled:opacity-50 cursor-pointer"
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Session'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Past / Cancelled Section */}
          {pastOrCancelled.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Cancelled / Historical Sessions ({pastOrCancelled.length})
              </h2>
              <div className="space-y-2">
                {pastOrCancelled.map(booking => (
                  <div
                    key={booking.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs text-slate-500"
                  >
                    <div>
                      <span className="font-semibold text-slate-700">{booking.mentor_name}</span> • {booking.topic}
                      <span className="block text-[11px] text-slate-400 mt-0.5">{booking.date} at {booking.start_time}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-bold uppercase">
                      Cancelled
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
