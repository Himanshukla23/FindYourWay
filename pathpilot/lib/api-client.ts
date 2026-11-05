/**
 * PathPilot API Client
 * Seamlessly interfaces with the Python FastAPI Backend (http://localhost:8000)
 * with robust, transparent fallback to local demo models so UI/UX is 100% resilient.
 */

import { DEMO_MENTORS } from './demo-data'
import { FALLBACK_PM_JOBS } from './jobs-fallback'

export interface Mentor {
  id: string
  user_id?: string | null
  email?: string
  full_name: string
  title: string
  organisation: string
  avatar_url?: string | null
  bio: string
  domains: string[]
  skills: string[]
  mentoring_topics: string[]
  session_price_inr: number
  session_duration_mins?: number[]
  rating: number
  review_count: number
  is_verified: boolean
  is_demo_profile?: boolean
  is_available?: boolean
  years_experience: number
  linkedin_url?: string | null
  created_at?: string
}

export interface AvailableSlot {
  id: string
  mentor_id: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  is_booked: boolean
  display_label: string
}

export interface BookingPayload {
  mentor_id: string
  slot_id: string
  topic: string
  notes?: string
  user_name: string
  user_email: string
  amount_inr?: number
  time_zone?: string
  duration_mins?: number
}

export interface BookingResponse {
  id: string
  mentor_id: string
  mentor_name: string
  mentor_title: string
  mentor_org?: string
  mentor_organisation?: string
  mentor_email?: string
  user_name?: string
  student_name?: string
  user_email?: string
  student_email?: string
  date?: string
  start_time: string
  end_time?: string
  slot_label?: string
  time_zone?: string
  duration_minutes?: number
  duration_mins?: number
  topic: string
  notes?: string
  meet_link?: string | null
  meeting_link?: string | null
  google_event_id?: string | null
  google_calendar_status?: 'CONFIRMED' | 'AWAITING_CREDENTIALS' | 'FAILED' | string
  calendar_ics_url: string
  ics_calendar_url?: string
  status: 'confirmed' | 'cancelled' | 'pending' | 'DEMO_CONFIRMED' | 'CONFIRMED' | 'CANCELLED' | string
  amount_inr: number
  created_at: string
}

export interface ResumeParseResult {
  full_name?: string
  email?: string
  phone?: string
  summary: string
  education?: {
    degree?: string
    branch?: string
    college?: string
    graduation_year?: string
  }
  skills_breakdown?: {
    technical: string[]
    non_technical: string[]
  }
  skills: string[]
  projects?: Array<{
    title: string
    description: string
    technologies: string[]
  }>
  experience?: Array<{
    company: string
    role: string
    duration?: string
    description?: string
  }>
  certifications?: string[]
  links?: Array<{
    type: string
    url: string
  }>
  inferred_interests?: string[]
  confidence_notes?: string
  strengths: string[]
  gaps: string[]
  recommendedRoles: Array<{
    title: string
    match: number
    domain: string
    category?: string
    reasoning?: string
  }>
}

