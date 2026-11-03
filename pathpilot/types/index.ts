// ─── User & Profile Types ─────────────────────────────────────────────────────

export type UserRole = 'student' | 'mentor' | 'admin'
export type UserRoleStatus = 'active' | 'pending_approval' | 'approved' | 'suspended'
export type MentorVerificationStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected'

export interface UserRoleRecord {
  id?: string
  user_id: string
  role: UserRole
  status: UserRoleStatus
  created_at?: string
  updated_at?: string
}

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface StudentProfile {
  id: string
  user_id: string
  degree: string | null
  branch: string | null
  college_name: string | null
  year_of_study: number | null
  graduation_year: number | null
  city: string | null
  bio: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type StudentStatus =
  | 'first_year'
  | 'second_year'
  | 'third_year'
  | 'final_year'
  | 'recent_graduate'
  | 'working_professional'
  | 'career_switcher'
  | 'other'

export type CareerObjective =
  | 'find_internship'
  | 'first_job'
  | 'campus_placements'
  | 'explore_careers'
  | 'career_switch'
  | 'advance_current'

export type CareerConfidence =
  | 'exact_role'
  | 'few_roles'
  | 'need_exploration'

export interface UserSkill {
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
}

export interface CareerOnboardingProfile {
  // Step 1: Background
  user_id?: string
  full_name: string
  email?: string
  avatar_url?: string | null
  current_status: StudentStatus
  degree: string
  branch?: string
  college_name?: string
  graduation_year?: string
  years_experience?: number
  current_title?: string
  country: string
  preferred_location: string
  resume_uploaded: boolean
  resume_file_name?: string
  resume_consent?: boolean

  // Step 2: Goals
  career_interests: string[]
  career_objective: CareerObjective
  target_job_role?: string | null
  preferred_activities: string[]
  career_confidence: CareerConfidence
  skills: UserSkill[]
  primary_challenge?: string

  // Step 3: Plan
  hours_per_week: number
  target_timeline: string
  preparation_level: string
  learning_preferences: string[]
  help_areas: string[]

  // Step 4: Mentoring (Optional)
  mentoring_skipped: boolean
  mentoring_topics?: string[]
  mentor_language?: string
  session_budget?: string
  session_duration?: number
  availability_window?: string

  // Metadata
  onboarding_completed: boolean
  current_step?: number
  created_at?: string
  updated_at?: string
}

// ─── Resume Types ─────────────────────────────────────────────────────────────

export type ResumeProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Resume {
  id: string
  user_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size_bytes: number
  uploaded_at: string
  processing_status: ResumeProcessingStatus
  extracted_text: string | null
  consent_given: boolean
  is_active: boolean
  deleted_at: string | null
}

export interface ExtractedResumeData {
  full_name?: string
  email?: string
  phone?: string
  education: {
    degree: string
    branch: string
    college: string
    graduation_year: number | null | string
  }
  skills: {
    technical: string[]
    non_technical: string[]
  }
  projects: Array<{
    title: string
    description: string
    technologies: string[]
  }>
  experience: Array<{
    company: string
    role: string
    duration: string
    description: string
  }>
  certifications: string[]
  links: Array<{
    type: string
    url: string
  }>
  inferred_interests: string[]
  confidence_notes: string
}

export interface ResumeAnalysis {
  id: string
  resume_id: string
  user_id: string
  summary: string
  strengths: string[]
  skills_found: string[]
  experience_found: string[]
  education_found: string[]
  projects_found: string[]
  certifications_found: string[]
  gaps_identified: string[]
  next_steps: string[]
  ai_provider: string
  is_demo: boolean
  created_at: string
}

// ─── Career Types ─────────────────────────────────────────────────────────────

export interface CareerDomain {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  is_active: boolean
}

export interface JobProfile {
  id: string
  domain_id: string
  title: string
  slug: string
  overview: string
  responsibilities: string[]
  required_skills: string[]
  tools: string[]
  certifications: string[]
  eligibility: string
  career_progression: string[]
  experience_level: 'entry' | 'mid' | 'senior'
  is_entry_level: boolean
}

export interface CareerRecommendation {
  id: string
  user_id: string
  resume_analysis_id: string | null
  domain_id: string
  job_profile_id: string | null
  suitability_score: number
  reasoning: string
  evidence: string[]
  gaps: string[]
  next_steps: string[]
  is_demo: boolean
  created_at: string
}

export interface StudentTargetRole {
  id: string
  user_id: string
  job_profile_id: string
  is_primary: boolean
  selected_at: string
  status: 'active' | 'paused' | 'completed'
}

// ─── Roadmap Types ────────────────────────────────────────────────────────────

export type TaskStatus = 'not_started' | 'in_progress' | 'completed'

export interface Roadmap {
  id: string
  user_id: string
  job_profile_id: string
  title: string
  total_phases: number
  estimated_weeks: number
  is_demo: boolean
  created_at: string
  updated_at: string
  regenerated_at: string | null
}

export interface RoadmapPhase {
  id: string
  roadmap_id: string
  phase_number: number
  title: string
  description: string
  estimated_weeks: number
  order_index: number
}

export interface RoadmapTask {
  id: string
  phase_id: string
  roadmap_id: string
  user_id: string
  title: string
  description: string
  skill_focus: string
  resources: Array<{
    name: string
    url: string
    type: 'article' | 'video' | 'course' | 'book' | 'tool'
  }>
  practical_task: string
  estimated_hours: number
  completion_criteria: string[]
  why_it_matters: string
  status: TaskStatus
  notes: string | null
  project_link: string | null
  completed_at: string | null
  order_index: number
}

export interface MentorProfile {
  id: string
  user_id: string | null
  full_name: string
  email?: string
  phone?: string
  title: string
  organisation: string
  bio: string
  avatar_url: string | null
  country?: string
  timezone?: string
  years_experience: number
  previous_experience?: string
  education?: string
  linkedin_url: string | null
  portfolio_url?: string
  primary_domain?: string
  domains: string[]
  skills: string[]
  target_roles?: string[]
  mentoring_topics: string[]
  languages?: string[]
  consultation_types?: string[]
  consultation_format?: string
  target_audience?: string[]
  session_price_inr: number
  session_duration_mins: number[]
  weekly_capacity?: number
  terms_accepted?: boolean
  rating: number
  review_count: number
  is_verified: boolean
  verification_status?: MentorVerificationStatus
  draft_step?: number
  is_demo_profile: boolean
  is_available: boolean
  created_at: string
  updated_at?: string
}

export interface MentorOnboardingFormData {
  // Step 1: Basic Information
  full_name: string
  email: string
  phone: string
  avatar_url: string
  country: string
  timezone: string

  // Step 2: Professional Experience
  title: string
  organisation: string
  years_experience: number
  previous_experience: string
  education: string
  linkedin_url: string
  portfolio_url: string

  // Step 3: Mentoring Expertise
  primary_domain: string
  target_roles: string[]
  skills: string[]
  mentoring_topics: string[]
  languages: string[]
  bio: string
  consultation_types: string[]

  // Step 4: Session Preferences
  session_duration_mins: number[]
  session_price_inr: number
  consultation_format: string
  target_audience: string[]
  weekly_capacity: number

  // Step 5: Review & Submission
  terms_accepted: boolean
  verification_status: MentorVerificationStatus
  draft_step: number
}

export interface AvailableSlot {
  id: string
  mentor_id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
  booking_id: string | null
}

// ─── Booking Types ────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'demo_confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'

export interface Booking {
  id: string
  student_id: string
  mentor_id: string
  slot_id: string
  topic: string
  questions: string | null
  target_role: string | null
  session_duration_mins: number
  total_price_inr: number
  status: BookingStatus
  meeting_link: string | null
  is_demo_booking: boolean
  created_at: string
  confirmed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
}

export interface Review {
  id: string
  booking_id: string
  student_id: string
  mentor_id: string
  rating: number
  comment: string | null
  is_verified: boolean
  created_at: string
}

// ─── Onboarding Types ─────────────────────────────────────────────────────────

export interface OnboardingResponses {
  id: string
  user_id: string
  interests: string[]
  preferred_work_style: string[]
  learning_preference: string[]
  career_goals: string[]
  challenges: string | null
  hours_per_week: number | null
  completed_at: string
}

// ─── Saved Items ──────────────────────────────────────────────────────────────

export type SavedItemType = 'job_profile' | 'mentor'

export interface SavedItem {
  id: string
  user_id: string
  item_type: SavedItemType
  item_id: string
  saved_at: string
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export type AIProvider = 'gemini' | 'openai' | 'demo'

export interface AIServiceResult<T> {
  data: T | null
  error: string | null
  provider: AIProvider
  is_demo: boolean
}

// ─── Mentor Availability & Scheduling Types (Phase 3) ─────────────────────────

export interface TimeSlotInterval {
  id?: string
  start_time: string // '09:00' (24-hour format)
  end_time: string   // '12:00' (24-hour format)
}

export interface WeeklyDaySchedule {
  day_of_week: number // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  day_name: string    // 'Monday', etc.
  is_active: boolean
  slots: TimeSlotInterval[]
}

export interface AvailabilityException {
  id?: string
  mentor_id?: string
  exception_date: string // 'YYYY-MM-DD'
  is_unavailable: boolean // true = blocked whole day, false = custom hours
  start_time?: string | null
  end_time?: string | null
  reason?: string
}

export interface MentorSchedulingSettings {
  mentor_id?: string
  timezone: string
  buffer_minutes: number
  notice_hours: number
  max_weeks_in_advance: number
}

export interface MentorAvailabilityData {
  weekly_schedule: WeeklyDaySchedule[]
  exceptions: AvailabilityException[]
  settings: MentorSchedulingSettings
}

export * from './job'

