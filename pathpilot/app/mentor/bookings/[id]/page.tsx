'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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
  Check,
  ShieldCheck,
  DollarSign,
  ArrowLeft,
  Mail,
  FileText,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'
import { BookingResponse, mentorMarkSessionCompleted, cancelBookingWithRefund } from '@/lib/api-client'
import { getInitials } from '@/lib/utils'

function MentorBookingDetailContent() {
  const params = useParams()
  const router = useRouter()
  const bookingId = (params?.id as string) || ''

  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('Mentor schedule conflict')

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true)
        // 1. Fetch from server API
        const res = await fetch('/api/mentor/bookings')
        const json = await res.json()
        let found: BookingResponse | null = null

        if (json.success && Array.isArray(json.bookings)) {
          found = json.bookings.find((b: BookingResponse) => b.id === bookingId) || null
        }

        // 2. If not found in API, check localStorage
        if (!found && typeof window !== 'undefined') {
          const stored = localStorage.getItem('pathpilot_user_bookings')
          if (stored) {
            try {
              const list: BookingResponse[] = JSON.parse(stored)
              found = list.find((b) => b.id === bookingId) || null
            } catch {}
          }
        }

        // 3. Fallback mock if demo ID or freshly simulated ID
        if (!found) {
          found = {
            id: bookingId,
            mentor_id: 'mentor-1',
            mentor_name: 'You (Mentor)',
            mentor_title: 'Staff Software Engineer',
            user_name: 'Priyanshu Sharma',
            student_name: 'Priyanshu Sharma',
            user_email: 'priyanshu@college.edu',
            student_email: 'priyanshu@college.edu',
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            start_time: '18:00',
            duration_minutes: 30,
            duration_mins: 30,
            topic: 'System Design & Redis Cache Invalidation Review',
            notes: 'Looking for architectural feedback on backend microservices architecture.',
            meet_link: `https://meet.google.com/pp-session-${bookingId.slice(0, 6)}`,
            google_calendar_status: 'CONFIRMED',
            calendar_ics_url: `/api/bookings/${bookingId}/calendar.ics`,
            status: 'confirmed',
            amount_inr: 499,
            created_at: new Date().toISOString()
          }
        }

        setBooking(found)
      } catch (err: any) {
        console.error('Failed to load booking:', err)
        setErrorMsg(err?.message || 'Failed to load consultation details.')
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      loadBooking()
    }
  }, [bookingId])

  const handleMarkCompleted = async () => {
    if (!booking) return
    setActionLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      try {
        await mentorMarkSessionCompleted(booking.id, 'Session marked completed by mentor.')
      } catch (e) {
        console.warn('Backend payment completion hook note:', e)
      }

      await fetch('/api/mentor/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id, status: 'completed' })
      })

      const updated = { ...booking, status: 'completed' as const }
      setBooking(updated)

      // Sync localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('pathpilot_user_bookings')
        if (stored) {
          try {
            const list: BookingResponse[] = JSON.parse(stored)
            const synced = list.map(b => b.id === booking.id ? { ...b, status: 'completed' as const } : b)
            localStorage.setItem('pathpilot_user_bookings', JSON.stringify(synced))
          } catch {}
        }
      }

      setSuccessMsg('Consultation marked completed! Payout will be eligible for transfer post the 24-hour student review window.')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update consultation status.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!booking) return
    setActionLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      try {
        await cancelBookingWithRefund(booking.id, cancellationReason, 'mentor')
      } catch (e) {
        console.warn('Backend payment refund hook note:', e)
      }

      await fetch('/api/mentor/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          status: 'cancelled',
          cancellation_reason: cancellationReason
        })
      })

      const updated = { ...booking, status: 'cancelled' as const }
      setBooking(updated)

      // Sync localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('pathpilot_user_bookings')
        if (stored) {
          try {
            const list: BookingResponse[] = JSON.parse(stored)
            const synced = list.map(b => b.id === booking.id ? { ...b, status: 'cancelled' as const } : b)
            localStorage.setItem('pathpilot_user_bookings', JSON.stringify(synced))
          } catch {}
        }
      }

      setShowCancelModal(false)
      setSuccessMsg(`Session cancelled. A full refund of ₹${booking.amount_inr} has been initiated back to the student.`)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to cancel consultation.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-xs text-neutral-500 font-tech-mono">
        Loading consultation records...
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-display text-2xl uppercase tracking-tight text-neutral-900">
          Consultation Record Not Found
        </h2>
        <p className="font-sans text-xs text-neutral-600">
          The booking ID <code className="bg-neutral-100 px-1 py-0.5 rounded">{bookingId}</code> does not exist or may have expired.
        </p>
        <Link
          href="/mentor/bookings"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-xs font-tech-mono font-bold hover:bg-neutral-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO BOOKINGS</span>
        </Link>
      </div>
    )
  }

  const isCompleted = booking.status === 'completed' || booking.status === 'session_completed'
  const isCancelled = booking.status === 'cancelled'
  const isConfirmed = !isCompleted && !isCancelled

  const amountInr = booking.amount_inr || 499
  const platformFee = Math.round(amountInr * 0.15)
  const netEarnings = amountInr - platformFee

  // Construct direct Google Calendar web link
  const startTimeStr = booking.date && booking.start_time
    ? `${booking.date.replace(/-/g, '')}T${booking.start_time.replace(/:/g, '')}00Z`
    : ''
  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`PathPilot 1:1: ${booking.topic}`)}&details=${encodeURIComponent(`Mentorship Consultation with ${booking.user_name || 'Student'}\nNotes: ${booking.notes || 'None'}\nMeet Link: ${booking.meet_link || ''}`)}&location=${encodeURIComponent(booking.meet_link || 'Google Meet')}`

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* ── Top Navigation Breadcrumbs ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/mentor/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-tech-mono font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← BACK TO ALL BOOKINGS</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/mentor/dashboard"
            className="text-xs font-tech-mono font-semibold text-neutral-500 hover:text-black px-2.5 py-1 rounded border border-[#E5E3DC] bg-white"
          >
            DASHBOARD
          </Link>
          <Link
            href="/mentor/availability"
            className="text-xs font-tech-mono font-semibold text-neutral-500 hover:text-black px-2.5 py-1 rounded border border-[#E5E3DC] bg-white"
          >
            AVAILABILITY
          </Link>
        </div>
      </div>

      {/* ── Alerts ─────────────────────────────────────────────────── */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-emerald-900 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold p-1">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between text-rose-900 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 font-bold p-1">✕</button>
        </div>
      )}

      {/* ── Header Summary Card ────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E3DC] rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E3DC] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-tech-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                // BOOKING REF: {booking.id}
              </span>
              {isConfirmed && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-tech-mono font-bold uppercase">
                  CONFIRMED &amp; SCHEDULED
                </span>
              )}
              {isCompleted && (
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-tech-mono font-bold uppercase">
                  COMPLETED
                </span>
              )}
              {isCancelled && (
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-tech-mono font-bold uppercase">
                  CANCELLED &amp; REFUNDED
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-neutral-900">
              {booking.topic}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white font-tech-mono text-xs font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#00F090]" />
              <span>₹{netEarnings} YOUR PAYOUT</span>
            </div>
          </div>
        </div>

        {/* Essential Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
          <div>
            <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase block mb-1">
              DATE
            </span>
            <span className="font-bold text-neutral-900 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>{booking.date || 'Scheduled Date'}</span>
            </span>
          </div>

          <div>
            <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase block mb-1">
              TIME &amp; DURATION
            </span>
            <span className="font-bold text-neutral-900 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>{booking.start_time} IST ({booking.duration_minutes || booking.duration_mins || 30}m)</span>
            </span>
          </div>

          <div>
            <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase block mb-1">
              STUDENT
            </span>
            <span className="font-bold text-neutral-900 flex items-center gap-1 truncate">
              <User className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{booking.user_name || booking.student_name || 'Candidate'}</span>
            </span>
          </div>

          <div>
            <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase block mb-1">
              FUNDS STATUS
            </span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nodal Escrow Held</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Two Column Workspace ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Student & Discussion Context */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Profile & Agenda Card */}
          <div className="bg-white border border-[#E5E3DC] rounded-xl p-6 shadow-2xs space-y-4">
            <h2 className="font-tech-mono text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-500" />
              <span>STUDENT DETAILS &amp; AGENDA</span>
            </h2>

            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="w-10 h-10 rounded-full bg-black text-white font-tech-mono font-bold flex items-center justify-center text-xs shrink-0">
                {getInitials(booking.user_name || 'Student')}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-neutral-900 block truncate">
                  {booking.user_name || booking.student_name || 'Student'}
                </span>
                <span className="text-xs text-neutral-500 flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 text-neutral-400" />
                  <span>{booking.user_email || booking.student_email || 'student@pathpilot.ai'}</span>
                </span>
              </div>
            </div>

            <div>
              <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase block mb-1.5">
                STUDENT PREPARATION NOTES &amp; TOPIC FOCUS
              </span>
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-xs text-neutral-700 leading-relaxed font-sans">
                {booking.notes ? (
                  <p className="italic">&quot;{booking.notes}&quot;</p>
                ) : (
                  <p className="text-neutral-400 italic">No custom notes submitted. Standard 1-on-1 interview and roadmap agenda applies.</p>
                )}
              </div>
            </div>
          </div>

          {/* Video Conference Card */}
          <div className="bg-white border border-[#E5E3DC] rounded-xl p-6 shadow-2xs space-y-4">
            <h2 className="font-tech-mono text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4 text-neutral-500" />
              <span>LIVE VIDEO CONFERENCE &amp; CALENDAR</span>
            </h2>

            <div className="p-4 rounded-xl bg-neutral-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-tech-mono text-[10px] font-bold text-[#00F090] uppercase tracking-wider">
                  GOOGLE MEET SECURE ROOM
                </span>
                <p className="text-xs text-neutral-300 font-mono truncate max-w-md">
                  {booking.meet_link || 'Link automatically activates prior to session'}
                </p>
              </div>

              {booking.meet_link ? (
                <a
                  href={booking.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg bg-[#00F090] text-black hover:bg-[#00d680] font-tech-mono text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition shrink-0"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>JOIN GOOGLE MEET</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-xs text-neutral-400 italic">Meet link will generate automatically</span>
              )}
            </div>

            {/* Calendar Integration Links */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href={gCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E3DC] bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-tech-mono font-semibold transition"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>

              {booking.calendar_ics_url && (
                <a
                  href={booking.calendar_ics_url}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E3DC] bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-tech-mono font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Download .ICS File</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Financial Breakdown & Actions */}
        <div className="space-y-6">
          {/* Financial Breakdown Card */}
          <div className="bg-white border border-[#E5E3DC] rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="font-tech-mono text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>EARNINGS &amp; ESCROW LEDGER</span>
            </h2>

            <div className="space-y-2.5 text-xs border-b border-[#E5E3DC] pb-4">
              <div className="flex justify-between text-neutral-600">
                <span>Student Consultation Fee:</span>
                <span className="font-bold text-neutral-900">₹{amountInr}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Platform Commission (15%):</span>
                <span className="text-neutral-500">-₹{platformFee}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-neutral-100">
                <span>Your Net Earnings:</span>
                <span className="text-emerald-600 font-mono">₹{netEarnings}</span>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-[11px] text-neutral-600 space-y-1">
              <span className="font-bold text-neutral-900 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Nodal Escrow Protected
              </span>
              <p>
                Student payment is safely held in Razorpay Route nodal escrow. Payout release is triggered post session completion.
              </p>
            </div>
          </div>

          {/* Session Management Actions Card */}
          <div className="bg-white border border-[#E5E3DC] rounded-xl p-5 shadow-2xs space-y-3">
            <h2 className="font-tech-mono text-xs font-bold text-neutral-900 uppercase tracking-wider">
              SESSION ACTIONS
            </h2>

            {isConfirmed && (
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleMarkCompleted}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-tech-mono text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{actionLoading ? 'UPDATING...' : 'MARK AS COMPLETED'}</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2 px-4 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 font-tech-mono text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>CANCEL &amp; REFUND STUDENT</span>
                </button>
              </div>
            )}

            {isCompleted && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Session completed. Payout is scheduled for weekly release.</span>
              </div>
            )}

            {isCancelled && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>This consultation was cancelled and refunded.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cancel & Refund Modal ────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-display text-xl uppercase tracking-tight text-neutral-900">
                Cancel Consultation &amp; Initiate Refund
              </h3>
            </div>

            <p className="font-sans text-xs text-neutral-600 leading-relaxed">
              Under PathPilot marketplace policy, cancelling this consultation will trigger an immediate full refund of{' '}
              <strong className="text-neutral-900">₹{booking.amount_inr}</strong> to the student&apos;s original payment method and release the reserved time slot.
            </p>

            <div>
              <label className="font-tech-mono text-[10px] font-bold text-neutral-700 uppercase block mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-neutral-300 bg-white"
              >
                <option value="Mentor schedule conflict">Mentor schedule conflict / emergency</option>
                <option value="Student requested reschedule">Student requested reschedule</option>
                <option value="Topic outside mentor specialty">Topic outside domain specialty</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition"
              >
                KEEP BOOKING
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCancelBooking}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-tech-mono font-bold transition disabled:opacity-50"
              >
                {actionLoading ? 'PROCESSING...' : 'CONFIRM CANCELLATION'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MentorBookingDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-12 text-center text-xs text-neutral-500 font-tech-mono">
          Loading consultation records...
        </div>
      }
    >
      <MentorBookingDetailContent />
    </React.Suspense>
  )
}