export interface RoadmapResult {
  roleTitle: string
  hoursPerWeek: number
  estimatedWeeks: number
  difficulty: string
  prerequisites: string[]
  tasks: Array<{
    id: string
    phase?: string
    title: string
    desc: string
    deliverable?: string
    hours: number
    skills: string[]
    resources?: string[]
    completed?: boolean
    notes?: string
    repoUrl?: string
  }>
  capstoneProject?: {
    title: string
    description: string
    deliverables: string[]
    recommendedStack: string[]
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8000'

let backendReachable: boolean | null = null
let lastHealthCheckTime = 0
const HEALTH_CACHE_TTL = 30000 // 30s cache

export function isBackendUsable(): boolean {
  // If deployed in production (e.g. Vercel) and BACKEND_URL is localhost, cannot connect
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && BACKEND_URL.includes('localhost')) {
    return false
  }
  if (backendReachable === false && Date.now() - lastHealthCheckTime < HEALTH_CACHE_TTL) {
    return false
  }
  return true
}

function markBackendStatus(status: boolean) {
  backendReachable = status
  lastHealthCheckTime = Date.now()
}

function filterDemoMentors(params?: { domain?: string; search?: string; sort_by?: string }): Mentor[] {
  let filtered = [...DEMO_MENTORS]
  if (params?.search) {
    const s = params.search.toLowerCase()
    filtered = filtered.filter(
      (m) =>
        m.full_name.toLowerCase().includes(s) ||
        m.organisation.toLowerCase().includes(s) ||
        m.skills.some((sk) => sk.toLowerCase().includes(s))
    )
  }
  if (params?.domain && params.domain !== 'all') {
    const d = params.domain.toLowerCase()
    filtered = filtered.filter((m) =>
      m.domains.some((dm) => dm.toLowerCase().includes(d))
    )
  }
  return filtered
}

/**
 * Fetch mentors: queries Next.js Supabase API first so newly onboarded mentors appear live!
 */
export async function getMentors(params?: {
  domain?: string
  search?: string
  sort_by?: string
}): Promise<Mentor[]> {
  const query = new URLSearchParams()
  if (params?.domain && params.domain !== 'all') query.set('domain', params.domain)
  if (params?.search) query.set('search', params.search)
  if (params?.sort_by) query.set('sort_by', params.sort_by)
  const qs = query.toString() ? '?' + query.toString() : ''

  // 1. Try local Next.js API first (returns live database mentors + curated seed mentors)
  try {
    const res = await fetch(`/api/mentors${qs}`, { signal: AbortSignal.timeout(3500) })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.mentors) && data.mentors.length > 0) {
        return data.mentors
      }
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch (localErr) {
    // Fall through to external backend or demo data
  }

  if (isBackendUsable()) {
    try {
      const url = `${BACKEND_URL}/api/mentors${qs}`
      const res = await fetch(url, { signal: AbortSignal.timeout(1200) })

      if (res.ok) {
        markBackendStatus(true)
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) return data
        if (data?.mentors && Array.isArray(data.mentors) && data.mentors.length > 0) return data.mentors
      }
    } catch {
      markBackendStatus(false)
    }
  }

  return filterDemoMentors(params)
}

/**
 * Fetch single mentor by ID (supports real DB mentors and demo mentors)
 */
