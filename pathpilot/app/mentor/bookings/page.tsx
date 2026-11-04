'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  ExternalLink,
  Download,
  Filter,
  Search,
  Check,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react'
import { BookingResponse, mentorMarkSessionCompleted, cancelBookingWithRefund } from '@/lib/api-client'
import { getInitials } from '@/lib/utils'

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled'

export default function MentorBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<BookingResponse | null>(null)

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true)
        const res = await fetch('/api/mentor/bookings')
        const json = await res.json()
        if (json.success && Array.isArray(json.bookings)) {
          setBookings(json.bookings)
        }
      } catch (err) {
        console.error('Failed to load bookings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [])

  // Update status (complete or cancel) with marketplace escrow hooks
  async function updateStatus(bookingId: string, newStatus: 'completed' | 'cancelled') {
    setActionLoadingId(bookingId)
    try {
      if (newStatus === 'completed') {
        try {
          await mentorMarkSessionCompleted(bookingId, 'Session marked completed by mentor.')
        } catch (e) {
          console.warn('Backend payment completion hook note:', e)
        }
      } else if (newStatus === 'cancelled') {
        try {
          await cancelBookingWithRefund(bookingId, 'Cancelled by mentor', 'mentor')
        } catch (e) {
          console.warn('Backend payment refund hook note:', e)
        }
      }

      await fetch('/api/mentor/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, status: newStatus }),
      })

      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
      )

      // Also sync to local storage if present
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('pathpilot_user_bookings')
        if (stored) {
          try {
            const list: BookingResponse[] = JSON.parse(stored)
            const updated = list.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
            localStorage.setItem('pathpilot_user_bookings', JSON.stringify(updated))
          } catch {}
        }
      }
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setActionLoadingId(null)
      setSelectedBookingForCancel(null)
    }
  }

  // Filter bookings based on activeTab and searchQuery
  const filteredBookings = bookings.filter(b => {
    const status = (b.status || '').toLowerCase()
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'upcoming' && (status === 'confirmed' || status === 'demo_confirmed' || status === 'pending')) ||
      (activeTab === 'completed' && status === 'completed') ||
      (activeTab === 'cancelled' && status === 'cancelled')

    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (b.user_name || '').toLowerCase().includes(q) ||
      (b.user_email || '').toLowerCase().includes(q) ||
      (b.topic || '').toLowerCase().includes(q)

    return matchesTab && matchesSearch
  })

  // Statistics
  const totalCount = bookings.length
  const upcomingCount = bookings.filter(b => {
    const s = (b.status || '').toLowerCase()
    return s === 'confirmed' || s === 'demo_confirmed' || s === 'pending'
  }).length
  const completedCount = bookings.filter(b => (b.status || '').toLowerCase() === 'completed').length
  const totalEarnings = bookings
    .filter(b => (b.status || '').toLowerCase() !== 'cancelled')
    .reduce((sum, b) => sum + (b.amount_inr || 500), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Consultation Session Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mentorship Bookings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review your upcoming 1-on-1 consultations, student candidate notes, and session attendance.
          </p>
        </div>

        <Link
          href="/mentor/availability"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto"
        >
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Manage Availability</span>
        </Link>
      </div>

      {/* ── Metrics Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Consultations</span>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{totalCount}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">All time sessions</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Sessions</span>
          <p className="text-2xl font-black text-indigo-600 mt-1.5">{upcomingCount}</p>
          <span className="text-[11px] text-indigo-500 font-medium mt-0.5 block">Ready to conduct</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
          <p className="text-2xl font-black text-emerald-600 mt-1.5">{completedCount}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Successfully held</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Earned</span>
          <p className="text-2xl font-black text-slate-900 mt-1.5">₹{totalEarnings.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Consultation proceeds</span>
        </div>
      </div>

      {/* ── Search & Filter Controls ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'upcoming', 'completed', 'cancelled'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search mentee or topic..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
          />
        </div>
      </div>

      {/* ── Bookings List ─────────────────────────────────────── */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your consultation ledger...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Consultations Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchQuery
              ? `No bookings matching "${searchQuery}". Try clearing your search query.`
              : activeTab === 'all'
              ? 'You do not have any consultations booked yet. Ensure your weekly availability schedule is active.'
              : `You have no ${activeTab} consultations at this time.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(b => {
            const isCompleted = (b.status || '').toLowerCase() === 'completed'
            const isCancelled = (b.status || '').toLowerCase() === 'cancelled'
            const isActionLoading = actionLoadingId === b.id

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {getInitials(b.user_name || 'Student')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{b.user_name}</h4>
                      <p className="text-xs text-slate-500">{b.user_email}</p>
                    </div>
                  </div>

                  {/* Status Badge & Price */}
                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      ₹{b.amount_inr || 500}
                    </span>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : isCancelled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        Cancelled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        Confirmed
                      </span>
                    )}
                  </div>
                </div>

                {/* Session Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px] mb-1">
                      SESSION TIMING
                    </span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.date}</span>
                    </p>
                    <p className="text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {b.start_time} ({b.duration_minutes || 30} mins)
                      </span>
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-slate-400 font-semibold block text-[11px] mb-1">
                      DISCUSSION TOPIC &amp; STUDENT PREPARATION NOTES
                    </span>
                    <p className="font-bold text-slate-800">{b.topic}</p>
                    {b.notes && (
                      <p className="text-slate-600 italic mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        &quot;{b.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {b.meet_link ? (
                      <a
                        href={b.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Google Meet</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
                        <Video className="w-3.5 h-3.5 text-slate-400" />
                        <span>Google Meet Link via Calendar Invite</span>
                      </span>
                    )}

                    {b.calendar_ics_url && (
                      <a
                        href={b.calendar_ics_url}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>.ics Calendar</span>
                      </a>
                    )}

                    <Link
                      href={`/mentor/bookings/${b.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-black rounded-lg hover:bg-slate-100 transition font-tech-mono"
                    >
                      <span>Full Details →</span>
                    </Link>
                  </div>

                  {/* Actions for Upcoming Sessions */}
                  {!isCompleted && !isCancelled && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => updateStatus(b.id, 'completed')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Completed</span>
                      </button>

                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => setSelectedBookingForCancel(b)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-semibold transition disabled:opacity-50"
                      >
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Cancel Confirmation Modal ─────────────────────────── */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Cancel Consultation Session</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel the session with{' '}
                <span className="font-bold text-slate-700">{selectedBookingForCancel.user_name}</span>{' '}
                scheduled for <span className="font-bold text-slate-700">{selectedBookingForCancel.date}</span> at{' '}
                <span className="font-bold text-slate-700">{selectedBookingForCancel.start_time}</span>?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              The student will be notified and this slot will be released back to your available pool.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForCancel(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              >
                Keep Session
              </button>
              <button
                type="button"
                onClick={() => updateStatus(selectedBookingForCancel.id, 'cancelled')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs"
              >
                Yes, Cancel Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
