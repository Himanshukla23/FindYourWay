'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Video,
  Download,
  ExternalLink,
  Globe,
  Info
} from 'lucide-react'
import { DEMO_MENTORS } from '@/lib/demo-data'
import { getMentorSlots, createBooking, AvailableSlot, BookingResponse } from '@/lib/api-client'
import { CalendarBookingSelector } from '@/components/mentor/CalendarBookingSelector'

function BookMentorContent() {
  const router = useRouter()
  const params = useParams()
  const mentorId = (params?.mentorId as string) || 'mentor-1'
  const mentor = DEMO_MENTORS.find(m => m.id === mentorId) || DEMO_MENTORS[0]

  const [selectedTopic, setSelectedTopic] = useState<string>(
    mentor.mentoring_topics[0] || 'Resume Review & Career Strategy'
  )
  const [sessionDuration, setSessionDuration] = useState<number>(30)
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string>('')
  const [questions, setQuestions] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(null)
  const [bookingUserName, setBookingUserName] = useState<string>('Student')
  const [bookingUserEmail, setBookingUserEmail] = useState<string>('')

  // Detect student time zone with India fallback
  const [timeZone, setTimeZone] = useState<string>('Asia/Kolkata')

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detected) setTimeZone(detected)
    } catch {
      setTimeZone('Asia/Kolkata')
    }
  }, [])

  // Load live slots from server
  const fetchSlots = async () => {
    setIsLoadingSlots(true)
    try {
      const availableSlots = await getMentorSlots(mentorId)
      setSlots(availableSlots)
      const firstOpen = availableSlots.find(s => !s.is_booked)
      if (firstOpen) {
        setSelectedSlotId(firstOpen.id)
      } else if (availableSlots.length > 0) {
        setSelectedSlotId(availableSlots[0].id)
      }
    } catch (err) {
      console.warn('Failed to fetch mentor slots:', err)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    fetchSlots()

    // Sync authenticated student profile
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user && isMounted) {
            setBookingUserName(
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              (user.email ? user.email.split('@')[0] : 'Student')
            )
            setBookingUserEmail(user.email || '')
          }
        })
      }
    })

    return () => { isMounted = false }
  }, [mentorId])

  const selectedSlot = slots.find(s => s.id === selectedSlotId) || slots[0]

  // Calculated price based on duration
  const totalPrice = sessionDuration === 60 ? Math.round(mentor.session_price_inr * 1.8) : mentor.session_price_inr

  const handleConfirm = async () => {
    setErrorMsg(null)

    if (!selectedSlotId) {
      setErrorMsg('Please select a valid time slot from the calendar.')
      return
    }

    if (selectedSlot?.is_booked) {
      setErrorMsg('The selected slot is already booked. Please choose an available time slot.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createBooking({
        mentor_id: mentor.id,
        slot_id: selectedSlotId,
        topic: selectedTopic,
        notes: questions,
        user_name: bookingUserName,
        user_email: bookingUserEmail || `${bookingUserName.toLowerCase().replace(/\s+/g, '')}@student.pathpilot.ai`,
        amount_inr: totalPrice,
        time_zone: timeZone,
        duration_mins: sessionDuration
      })

      setConfirmedBooking(result)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to complete booking. Please try again or select another slot.')
      // Refresh slots in case of collision
      fetchSlots()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (confirmedBooking) {
    const backendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8000'
    const icsUrl = confirmedBooking.calendar_ics_url?.startsWith('http')
      ? confirmedBooking.calendar_ics_url
      : `${backendUrl}${confirmedBooking.calendar_ics_url || `/api/bookings/${confirmedBooking.id}/calendar.ics`}`

    const isGoogleMeetCreated = Boolean(confirmedBooking.meet_link || confirmedBooking.meeting_link)
    const meetUrl = confirmedBooking.meet_link || confirmedBooking.meeting_link

    return (
      <div className="page-container animate-fade-in max-w-2xl mx-auto py-10 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Booking Confirmed &amp; Reserved
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            1:1 Consultation with {mentor.full_name}
          </h2>
          <p className="text-xs text-slate-600 mt-1.5">
            Scheduled for{' '}
            <strong className="text-slate-900">
              {selectedSlot?.display_label || `${confirmedBooking.date || 'Scheduled date'} at ${confirmedBooking.start_time}`}
            </strong>
          </p>
        </div>

        {/* Meeting & Verification Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-xs space-y-4 shadow-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2.5">
            <span className="text-slate-500">Mentor:</span>
            <span className="text-slate-900 font-semibold">{mentor.full_name} ({mentor.organisation})</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2.5">
            <span className="text-slate-500">Topic:</span>
            <span className="text-slate-900 font-semibold">{confirmedBooking.topic}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2.5">
            <span className="text-slate-500">Duration &amp; Timezone:</span>
            <span className="text-slate-900 font-semibold">{confirmedBooking.duration_minutes || sessionDuration} Mins ({confirmedBooking.time_zone || timeZone})</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2.5">
            <span className="text-slate-500">Total Fee:</span>
            <span className="text-slate-900 font-bold">₹{confirmedBooking.amount_inr}</span>
          </div>

          {/* Genuine Google Meet Status Handling */}
          <div className="pt-2">
            {isGoogleMeetCreated ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-900 block">Official Google Meet Room Created</span>
                  <a
                    href={meetUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 underline font-semibold flex items-center gap-1 mt-0.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Google Meet: {meetUrl}</span>
                  </a>
                </div>
                <span className="px-2.5 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Verified
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Google Calendar Integration Awaiting Authorization</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Your mentorship session is securely reserved in the system database. The real Google Meet video conference link will be synchronized once Google Calendar API credentials (OAuth / Service Account) are authorized in the server environment.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isGoogleMeetCreated && (
            <a
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`1:1 Mentorship: ${mentor.full_name} (${confirmedBooking.topic})`)}&details=${encodeURIComponent(`Topic: ${confirmedBooking.topic}\nMentor: ${mentor.full_name} (${mentor.organisation})\n\nJoin Google Meet: ${meetUrl}`)}&location=${encodeURIComponent(meetUrl!)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Add to Google Calendar</span>
            </a>
          )}

          <a
            href={icsUrl}
            download={`mentorship-${confirmedBooking.id}.ics`}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .ICS Calendar</span>
          </a>

          <Link
            href="/consultations"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>View in My Consultations</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-in max-w-3xl mx-auto space-y-6 px-4 py-6">
      <Link
        href="/mentors"
        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Mentors Directory
      </Link>

      {/* Mentor Profile Brief Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex items-center gap-4">
        <img
          src={mentor.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
          alt={mentor.full_name}
          className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0 aspect-square"
        />
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
            Booking 1-on-1 Consultation
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5 truncate flex items-center gap-1.5">
            {mentor.full_name}
            {mentor.is_verified && <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />}
          </h1>
          <p className="text-xs text-slate-600">
            {mentor.title} at <strong className="text-slate-900 font-semibold">{mentor.organisation}</strong> • {mentor.years_experience} Yrs Experience
          </p>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Booking Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Step 1: Select Consultation Topic */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            1. Select Consultation Topic
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(mentor.mentoring_topics || []).map(topic => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={`p-3 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer ${
                  selectedTopic === topic
                    ? 'bg-blue-50 border-2 border-blue-600 text-blue-900 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Duration Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            2. Session Duration
          </label>
          <div className="flex items-center gap-3">
            {[30, 60].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => setSessionDuration(mins)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  sessionDuration === mins
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {mins} Minutes ({mins === 60 ? 'In-depth Mock / Teardown' : 'Standard Focus Session'})
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Interactive Calendar & Slot Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            3. Choose Date &amp; Time from Calendar
          </label>
          <CalendarBookingSelector
            slots={slots}
            selectedSlotId={selectedSlotId}
            onSelectSlot={id => setSelectedSlotId(id)}
            userTimeZone={timeZone}
            onTimeZoneChange={tz => setTimeZone(tz)}
            isLoading={isLoadingSlots}
          />
        </div>

        {/* Step 4: Questions / Preparation Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            4. Preparation Notes or Specific Questions (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Share your background, resume link, target companies, or specific technical dilemmas you would like the mentor to address..."
            value={questions}
            onChange={e => setQuestions(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Step 5: Order Summary & Review */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
            Booking Summary Review
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Selected Mentor:</span>
            <span className="font-semibold text-slate-900">{mentor.full_name} ({mentor.organisation})</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Focus Topic:</span>
            <span className="font-semibold text-slate-900 truncate max-w-xs">{selectedTopic}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Scheduled Slot:</span>
            <span className="font-semibold text-blue-700">
              {selectedSlot?.display_label || 'Select an available slot above'}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Time Zone:</span>
            <span className="font-semibold text-slate-800">{timeZone}</span>
          </div>
        </div>

        {/* Checkout & Submission Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Session Fee</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">₹{totalPrice}</span>
              <span className="text-xs text-slate-500">/ {sessionDuration} mins</span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedSlotId || selectedSlot?.is_booked}
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? 'Reserving Session...' : 'Confirm & Schedule Session'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BookMentorPage() {
  return (
    <React.Suspense
      fallback={
        <div className="page-container p-12 text-center text-xs text-slate-500">
          Loading mentor booking interface...
        </div>
      }
    >
      <BookMentorContent />
    </React.Suspense>
  )
}