export async function getMentorById(mentorId: string): Promise<Mentor | null> {
  // 1. Try local Next.js API first
  try {
    const res = await fetch(`/api/mentors/${mentorId}`, { signal: AbortSignal.timeout(3500) })
    if (res.ok) {
      const data = await res.json()
      if (data && data.id) return data
    }
  } catch (localErr) {
    // Fall through
  }

  if (isBackendUsable()) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/mentors/${mentorId}`, {
        signal: AbortSignal.timeout(1000),
      })
      if (res.ok) {
        markBackendStatus(true)
        return await res.json()
      }
    } catch {
      markBackendStatus(false)
    }
  }

  return DEMO_MENTORS.find((m) => m.id === mentorId) || DEMO_MENTORS[0] || null
}

/**
 * Fetch bookable slots for a mentor
 */
export async function getMentorSlots(mentorId: string): Promise<AvailableSlot[]> {
  if (isBackendUsable()) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/mentors/${mentorId}/slots`, {
        signal: AbortSignal.timeout(1000),
      })
      if (res.ok) {
        markBackendStatus(true)
        const json = await res.json()
        if (Array.isArray(json) && json.length > 0) return json
        if (json?.slots && Array.isArray(json.slots) && json.slots.length > 0) return json.slots
      }
    } catch {
      markBackendStatus(false)
    }
  }

  // Dynamic slot generation from mentor availability & existing bookings
  try {
    const { generateAvailableSlots } = await import('./scheduling/slot-generator')
    const existingBookings = getLocalBookings()

    // Check if customized availability exists in cookies
    let schedule = [
      { day_of_week: 1, day_name: 'Monday', is_active: true, slots: [{ start_time: '10:00', end_time: '13:00' }, { start_time: '15:00', end_time: '18:00' }] },
      { day_of_week: 2, day_name: 'Tuesday', is_active: true, slots: [{ start_time: '10:00', end_time: '13:00' }, { start_time: '15:00', end_time: '18:00' }] },
      { day_of_week: 3, day_name: 'Wednesday', is_active: true, slots: [{ start_time: '10:00', end_time: '13:00' }, { start_time: '15:00', end_time: '18:00' }] },
      { day_of_week: 4, day_name: 'Thursday', is_active: true, slots: [{ start_time: '10:00', end_time: '13:00' }, { start_time: '15:00', end_time: '18:00' }] },
      { day_of_week: 5, day_name: 'Friday', is_active: true, slots: [{ start_time: '10:00', end_time: '13:00' }, { start_time: '14:00', end_time: '17:00' }] },
      { day_of_week: 6, day_name: 'Saturday', is_active: true, slots: [{ start_time: '11:00', end_time: '14:00' }] },
      { day_of_week: 0, day_name: 'Sunday', is_active: false, slots: [] },
    ]
    let exceptions: any[] = []
    let settings: any = { buffer_minutes: 15, notice_hours: 4, timezone: 'Asia/Kolkata' }

    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/pathpilot_mentor_availability=([^;]+)/)
      if (match) {
        try {
          const parsed = JSON.parse(decodeURIComponent(match[1]))
          if (parsed.weekly_schedule) schedule = parsed.weekly_schedule
          if (parsed.exceptions) exceptions = parsed.exceptions
          if (parsed.settings) settings = parsed.settings
        } catch { }
      }
    }

    const calculatedSlots = generateAvailableSlots({
      mentorId,
      weeklySchedule: schedule,
      exceptions,
      settings,
      existingBookings,
      sessionDurationMins: 30,
      daysAhead: 14,
    })

    if (calculatedSlots.length > 0) {
      return calculatedSlots
    }
  } catch (err) {
    console.error('Error calculating slots:', err)
  }

  // Fallback slots if computation fails
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  return [
    {
      id: `slot-${mentorId}-1`,
      mentor_id: mentorId,
      date: tomorrow,
      start_time: '18:00',
      end_time: '18:30',
      duration_minutes: 30,
      is_booked: false,
      display_label: 'Tomorrow, 6:00 PM - 6:30 PM IST',
    },
    {
      id: `slot-${mentorId}-2`,
      mentor_id: mentorId,
      date: tomorrow,
      start_time: '19:30',
      end_time: '20:00',
      duration_minutes: 30,
      is_booked: false,
      display_label: 'Tomorrow, 7:30 PM - 8:00 PM IST',
    },
  ]
}

/**
 * Create a new booking
 */
/**
 * Create a new booking
 */
export async function createBooking(payload: BookingPayload): Promise<BookingResponse> {
  if (isBackendUsable()) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(1800),
      })

      if (res.status === 409) {
        throw new Error('This slot was just booked by another candidate. Please pick another slot.')
      }

      if (res.ok) {
        markBackendStatus(true)
        const data = await res.json()
        const bookingData = data?.data || data
        // Cache booking in local storage
        persistLocalBooking(bookingData)
        return bookingData
      }
    } catch (err: any) {
      if (err.message?.includes('booked')) throw err
      markBackendStatus(false)
    }
  }

  // Parse chosen slot time if available from slot_id
  let bookingDate = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  let bookingStartTime = '18:00'
  if (payload.slot_id) {
    const parts = payload.slot_id.split('-')
    if (parts.length >= 6) {
      bookingDate = `${parts[2]}-${parts[3]}-${parts[4]}`
      bookingStartTime = parts[5]
    }
  }

  // Fallback booking object - does NOT fake real Google Meet links
  const mentor = DEMO_MENTORS.find((m) => m.id === payload.mentor_id) || DEMO_MENTORS[0]
  const mockBooking: BookingResponse = {
    id: `book-${Date.now()}`,
    mentor_id: payload.mentor_id,
    mentor_name: mentor.full_name,
    mentor_title: mentor.title,
    mentor_org: mentor.organisation,
    user_name: payload.user_name || 'Student',
    user_email: payload.user_email || 'student@pathpilot.dev',
    date: bookingDate,
    start_time: bookingStartTime,
    duration_minutes: payload.duration_mins || 30,
    topic: payload.topic,
    notes: payload.notes || '',
    meet_link: null, // Only true Google API integration returns real Meet URLs
    google_calendar_status: 'AWAITING_CREDENTIALS',
    calendar_ics_url: `${BACKEND_URL}/api/bookings/demo-calendar.ics`,
    status: 'DEMO_CONFIRMED',
    amount_inr: payload.amount_inr || mentor.session_price_inr,
    created_at: new Date().toISOString(),
  }

  persistLocalBooking(mockBooking)
  return mockBooking
}

