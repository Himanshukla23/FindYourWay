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
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  FileText,
  Check,
  Star,
  RefreshCw
} from 'lucide-react'
import {
  getBookings,
  BookingResponse,
  studentConfirmSessionCompleted,
  studentReportIssue,
  cancelBookingWithRefund,
  fetchStudentFinancials,
  StudentFinancials
} from '@/lib/api-client'

export default function ConsultationsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'sessions' | 'payments_refunds'>('sessions')
  const [studentEmail, setStudentEmail] = useState<string>('priyanshu@college.edu')
  const [financials, setFinancials] = useState<StudentFinancials | null>(null)

  // Issue / Mentor No-Show Report Modal
  const [reportIssueModalBooking, setReportIssueModalBooking] = useState<BookingResponse | null>(null)
  const [issueReason, setIssueReason] = useState<string>('mentor_no_show')
  const [issueDesc, setIssueDesc] = useState<string>('')

  // Confirmation Modal
  const [confirmModalBooking, setConfirmModalBooking] = useState<BookingResponse | null>(null)
  const [starRating, setStarRating] = useState<number>(5)
  const [sessionFeedback, setSessionFeedback] = useState<string>('')

  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadFinancials = async (email: string) => {
    try {
      const data = await fetchStudentFinancials(email)
      setFinancials(data)
    } catch (err) {
      console.warn('Failed to fetch student financials:', err)
    }
  }

  const loadBookings = async () => {
    setIsLoading(true)
    try {
      const data = await getBookings()
      setBookings(data || [])
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
    if (typeof window !== 'undefined') {
      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient()
        if (supabase) {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user?.email) {
              setStudentEmail(user.email)
              loadFinancials(user.email)
            } else {
              loadFinancials('priyanshu@college.edu')
            }
          })
        }
      })
    }
  }, [])

  const handleConfirmCompletion = async (bookingId: string) => {
    setActionLoadingId(bookingId)
    try {
      await studentConfirmSessionCompleted(bookingId, starRating, sessionFeedback)
      setActionSuccessMsg('Thank you! Session verified and mentor payout has been approved for release.')
      setConfirmModalBooking(null)
      await loadBookings()
      await loadFinancials(studentEmail)
    } catch (err: any) {
      alert(err?.message || 'Failed to confirm session.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleSubmitDispute = async () => {
    if (!reportIssueModalBooking) return
    setActionLoadingId(reportIssueModalBooking.id)
    try {
      const res = await studentReportIssue(
        reportIssueModalBooking.id,
        issueReason,
        issueDesc || 'Student reported issue through consultation dashboard.'
      )
      if (res.refund_initiated) {
        setActionSuccessMsg(`Mentor absence confirmed. Payout has been frozen and a full refund of ₹${reportIssueModalBooking.amount_inr} has been initiated to your original payment method.`)
      } else {
        setActionSuccessMsg('Your report has been submitted. Mentor payout is frozen pending support investigation.')
      }
      setReportIssueModalBooking(null)
      await loadBookings()
      await loadFinancials(studentEmail)
    } catch (err: any) {
      alert(err?.message || 'Failed to submit issue report.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this consultation? Under our cancellation policy, refund will be processed to your original payment method.')) {
      return
    }
    setCancellingId(id)
    try {
      const res = await cancelBookingWithRefund(id, 'Student cancelled session', 'student')
      setActionSuccessMsg(res.message || 'Consultation cancelled and refund initiated.')
      await loadBookings()
      await loadFinancials(studentEmail)
    } catch (err: any) {
      console.error('Error cancelling booking:', err)
      alert(err?.message || 'Failed to cancel consultation.')
    } finally {
      setCancellingId(null)
    }
  }

  const backendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8000'

  const activeBookings = bookings.filter(b => {
    const s = (b.status || '').toLowerCase()
    return s === 'confirmed' || s === 'session_scheduled' || s === 'demo_confirmed' || s === 'pending'
  })
  const completedBookings = bookings.filter(b => {
    const s = (b.status || '').toLowerCase()
    return s === 'completed' || s === 'session_completed'
  })
  const pastOrCancelled = bookings.filter(b => {
    const s = (b.status || '').toLowerCase()
    return s === 'cancelled' || s === 'disputed' || s === 'refunded'
  })

  return (
    <div className="page-container animate-fade-in space-y-8">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>1-on-1 Mentorship</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Consultations &amp; Protected Payments
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Track scheduled sessions, join Google Meet rooms, confirm completed consultations, or report mentor issues under our buyer protection guarantee.
          </p>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sessions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Sessions ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('payments_refunds')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payments_refunds'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Payment &amp; Refund Ledger</span>
          </button>
        </div>
      </div>

      {/* ── Action Success Alert ────────────────────────────────────── */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-900 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Tab 1: Consultations View ───────────────────────────────── */}
      {activeTab === 'sessions' && (
        <>
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
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Upcoming Active Sessions ({activeBookings.length})</span>
                  </h2>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nodal Escrow Protected</span>
                  </span>
                </div>

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
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Payment in Escrow
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
                                <span>{booking.date || 'Scheduled'} at {booking.start_time} (30 mins)</span>
                              </div>
                              <div className="text-slate-600 text-[11px]">
                                <strong>Topic:</strong> {booking.topic}
                              </div>
                              {booking.notes && (
                                <div className="text-slate-500 text-[11px] italic">
                                  &quot;{booking.notes}&quot;
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Meeting Actions & Protection */}
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
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
                                className="text-rose-600 hover:text-rose-800 text-xs font-semibold px-2 py-1 transition-colors disabled:opacity-50"
                              >
                                {cancellingId === booking.id ? 'Processing...' : 'Cancel Session'}
                              </button>
                            </div>

                            {/* Candidate Protection Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                onClick={() => setConfirmModalBooking(booking)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Confirm Completed</span>
                              </button>

                              <button
                                onClick={() => setReportIssueModalBooking(booking)}
                                className="px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Report Mentor No-Show</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Tab 2: Financial & Protection Ledger ────────────────────── */}
      {activeTab === 'payments_refunds' && (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Payments Made
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                ₹{financials?.payment_history.reduce((acc, p) => acc + p.amount_inr, 0) || 0}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {financials?.payment_history.length || 0} total transactions
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Refunds Processed
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-2">
                ₹{financials?.refunds.reduce((acc, r) => acc + r.amount_inr, 0) || 0}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {financials?.refunds.length || 0} refunds credited
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Buyer Protection Guarantee
              </span>
              <div className="text-base font-bold text-slate-800 mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>100% Protected</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                Under RBI PA/PG Nodal Escrow Hold
              </span>
            </div>
          </div>

          {/* Refund Receipts Ledger */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Refunds &amp; Dispute Receipts</h3>
            {(!financials || financials.refunds.length === 0) ? (
              <p className="text-xs text-slate-500">No refunds have been processed for your account.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {financials.refunds.map(ref => (
                  <div key={ref.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{ref.reason}</span>
                      <span className="text-slate-400 text-[10px]">
                        Ref ID: {ref.provider_refund_id || ref.id} • {ref.initiated_at.split('T')[0]}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600">+₹{ref.amount_inr}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Report Issue / Mentor No-Show ───────────────────── */}
      {reportIssueModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Report Issue or Mentor Absence</h3>
              <p className="text-xs text-slate-500 mt-1">
                Consultation with <strong className="text-slate-800">{reportIssueModalBooking.mentor_name}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Reporting
                </label>
                <select
                  value={issueReason}
                  onChange={e => setIssueReason(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-800"
                >
                  <option value="mentor_no_show">Mentor No-Show (Mentor did not attend the Google Meet)</option>
                  <option value="technical_failure">Technical Failure / Video disruption</option>
                  <option value="incomplete_session">Incomplete Session (Less than 10 mins)</option>
                  <option value="poor_quality">Significant Quality Divergence</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Evidence Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Please describe what happened (e.g. joined meet room, waited 15 minutes, mentor was absent)..."
                  value={issueDesc}
                  onChange={e => setIssueDesc(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-800"
                />
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 leading-relaxed">
              <strong>Student Protection Guarantee:</strong> Submitting this report immediately freezes mentor payout release. If mentor absence is confirmed, 100% refund of ₹{reportIssueModalBooking.amount_inr} is automatically credited.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReportIssueModalBooking(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitDispute}
                disabled={actionLoadingId === reportIssueModalBooking.id}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs disabled:opacity-50"
              >
                {actionLoadingId === reportIssueModalBooking.id ? 'Submitting...' : 'Freeze Payout & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Student Confirm Completion ──────────────────────── */}
      {confirmModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Confirm Consultation Completion</h3>
              <p className="text-xs text-slate-500 mt-1">
                Confirm your 1-on-1 session with <strong className="text-slate-800">{confirmModalBooking.mentor_name}</strong> was conducted successfully.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rate your session (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= starRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Feedback for Mentor
                </label>
                <textarea
                  rows={2}
                  placeholder="Share a brief note on what you found most helpful..."
                  value={sessionFeedback}
                  onChange={e => setSessionFeedback(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-800"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
              Confirming releases the nodal escrow hold and marks your mentor&apos;s earnings as eligible for settlement.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalBooking(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCompletion(confirmModalBooking.id)}
                disabled={actionLoadingId === confirmModalBooking.id}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50"
              >
                {actionLoadingId === confirmModalBooking.id ? 'Releasing...' : 'Confirm & Release Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
