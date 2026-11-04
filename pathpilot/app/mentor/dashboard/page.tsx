'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  Users,
  Settings,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Plus,
  DollarSign,
  CreditCard,
  AlertTriangle,
  ArrowDownLeft,
  Check
} from 'lucide-react'
import {
  BookingResponse,
  MentorFinancials,
  fetchMentorFinancials,
  requestMentorPayoutDisbursement
} from '@/lib/api-client'

export default function MentorDashboardPage() {
  const [mentorName, setMentorName] = useState('Mentor')
  const [mentorId, setMentorId] = useState('mentor-1')
  const [isApproved, setIsApproved] = useState(true)
  const [weeklyHours, setWeeklyHours] = useState(6)
  const [upcomingMeetings, setUpcomingMeetings] = useState<BookingResponse[]>([])
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [todayStr, setTodayStr] = useState('')

  // Marketplace Payouts & Protected Earnings
  const [financials, setFinancials] = useState<MentorFinancials | null>(null)
  const [isDisbursing, setIsDisbursing] = useState(false)
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null)
  const [payoutError, setPayoutError] = useState<string | null>(null)

  const loadFinancials = async (id: string) => {
    try {
      const data = await fetchMentorFinancials(id)
      setFinancials(data)
    } catch (err) {
      console.warn('Failed to fetch mentor financials:', err)
    }
  }

  const handleDisbursePayout = async () => {
    if (!financials || financials.payout_eligible_inr <= 0) return
    setIsDisbursing(true)
    setPayoutMsg(null)
    setPayoutError(null)

    try {
      const res = await requestMentorPayoutDisbursement(mentorId)
      setPayoutMsg(`Payout of ₹${res.amount_inr} successfully disbursed to your linked bank account!`)
      await loadFinancials(mentorId)
    } catch (err: any) {
      setPayoutError(err?.message || 'Failed to process payout disbursement.')
    } finally {
      setIsDisbursing(false)
    }
  }

  useEffect(() => {
    loadFinancials(mentorId)
  }, [mentorId])

  useEffect(() => {
    // 1. Load authenticated mentor info
    if (typeof window !== 'undefined') {
      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient()
        if (supabase) {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              const name =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                (user.email ? user.email.split('@')[0] : 'Mentor')
              setMentorName(name)
              const status = user.user_metadata?.mentor_status || 'approved'
              setIsApproved(status === 'approved')
            }
          })
        }
      })

      // 2. Load configured availability hours
      fetch('/api/mentor/availability')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.weekly_schedule) {
            const sched = data.data.weekly_schedule
            let totalMins = 0
            sched.forEach((d: any) => {
              if (d.is_active && Array.isArray(d.slots)) {
                d.slots.forEach((s: any) => {
                  if (s.start_time && s.end_time) {
                    const [sh, sm] = s.start_time.split(':').map(Number)
                    const [eh, em] = s.end_time.split(':').map(Number)
                    totalMins += (eh * 60 + em) - (sh * 60 + sm)
                  }
                })
              }
            })
            if (totalMins > 0) {
              setWeeklyHours(Math.round(totalMins / 60))
            }
          }
        })
        .catch(() => {})

      // 3. Load upcoming demo/mock bookings
      const storedBookings = localStorage.getItem('pathpilot_user_bookings')
      if (storedBookings) {
        try {
          const parsed = JSON.parse(storedBookings)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUpcomingMeetings(parsed)
          }
        } catch {}
      } else {
        // Sample initial meeting for demonstration
        setUpcomingMeetings([
          {
            id: 'demo-meet-1',
            mentor_id: 'mentor-1',
            mentor_name: 'You',
            mentor_title: 'Senior Engineer',
            user_name: 'Priyanshu Sharma',
            user_email: 'priyanshu@college.edu',
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            start_time: '18:00',
            duration_minutes: 30,
            topic: 'System Design & Redis Cache Invalidation Review',
            notes: 'Looking for feedback on backend microservices architecture.',
            meet_link: 'https://meet.google.com/xyz-demo-mock',
            google_calendar_status: 'CONFIRMED',
            calendar_ics_url: '',
            status: 'confirmed',
            amount_inr: 500,
            created_at: new Date().toISOString(),
          },
        ])
      }
      setTodayStr(new Date().toISOString().split('T')[0])
    }
  }, [])

  const todayMeetings = upcomingMeetings.filter((m) => todayStr && m.date === todayStr)

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* ── Welcome Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mentor Portal Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {mentorName}
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage your student consultation schedule, calendar availability, and confirmed bookings.
          </p>
        </div>

        {/* Quick Availability Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/mentor/availability"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Edit Weekly Schedule</span>
          </Link>
        </div>
      </div>

      {/* ── Approval Status Notice ─────────────────────────────────── */}
      {!isApproved && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Profile Pending Administrator Review</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your mentor application is currently in queue. You can configure your weekly availability schedule and complete your profile in the meantime. Once approved, your profile will appear on the public student marketplace.
            </p>
          </div>
        </div>
      )}

      {/* ── Active Dispute Notification ────────────────────────────── */}
      {financials && financials.disputed_sessions_count > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold">Active Consultation Dispute Flagged ({financials.disputed_sessions_count})</h4>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200 text-rose-800">
                Payout Frozen
              </span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              A candidate has reported an issue or absence for a recent session. Associated payout eligibility is temporarily suspended while our support team verifies meeting attendance logs.
            </p>
          </div>
        </div>
      )}

      {/* ── Payout Success Notification ────────────────────────────── */}
      {payoutMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-900 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{payoutMsg}</span>
          </div>
          <button onClick={() => setPayoutMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {payoutError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-red-900 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="font-semibold">{payoutError}</span>
          </div>
          <button onClick={() => setPayoutError(null)} className="text-red-700 hover:text-red-900 font-bold">✕</button>
        </div>
      )}

      {/* ── Protected Earnings & Payouts Hub ──────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                Protected Marketplace Payouts
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Razorpay Route Nodal Hold</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Mentor Earnings &amp; Settlement Balance
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDisbursePayout}
              disabled={isDisbursing || !financials || financials.payout_eligible_inr <= 0}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isDisbursing
                  ? 'Transferring...'
                  : financials && financials.payout_eligible_inr > 0
                  ? `Withdraw ₹${financials.payout_eligible_inr}`
                  : 'No Eligible Payout'}
              </span>
            </button>
          </div>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Earnings
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{financials?.total_earnings_inr || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Net mentor earnings (85%)</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Pending Earnings
              </span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-950 mt-1">
              ₹{financials?.pending_earnings_inr || 0}
            </div>
            <span className="text-[11px] text-amber-800 mt-1 block">In 24h review window</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Payout Eligible
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-1">
              ₹{financials?.payout_eligible_inr || 0}
            </div>
            <span className="text-[11px] text-emerald-800 mt-1 block">Cleared for settlement</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                Payout Completed
              </span>
              <Check className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-950 mt-1">
              ₹{financials?.payout_completed_inr || 0}
            </div>
            <span className="text-[11px] text-blue-800 mt-1 block">Disbursed to bank</span>
          </div>
        </div>

        {/* Protection & Settlement Explainer */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <span className="font-bold text-slate-800 block">How Delayed Mentor Payouts Work:</span>
          <p className="text-[11px] leading-relaxed">
            1. Students pay upfront when reserving a slot. Funds are deposited into an RBI-compliant nodal account.<br />
            2. When the call concludes, click <strong>&quot;Mark Consultation Completed&quot;</strong> in your bookings.<br />
            3. A 24-hour candidate review window opens. Once confirmed by the student (or if no dispute is raised in 24 hours), your earnings transition from <strong>Pending</strong> to <strong>Payout Eligible</strong>.
          </p>
        </div>
      </div>

      {/* ── Stats Overview Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Hours</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{weeklyHours} hrs</div>
          <span className="text-xs text-slate-500 mt-1 block">Recurring this week</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Meetings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{upcomingMeetings.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Scheduled consultations</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{todayMeetings.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Due today</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Status</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-slate-900 mt-2">
            {isApproved ? 'Verified & Listed' : 'Under Review'}
          </div>
          <Link
            href="/mentor/profile/edit"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold mt-1 inline-flex items-center gap-1"
          >
            <span>Edit Profile Details</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* ── Calendar Integration Status Card ──────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${calendarConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <h3 className="text-sm font-bold text-slate-900">
              Google Calendar &amp; Meet Synchronization
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Connect your Google account so consultation bookings generate genuine Google Meet meeting links and auto-populate your personal calendar.
          </p>
        </div>
        <button
          onClick={() => setCalendarConnected((c) => !c)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            calendarConnected
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
          }`}
        >
          {calendarConnected ? '✓ Google Calendar Connected' : 'Connect Google Calendar'}
        </button>
      </div>

      {/* ── Upcoming Meetings Section ─────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upcoming Student Consultations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Confirmed sessions with university candidates</p>
          </div>
          <Link
            href="/mentor/bookings"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingMeetings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No upcoming meetings scheduled</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ensure your weekly schedule has available time slots configured so students can book sessions.
            </p>
            <Link
              href="/mentor/availability"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline pt-2"
            >
              Configure Availability Schedule &rarr;
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{meeting.user_name || 'Student Candidate'}</span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{meeting.topic}</p>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{meeting.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{meeting.start_time} IST ({meeting.duration_minutes || 30} mins)</span>
                    </div>
                    {meeting.user_email && (
                      <span className="text-slate-400">{meeting.user_email}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start md:self-auto">
                  {meeting.meet_link ? (
                    <a
                      href={meeting.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meet</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Meet link will generate prior to call</span>
                  )}
                  <Link
                    href={`/mentor/bookings/${meeting.id}`}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-all"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