/**
 * Retrieve user bookings
 */
export async function getBookings(userEmail?: string): Promise<BookingResponse[]> {
  // First attempt local /api/bookings Next.js API route
  try {
    const query = userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : ''
    const res = await fetch(`/api/bookings${query}`)
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json)) return json
      if (json?.bookings && Array.isArray(json.bookings) && json.bookings.length > 0) return json.bookings
      // API returned empty — try email-scoped localStorage as a supplement
      if (typeof window !== 'undefined') {
        const knownKeys = Object.keys(localStorage).filter(k => k.startsWith('pathpilot_user_bookings_'))
        for (const key of knownKeys) {
          try {
            const raw = localStorage.getItem(key)
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed) && parsed.length > 0) return parsed
            }
          } catch { }
        }
      }
    }
  } catch { }

  if (isBackendUsable()) {
    try {
      const query = userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : ''
      const res = await fetch(`${BACKEND_URL}/api/bookings${query}`, {
        signal: AbortSignal.timeout(1000),
      })
      if (res.ok) {
        markBackendStatus(true)
        const json = await res.json()
        if (Array.isArray(json)) return json
        if (json?.bookings && Array.isArray(json.bookings)) return json.bookings
      }
    } catch {
      markBackendStatus(false)
    }
  }

  // Final fallback: scan all email-scoped localStorage bookings
  if (typeof window !== 'undefined') {
    const knownKeys = Object.keys(localStorage).filter(k => k.startsWith('pathpilot_user_bookings_'))
    for (const key of knownKeys) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch { }
    }
  }

  return []
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<boolean> {
  if (isBackendUsable()) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        signal: AbortSignal.timeout(1000),
      })
      if (res.ok) {
        markBackendStatus(true)
        updateLocalBookingStatus(bookingId, 'cancelled')
        return true
      }
    } catch {
      markBackendStatus(false)
    }
  }

  updateLocalBookingStatus(bookingId, 'cancelled')
  return true
}

/**
 * Resume Analysis - fast direct Next.js API route with resilient backend fallback
 */
export async function parseResumeWithBackend(file: File): Promise<{
  success: boolean
  data?: ResumeParseResult
  providerUsed?: string
  model?: string
  error?: string
}> {
  // 1. Direct Next.js internal API route (Fastest: < 1.5s with Gemini Flash Lite, 100% Vercel & local compatible)
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/ai/parse-resume', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const json = await res.json()
      if (json && json.success) return json
    }
  } catch (err: any) {
    console.warn('Next.js resume parse attempt note:', err?.message)
  }

  // 2. Fallback to Python backend if reachable
  if (isBackendUsable()) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${BACKEND_URL}/api/ai/parse-resume`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(2000),
      })
      if (res.ok) {
        markBackendStatus(true)
        return await res.json()
      }
    } catch {
      markBackendStatus(false)
    }
  }

  return { success: false, error: 'Failed to analyze resume' }
}

/**
 * Autosave Roadmap task progress to Python backend
 */
export async function updateTaskProgress(
  taskId: string,
  payload: {
    completed: boolean
    notes?: string
    repo_url?: string
    role_title?: string
    user_email?: string
  }
) {
  if (!isBackendUsable()) return
  try {
    await fetch(`${BACKEND_URL}/api/progress/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(1000),
    })
  } catch {
    // Non-blocking background sync
  }
}

/**
 * Save onboarding profile with persistence to backend, Supabase metadata, and localStorage
 */
