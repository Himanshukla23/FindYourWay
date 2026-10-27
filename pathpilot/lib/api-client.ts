/**
 * PathPilot API Client
 * Seamlessly interfaces with the Python FastAPI Backend (http://localhost:8000)
 * with robust, transparent fallback to local demo models so UI/UX is 100% resilient.
 */

import { DEMO_MENTORS } from './demo-data'

export interface Mentor {
  id: string
  full_name: string
  title: string
  organisation: string
  avatar_url?: string | null
  bio: string
  domains: string[]
  skills: string[]
  mentoring_topics: string[]
  session_price_inr: number
  rating: number
  review_count: number
  is_verified: boolean
  years_experience: number
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

/**
 * Fetch mentors from Python backend, falling back to DEMO_MENTORS
 */
export async function getMentors(params?: {
  domain?: string
  search?: string
  sort_by?: string
}): Promise<Mentor[]> {
  try {
    const query = new URLSearchParams()
    if (params?.domain && params.domain !== 'all') query.set('domain', params.domain)
    if (params?.search) query.set('search', params.search)
    if (params?.sort_by) query.set('sort_by', params.sort_by)

    const url = `${BACKEND_URL}/api/mentors${query.toString() ? '?' + query.toString() : ''}`
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
      if (data?.mentors && Array.isArray(data.mentors) && data.mentors.length > 0) {
        return data.mentors
      }
    }
  } catch (err) {
    console.warn('Backend getMentors unreachable, using demo mentors:', err)
  }

  // Fallback
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
 * Fetch single mentor
 */
export async function getMentorById(mentorId: string): Promise<Mentor | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mentors/${mentorId}`, {
      signal: AbortSignal.timeout(3500),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('Backend getMentorById failed:', err)
  }

  return DEMO_MENTORS.find((m) => m.id === mentorId) || DEMO_MENTORS[0] || null
}

/**
 * Fetch bookable slots for a mentor
 */
export async function getMentorSlots(mentorId: string): Promise<AvailableSlot[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mentors/${mentorId}/slots`, {
      signal: AbortSignal.timeout(3500),
    })
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json)) return json
      if (json?.slots && Array.isArray(json.slots)) return json.slots
    }
  } catch (err) {
    console.warn('Backend getMentorSlots failed, generating local fallback slots:', err)
  }

  // Generate 5 dynamic fallback slots for tomorrow and weekend
  const fallbackSlots: AvailableSlot[] = [
    {
      id: `slot-${mentorId}-1`,
      mentor_id: mentorId,
      date: 'Tomorrow',
      start_time: '18:00',
      end_time: '18:30',
      duration_minutes: 30,
      is_booked: false,
      display_label: 'Tomorrow, 6:00 PM - 6:30 PM IST',
    },
    {
      id: `slot-${mentorId}-2`,
      mentor_id: mentorId,
      date: 'Tomorrow',
      start_time: '19:30',
      end_time: '20:00',
      duration_minutes: 30,
      is_booked: false,
      display_label: 'Tomorrow, 7:30 PM - 8:00 PM IST',
    },
    {
      id: `slot-${mentorId}-3`,
      mentor_id: mentorId,
      date: 'Saturday',
      start_time: '16:00',
      end_time: '16:30',
      duration_minutes: 30,
      is_booked: false,
      display_label: 'Saturday, 4:00 PM - 4:30 PM IST',
    },
    {
      id: `slot-${mentorId}-4`,
      mentor_id: mentorId,
      date: 'Saturday',
      start_time: '18:00',
      end_time: '18:30',
      duration_minutes: 30,
      is_booked: false,
      display_label: 'Saturday, 6:00 PM - 6:30 PM IST',
    },
    {
      id: `slot-${mentorId}-5`,
      mentor_id: mentorId,
      date: 'Sunday',
      start_time: '11:00',
      end_time: '11:30',
      duration_minutes: 30,
      is_booked: false,
      display_label: 'Sunday, 11:00 AM - 11:30 AM IST',
    },
  ]
  return fallbackSlots
}

/**
 * Create a new booking
 */
export async function createBooking(payload: BookingPayload): Promise<BookingResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })

    if (res.status === 409) {
      throw new Error('This slot was just booked by another candidate. Please pick another slot.')
    }

    if (res.ok) {
      const data = await res.json()
      const bookingData = data?.data || data
      // Cache booking in local storage
      persistLocalBooking(bookingData)
      return bookingData
    }
  } catch (err: any) {
    if (err.message?.includes('booked')) throw err
    console.warn('Backend createBooking unreachable, using local mock booking:', err)
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
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '18:00',
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
  try {
    const query = userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : ''
    const res = await fetch(`${BACKEND_URL}/api/bookings${query}`, {
      signal: AbortSignal.timeout(3500),
    })
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json) && json.length > 0) {
        return json
      }
      if (json?.bookings && Array.isArray(json.bookings) && json.bookings.length > 0) {
        return json.bookings
      }
    }
  } catch (err) {
    console.warn('Backend getBookings unreachable, loading local cached bookings:', err)
  }

  return getLocalBookings()
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      signal: AbortSignal.timeout(3500),
    })
    if (res.ok) {
      updateLocalBookingStatus(bookingId, 'cancelled')
      return true
    }
  } catch (err) {
    console.warn('Backend cancelBooking unreachable, updating local storage:', err)
  }

  updateLocalBookingStatus(bookingId, 'cancelled')
  return true
}

/**
 * Resume Analysis - sends directly to Python backend with local Next.js fallback
 */
export async function parseResumeWithBackend(file: File): Promise<{
  success: boolean
  data?: ResumeParseResult
  providerUsed?: string
  model?: string
  error?: string
}> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${BACKEND_URL}/api/ai/parse-resume`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(15000),
    })

    if (res.ok) {
      const json = await res.json()
      return json
    }
  } catch (err) {
    console.warn('Python backend resume parse failed, falling back to Next.js API:', err)
  }

  // Fallback to Next.js internal API route
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/ai/parse-resume', {
      method: 'POST',
      body: formData,
    })
    return await res.json()
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to analyze resume' }
  }
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
  try {
    await fetch(`${BACKEND_URL}/api/progress/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    })
  } catch {
    // Non-blocking background sync
  }
}

/**
/**
 * Save onboarding profile with persistence to backend, Supabase metadata, and localStorage
 */
export async function saveOnboardingProfile(profile: any) {
  // 1. Persist to Python FastAPI backend
  try {
    await fetch(`${BACKEND_URL}/api/onboarding/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
      signal: AbortSignal.timeout(3500),
    })
  } catch {
    // resilient fallback
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
      } catch {}
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
  } catch {}

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
  } catch {}
}

/**
 * Get saved onboarding draft if exists
 */
export function getOnboardingDraft(): { step: number; draft: any } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('pathpilot_onboarding_draft')
    if (raw) return JSON.parse(raw)
  } catch {}
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