export async function saveOnboardingProfile(profile: any) {
  // 1. Persist to Python FastAPI backend (Fast 800ms timeout)
  if (isBackendUsable()) {
    try {
      await fetch(`${BACKEND_URL}/api/onboarding/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
        signal: AbortSignal.timeout(800),
      })
    } catch {
      markBackendStatus(false)
    }
  }

  // 2. Persist to Supabase if configured & authenticated
  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    if (supabase) {
      // Update auth user metadata so session carries onboarding completion across browsers
      await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          full_name: profile.full_name || profile.fullName || '',
          current_status: profile.current_status || profile.currentStatus || '',
          target_job_role: profile.target_job_role || profile.targetRole || '',
        },
      })

      // Upsert into career_onboarding_profiles table if available
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('career_onboarding_profiles').upsert({
          user_id: user.id,
          full_name: profile.full_name || profile.fullName || '',
          avatar_url: profile.avatar_url || null,
          current_status: profile.current_status || profile.currentStatus || 'third_year',
          degree: profile.degree || null,
          branch: profile.branch || null,
          college_name: profile.college_name || profile.college || null,
          graduation_year: profile.graduation_year || profile.graduationYear || null,
          years_experience: profile.years_experience ?? null,
          current_title: profile.current_title || null,
          country: profile.country || 'India',
          preferred_location: profile.preferred_location || '',
          resume_uploaded: !!profile.resume_uploaded,
          resume_file_name: profile.resume_file_name || null,
          resume_consent: !!profile.resume_consent,
          career_interests: profile.career_interests || [],
          career_objective: profile.career_objective || 'explore_careers',
          target_job_role: profile.target_job_role || profile.targetRole || null,
          preferred_activities: profile.preferred_activities || [],
          career_confidence: profile.career_confidence || 'need_exploration',
          skills: profile.skills || [],
          primary_challenge: profile.primary_challenge || null,
          hours_per_week: profile.hours_per_week || profile.hoursPerWeek || 10,
          target_timeline: profile.target_timeline || '6_months',
          preparation_level: profile.preparation_level || 'just_starting',
          learning_preferences: profile.learning_preferences || [],
          help_areas: profile.help_areas || [],
          mentoring_skipped: profile.mentoring_skipped ?? true,
          mentoring_topics: profile.mentoring_topics || [],
          mentor_language: profile.mentor_language || 'English',
          session_budget: profile.session_budget || 'flexible',
          session_duration: profile.session_duration || 30,
          availability_window: profile.availability_window || null,
          onboarding_completed: true,
          current_step: 4,
          updated_at: new Date().toISOString(),
        })
      }
    }
  } catch (err) {
    console.warn('Supabase sync during onboarding save skipped/failed:', err)
  }

  // 3. LocalStorage and Cookies
  if (typeof window !== 'undefined') {
    localStorage.setItem('pathpilot_student_profile', JSON.stringify(profile))
    localStorage.setItem('pathpilot_onboarding_completed', 'true')
    document.cookie = 'pathpilot_onboarded=true; path=/; max-age=31536000'
    if (profile.target_job_role || profile.targetRole) {
      localStorage.setItem('pathpilot_target_role', profile.target_job_role || profile.targetRole)
    }
    // Clear draft once successfully saved
    localStorage.removeItem('pathpilot_onboarding_draft')
  }
}

/**
 * Load complete onboarding profile from LocalStorage, Supabase, or Backend
 */
export async function getOnboardingProfile(): Promise<any | null> {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('pathpilot_student_profile')
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch { }
    }
  }

  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('career_onboarding_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (data) return data
      }
    }
  } catch { }

  return null
}



/**
 * Save onboarding in-progress draft to survive page refreshes
 */
export function saveOnboardingDraft(step: number, draft: any) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      'pathpilot_onboarding_draft',
      JSON.stringify({ step, draft, savedAt: new Date().toISOString() })
    )
  } catch { }
}

/**
 * Get saved onboarding draft if exists
 */
export function getOnboardingDraft(): { step: number; draft: any } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('pathpilot_onboarding_draft')
    if (raw) return JSON.parse(raw)
  } catch { }
  return null
}



// ── Local Storage Helpers for Resilient Offline Cache ────────
function persistLocalBooking(booking: BookingResponse) {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalBookings()
    const filtered = existing.filter((b) => b.id !== booking.id)
    filtered.unshift(booking)
    localStorage.setItem('pathpilot_user_bookings', JSON.stringify(filtered))
  } catch {
    // ignore
  }
}

function getLocalBookings(): BookingResponse[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('pathpilot_user_bookings')
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return []
}

function updateLocalBookingStatus(bookingId: string, status: 'confirmed' | 'cancelled') {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalBookings()
    const updated = existing.map((b) => (b.id === bookingId ? { ...b, status } : b))
    localStorage.setItem('pathpilot_user_bookings', JSON.stringify(updated))
  } catch {
    // ignore
  }
}

// ─── Architecture 2.0: Job Board & Match Engine Client Methods ───────────────

import type { JobListing, JobListResponse, JobMatchAnalysis, UserAppliedJob, JobTailorRequest, JobTailorResponse } from '@/types'

export interface JobQueryParams {
  search?: string
  country?: string
  work_mode?: string
  role_category?: string
  exp_range?: string
  sort_by?: string
  limit?: number
  offset?: number
  user_email?: string
}

export async function fetchJobs(params: JobQueryParams = {}): Promise<JobListResponse> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.country && params.country !== 'All') query.set('country', params.country)
  if (params.work_mode && params.work_mode !== 'All') query.set('work_mode', params.work_mode)
  if (params.role_category && params.role_category !== 'All') query.set('role_category', params.role_category)
  if (params.exp_range && params.exp_range !== 'All') query.set('exp_range', params.exp_range)
  if (params.sort_by) query.set('sort_by', params.sort_by)
  if (params.limit) query.set('limit', String(params.limit))
  if (params.offset) query.set('offset', String(params.offset))
  if (params.user_email) query.set('user_email', params.user_email)

  try {
    const res = await fetch(`${BACKEND_URL}/api/jobs?${query.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.jobs) && data.jobs.length > 0) {
        return data
      }
    }
  } catch (err) {
    console.warn('[api-client] Backend fetchJobs failed, falling back to client cache:', err)
  }

  // Graceful client fallback with verified real PM-Launchpad dataset
  let filtered = FALLBACK_PM_JOBS.filter(j => j.status !== 'closed')
  if (params.country && params.country !== 'All') {
    if (params.country === 'India') {
      filtered = filtered.filter(j => j.country.toLowerCase() === 'india')
    } else if (params.country === 'Global') {
      filtered = filtered.filter(j => j.country.toLowerCase() !== 'india' || j.work_mode.toLowerCase() === 'remote')
    }
  }
  if (params.role_category && params.role_category !== 'All') {
    filtered = filtered.filter(j => j.role_category.toLowerCase().includes(params.role_category!.toLowerCase()))
  }
  if (params.exp_range && params.exp_range !== 'All') {
    if (params.exp_range === '0-1' || params.exp_range === 'fresher') {
      // Pure Fresher: strictly requires 0 years minimum experience (accepts fresh grads / college seniors)
      filtered = filtered.filter(j => j.exp_min === 0 && j.exp_max <= 2)
    } else if (params.exp_range === '1-3' || params.exp_range === 'early') {
      filtered = filtered.filter(j => (j.exp_min >= 1 && j.exp_min <= 3) || (j.exp_min === 0 && j.exp_max >= 3))
    } else if (params.exp_range === '3+' || params.exp_range === 'senior') {
      filtered = filtered.filter(j => j.exp_max >= 3 || j.exp_min >= 3)
    }
  }
  if (params.search) {
    const s = params.search.toLowerCase()
    filtered = filtered.filter(j =>
      j.title.toLowerCase().includes(s) ||
      j.company.toLowerCase().includes(s) ||
      (j.skills && j.skills.some(sk => sk.toLowerCase().includes(s)))
    )
  }

  const limit = params.limit || 30
  const offset = params.offset || 0

  return {
    total: filtered.length,
    limit,
    offset,
    has_more: offset + limit < filtered.length,
    jobs: filtered.slice(offset, offset + limit),
    last_verified: new Date().toISOString()
  }
}

export async function fetchJobById(jobId: string, userEmail?: string): Promise<JobListing | null> {
  try {
    const url = userEmail
      ? `${BACKEND_URL}/api/jobs/${jobId}?user_email=${encodeURIComponent(userEmail)}`
      : `${BACKEND_URL}/api/jobs/${jobId}`
    const res = await fetch(url)
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn(`[api-client] Failed to fetch job ${jobId}:`, err)
  }
  return FALLBACK_PM_JOBS.find(j => j.id === jobId || j.hash_id === jobId) || null
}

export async function syncJobsEngine(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/jobs/sync`, { method: 'POST' })
    return res.ok
  } catch (err) {
    console.warn('[api-client] syncJobsEngine error:', err)
    return false
  }
}



export async function toggleSaveJob(jobId: string, userEmail: string, save: boolean): Promise<boolean> {
  try {
    const method = save ? 'POST' : 'DELETE'
    const url = save
      ? `${BACKEND_URL}/api/jobs/${jobId}/save`
      : `${BACKEND_URL}/api/jobs/${jobId}/save?user_email=${encodeURIComponent(userEmail)}`
    const body = save ? JSON.stringify({ job_id: jobId, user_email: userEmail }) : undefined

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body
    })
    if (res.ok) {
      const data = await res.json()
      return data.saved ?? save
    }
  } catch (err) {
    console.warn('[api-client] toggleSaveJob network error:', err)
  }
  return save
}

export async function fetchUserSavedJobs(userEmail: string): Promise<JobListing[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/jobs/user/saved?user_email=${encodeURIComponent(userEmail)}`)
    if (res.ok) {
      const data = await res.json()
      return data.saved_jobs || []
    }
  } catch (err) {
    console.warn('[api-client] fetchUserSavedJobs error:', err)
  }
  return []
}

export async function trackJobApplication(
  jobId: string,
  userEmail: string,
  status: string = 'applied',
  notes: string = ''
): Promise<any> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        user_email: userEmail,
        status,
        notes
      })
    })
    if (res.ok) {
      const data = await res.json()
      return data.record
    }
  } catch (err) {
    console.warn('[api-client] trackJobApplication error:', err)
  }
  return null
}



export async function fetchUserAppliedJobs(userEmail: string): Promise<any[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/jobs/user/applied?user_email=${encodeURIComponent(userEmail)}`)
    if (res.ok) {
      const data = await res.json()
      return data.applications || []
    }
  } catch (err) {
    console.warn('[api-client] fetchUserAppliedJobs error:', err)
  }
  return []
}

export async function matchResumeWithJob(
  jobId: string,
  resumeText?: string,
  studentSkills?: string[]
): Promise<JobMatchAnalysis | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/jobs/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        resume_text: resumeText,
        student_skills: studentSkills
      })
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('[api-client] matchResumeWithJob error:', err)
  }
  return null
}

export async function tailorResumeForJob(request: JobTailorRequest): Promise<JobTailorResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/jobs/tailor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('[api-client] tailorResumeForJob error:', err)
  }
  return null
}

// ── Protected Marketplace Payments & Delayed Payouts ──────────────────────

export interface CreatePaymentOrderPayload {
  mentor_id: string
  slot_id: string
  topic: string
  notes?: string
  user_name: string
  user_email: string
  amount_inr: number
  time_zone?: string
  duration_mins?: number
  idempotency_key?: string
}

export interface CreatePaymentOrderResult {
  success: boolean
  order_id: string
  payment_id: string
  booking_id: string
  amount_inr: number
  amount_paise: number
  currency: string
  key_id: string
  commission_percent: number
  mentor_earnings_inr: number
  is_sandbox: boolean
  message: string
}

export interface VerifyPaymentPayload {
  payment_id: string
  booking_id: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  idempotency_key?: string
}

export interface VerifyPaymentResult {
  success: boolean
  booking_id: string
  status: string
  meeting_link?: string | null
  calendar_ics_url?: string | null
  message: string
}

export interface MentorFinancials {
  mentor_id: string
  total_earnings_inr: number
  pending_earnings_inr: number
  payout_eligible_inr: number
  payout_completed_inr: number
  upcoming_sessions_count: number
  completed_sessions_count: number
  cancelled_sessions_count: number
  disputed_sessions_count: number
  payout_history: Array<{
    id: string
    amount_inr: number
    status: string
    provider_payout_id?: string
    initiated_at: string
    completed_at?: string
  }>
  active_disputes: Array<{
    id: string
    booking_id: string
    reason: string
    description: string
    status: string
    created_at: string
  }>
  recent_earnings: Array<{
    id: string
    booking_id: string
    gross_amount_inr: number
    commission_amount_inr: number
    net_earnings_inr: number
    status: string
    is_payout_eligible: boolean
    is_payout_settled: boolean
    created_at: string
  }>
}

export interface StudentFinancials {
  student_email: string
  payment_history: Array<{
    id: string
    order_id: string
    booking_id?: string
    amount_inr: number
    status: string
    payment_method: string
    created_at: string
  }>
  booking_payments: Array<{
    id: string
    booking_id: string
    payment_id: string
    mentor_id: string
    mentor_name: string
    topic: string
    amount_inr: number
    lifecycle_status: string
    review_window_expires_at?: string
    dispute_id?: string
    refund_id?: string
    created_at: string
  }>
  refunds: Array<{
    id: string
    booking_id: string
    amount_inr: number
    reason: string
    status: string
    provider_refund_id?: string
    initiated_at: string
  }>
  disputes: Array<{
    id: string
    booking_id: string
    reason: string
    description: string
    status: string
    created_at: string
  }>
  pending_confirmations: any[]
}

export async function createPaymentOrder(payload: CreatePaymentOrderPayload): Promise<CreatePaymentOrderResult> {
  const res = await fetch(`${BACKEND_URL}/api/payments/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to initiate secure payment order.')
  }
  return await res.json()
}

export async function verifyPaymentCapture(payload: VerifyPaymentPayload): Promise<VerifyPaymentResult> {
  const res = await fetch(`${BACKEND_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Payment verification failed.')
  }
  return await res.json()
}

export async function getPaymentConfig(): Promise<any> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/payments/config`)
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn('Failed to load payment config:', err)
  }
  return {
    provider: 'razorpay_route',
    mode: 'sandbox',
    platform_commission_percent: 15.0,
    completion_review_window_hours: 24,
    funds_held_in_nodal: true,
    anti_no_show_protection: true
  }
}

export async function mentorMarkSessionCompleted(bookingId: string, notes?: string): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/payments/bookings/${bookingId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId, mentor_notes: notes || '' })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to mark session completed.')
  }
  return await res.json()
}

export async function studentConfirmSessionCompleted(bookingId: string, rating = 5, feedback = ''): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/payments/bookings/${bookingId}/confirm-completion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId, rating, feedback })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to confirm session completion.')
  }
  return await res.json()
}

export async function studentReportIssue(
  bookingId: string,
  reason: string,
  description: string,
  evidenceUrls: string[] = []
): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/payments/bookings/${bookingId}/report-issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_id: bookingId,
      reason,
      description,
      evidence_urls: evidenceUrls
    })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to submit issue report.')
  }
  return await res.json()
}

export async function cancelBookingWithRefund(
  bookingId: string,
  reason: string,
  cancelledBy: 'student' | 'mentor' = 'student'
): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/payments/bookings/${bookingId}/cancel-refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_id: bookingId,
      reason,
      cancelled_by: cancelledBy
    })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to cancel consultation.')
  }
  return await res.json()
}

export async function fetchMentorFinancials(mentorId: string): Promise<MentorFinancials> {
  const res = await fetch(`${BACKEND_URL}/api/payments/mentor/${mentorId}/dashboard`)
  if (res.ok) {
    return await res.json()
  }
  return {
    mentor_id: mentorId,
    total_earnings_inr: 0,
    pending_earnings_inr: 0,
    payout_eligible_inr: 0,
    payout_completed_inr: 0,
    upcoming_sessions_count: 0,
    completed_sessions_count: 0,
    cancelled_sessions_count: 0,
    disputed_sessions_count: 0,
    payout_history: [],
    active_disputes: [],
    recent_earnings: []
  }
}

export async function requestMentorPayoutDisbursement(mentorId: string): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/payments/mentor/${mentorId}/request-payout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mentor_id: mentorId })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to request payout settlement.')
  }
  return await res.json()
}

export async function fetchStudentFinancials(studentEmail: string): Promise<StudentFinancials> {
  const res = await fetch(`${BACKEND_URL}/api/payments/student/${encodeURIComponent(studentEmail)}/history`)
  if (res.ok) {
    return await res.json()
  }
  return {
    student_email: studentEmail,
    payment_history: [],
    booking_payments: [],
    refunds: [],
    disputes: [],
    pending_confirmations: []
  }
}




