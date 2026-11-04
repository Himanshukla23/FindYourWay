'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Briefcase,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Globe,
  Video,
  DollarSign,
  Info,
  Check,
  ExternalLink,
} from 'lucide-react'
import { MentorOnboardingFormData, MentorVerificationStatus } from '@/types'

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  )
}

const CURATED_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
]

const DOMAIN_OPTIONS = [
  'Software Engineering',
  'Data Science & AI',
  'Cloud & DevOps Architecture',
  'Product Management',
  'UI/UX & Product Design',
  'Cybersecurity & Infosec',
]

const TARGET_ROLE_OPTIONS = [
  'Full-Stack Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'AI / ML Engineer',
  'DevOps & Cloud Engineer',
  'Engineering Manager',
  'Product Manager',
  'System Architect',
]

const POPULAR_SKILLS = [
  'System Design',
  'Distributed Systems',
  'React / Next.js',
  'Python',
  'Node.js',
  'Go',
  'Kubernetes & Docker',
  'PostgreSQL',
  'FastAPI',
  'AWS',
  'DSA & LeetCode',
  'Microservices',
]

const TOPIC_OPTIONS = [
  'Resume Review & Project Critique',
  'System Design Fundamentals',
  'Mock Technical Coding Interview',
  'FAANG / Tier-1 Interview Strategy',
  'Transitioning from College to Tech',
  'Full-Stack Career Roadmap',
  'Salary & Offer Negotiation',
]

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Spanish', 'French', 'German']

const AUDIENCE_OPTIONS = [
  'College & University Students',
  'Self-Taught Developers',
  'Career Switchers',
  'Junior Engineers (0-2 YOE)',
  'Mid-Level Engineers (3-5 YOE)',
]

const CONSULTATION_TYPES = [
  '1-on-1 Mentorship',
  'Mock Technical Interview',
  'Resume Teardown & Optimization',
  'Project Architecture Review',
  'Career Navigation Q&A',
]

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+5:30)' },
  { value: 'America/New_York', label: 'America/New_York (EST, UTC-5)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST, UTC-8)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST, UTC+0/+1)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET, UTC+1)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
]

interface MentorProfileWizardProps {
  initialData?: Partial<MentorOnboardingFormData>
  mode?: 'onboarding' | 'edit'
}

export function MentorProfileWizard({ initialData, mode = 'onboarding' }: MentorProfileWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [form, setForm] = useState<MentorOnboardingFormData>({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    avatar_url: initialData?.avatar_url || CURATED_AVATARS[0],
    country: initialData?.country || 'India',
    timezone: initialData?.timezone || 'Asia/Kolkata',
    title: initialData?.title || '',
    organisation: initialData?.organisation || '',
    years_experience: initialData?.years_experience ?? 4,
    previous_experience: initialData?.previous_experience || '',
    education: initialData?.education || '',
    linkedin_url: initialData?.linkedin_url || '',
    portfolio_url: initialData?.portfolio_url || '',
    primary_domain: initialData?.primary_domain || 'Software Engineering',
    target_roles: initialData?.target_roles || ['Full-Stack Engineer', 'Backend Engineer'],
    skills: initialData?.skills || ['System Design', 'React / Next.js', 'Python', 'PostgreSQL'],
    mentoring_topics: initialData?.mentoring_topics || ['Resume Review & Project Critique', 'System Design Fundamentals'],
    languages: initialData?.languages || ['English', 'Hindi'],
    bio: initialData?.bio || '',
    consultation_types: initialData?.consultation_types || ['1-on-1 Mentorship', 'Resume Teardown & Optimization'],
    session_duration_mins: initialData?.session_duration_mins || [30, 60],
    session_price_inr: initialData?.session_price_inr || 499,
    consultation_format: 'Google Meet',
    target_audience: initialData?.target_audience || ['College & University Students', 'Junior Engineers (0-2 YOE)'],
    weekly_capacity: initialData?.weekly_capacity || 4,
    terms_accepted: initialData?.terms_accepted || false,
    verification_status: initialData?.verification_status || 'draft',
    draft_step: initialData?.draft_step || 1,
  })

  // Load saved draft and enforce authenticated user session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient()
        if (supabase) {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              const meta = user.user_metadata || {}
              const currentUserName = meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : '')
              const currentUserEmail = user.email || ''

              // Check user-scoped draft or general draft
              let draftData: any = null
              try {
                const userKey = `pathpilot_mentor_draft_${user.id}`
                const rawUserDraft = localStorage.getItem(userKey)
                if (rawUserDraft) {
                  draftData = JSON.parse(rawUserDraft)
                } else {
                  const genericDraft = localStorage.getItem('pathpilot_mentor_draft')
                  if (genericDraft) {
                    const parsed = JSON.parse(genericDraft)
                    // Only use if email matches or no email is specified
                    if (!parsed.email || parsed.email.toLowerCase() === currentUserEmail.toLowerCase()) {
                      draftData = parsed
                    } else {
                      localStorage.removeItem('pathpilot_mentor_draft')
                    }
                  }
                }
              } catch {}

              setForm((prev) => ({
                ...prev,
                ...(draftData || {}),
                // Always prioritize authenticated user's identity
                full_name: currentUserName || (draftData?.full_name ?? prev.full_name),
                email: currentUserEmail || (draftData?.email ?? prev.email),
                title: meta.initial_job_title || draftData?.title || prev.title,
                organisation: meta.initial_company || draftData?.organisation || prev.organisation,
              }))

              if (draftData?.draft_step && mode === 'onboarding') {
                setCurrentStep(draftData.draft_step)
              }
            }
          })
        }
      })
    }
  }, [mode])

  // Save draft locally on form change
  const saveLocalDraft = (updatedForm: MentorOnboardingFormData, stepNum: number) => {
    if (typeof window !== 'undefined') {
      const payload = JSON.stringify({ ...updatedForm, draft_step: stepNum })
      localStorage.setItem('pathpilot_mentor_draft', payload)
      if (updatedForm.email) {
        localStorage.setItem(`pathpilot_mentor_draft_${updatedForm.email}`, payload)
      }
    }
  }

  // Toggle array item helper
  const toggleArrayItem = (field: keyof MentorOnboardingFormData, item: string) => {
    const list = (form[field] as string[]) || []
    const updated = list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
    const updatedForm = { ...form, [field]: updated }
    setForm(updatedForm)
    saveLocalDraft(updatedForm, currentStep)
  }

  // Toggle duration minutes
  const toggleDuration = (duration: number) => {
    const list = form.session_duration_mins || []
    let updated: number[]
    if (list.includes(duration)) {
      if (list.length === 1) return // Keep at least one duration
      updated = list.filter((d) => d !== duration)
    } else {
      updated = [...list, duration].sort((a, b) => a - b)
    }
    const updatedForm = { ...form, session_duration_mins: updated }
    setForm(updatedForm)
    saveLocalDraft(updatedForm, currentStep)
  }

  // Add custom skill
  const handleAddSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !form.skills.includes(trimmed)) {
      const updated = [...form.skills, trimmed]
      const updatedForm = { ...form, skills: updated }
      setForm(updatedForm)
      setSkillInput('')
      saveLocalDraft(updatedForm, currentStep)
    }
  }

  // Step 1 Validation
  const validateStep1 = () => {
    if (!form.full_name.trim()) return 'Please enter your full name.'
    if (!form.email.trim() || !form.email.includes('@')) return 'Please provide a valid email.'
    return null
  }

  // Step 2 Validation
  const validateStep2 = () => {
    if (!form.title.trim()) return 'Please enter your current job title.'
    if (!form.organisation.trim()) return 'Please enter your current company or organization.'
    if (!form.linkedin_url.trim()) return 'Please provide your LinkedIn profile URL.'
    return null
  }

  // Step 3 Validation
  const validateStep3 = () => {
    if (!form.bio.trim() || form.bio.length < 50) {
      return 'Please write a brief biography of at least 50 characters to help students understand your background.'
    }
    if (form.mentoring_topics.length === 0) return 'Please select at least one mentoring topic.'
    if (form.skills.length === 0) return 'Please select or add at least one core skill.'
    return null
  }

  // Step 4 Validation
  const validateStep4 = () => {
    if (form.session_duration_mins.length === 0) return 'Please select at least one session duration.'
    if (form.session_price_inr < 0) return 'Session pricing cannot be negative.'
    return null
  }

  // Navigation handlers
  const handleNext = () => {
    setErrorMessage(null)
    if (currentStep === 1) {
      const err = validateStep1()
      if (err) {
        setErrorMessage(err)
        return
      }
    } else if (currentStep === 2) {
      const err = validateStep2()
      if (err) {
        setErrorMessage(err)
        return
      }
    } else if (currentStep === 3) {
      const err = validateStep3()
      if (err) {
        setErrorMessage(err)
        return
      }
    } else if (currentStep === 4) {
      const err = validateStep4()
      if (err) {
        setErrorMessage(err)
        return
      }
    }
    const nextStep = currentStep + 1
    setCurrentStep(nextStep)
    saveLocalDraft(form, nextStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setErrorMessage(null)
    const prevStep = Math.max(1, currentStep - 1)
    setCurrentStep(prevStep)
    saveLocalDraft(form, prevStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Save Incomplete Draft
  const handleSaveDraft = async () => {
    setSaving(true)
    setSaveMessage(null)
    setErrorMessage(null)
    try {
      saveLocalDraft(form, currentStep)
      const res = await fetch('/api/mentor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { ...form, draft_step: currentStep }, isDraft: true }),
      })
      const data = await res.json()
      if (data.success) {
        setSaveMessage('Draft saved successfully! You can resume anytime.')
        setTimeout(() => setSaveMessage(null), 4000)
      } else {
        setErrorMessage(data.error || 'Failed to save draft.')
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not save draft.')
    } finally {
      setSaving(false)
    }
  }

  // Final Submit for Mentor Approval
  const handleSubmitApproval = async () => {
    setErrorMessage(null)
    if (!form.terms_accepted) {
      setErrorMessage('Please accept the Terms of Service & Mentoring Policy before submitting.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/mentor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...form,
            verification_status: 'pending_approval' as MentorVerificationStatus,
            draft_step: 5,
          },
          isDraft: false,
        }),
      })
      const data = await res.json()
      if (data.success) {
        // Clear local draft upon official submission
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pathpilot_mentor_draft')
        }
        router.push('/mentor/profile?submitted=true')
      } else {
        setErrorMessage(data.error || 'Failed to submit profile for review.')
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Something went wrong submitting your profile.')
    } finally {
      setSaving(false)
    }
  }

  const progressPercent = Math.round((currentStep / 5) * 100)

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* ── Progress Header ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{mode === 'edit' ? 'Profile Management' : 'Mentor Onboarding'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentStep === 1 && 'Step 1: Basic Information'}
              {currentStep === 2 && 'Step 2: Professional Experience'}
              {currentStep === 3 && 'Step 3: Mentoring Expertise'}
              {currentStep === 4 && 'Step 4: Session Preferences'}
              {currentStep === 5 && 'Step 5: Review & Submit'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Step {currentStep} of 5 &bull; {progressPercent}% Completed
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>{saving ? 'Saving...' : 'Save Incomplete Draft'}</span>
            </button>
            {mode === 'edit' && (
              <Link
                href="/mentor/profile"
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </Link>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-5 gap-2 mt-4 text-center">
          {[
            { n: 1, label: 'Basic Info' },
            { n: 2, label: 'Experience' },
            { n: 3, label: 'Expertise' },
            { n: 4, label: 'Preferences' },
            { n: 5, label: 'Review' },
          ].map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => {
                setCurrentStep(s.n)
                saveLocalDraft(form, s.n)
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                currentStep === s.n
                  ? 'bg-blue-600 text-white shadow-xs'
                  : currentStep > s.n
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <span className="hidden sm:inline">{s.n}. </span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Status Messages ────────────────────────────────────────────── */}
      {saveMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 1: Basic Information
          ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Personal & Contact Information</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your identity details help build trust with students discovering your profile.
            </p>
          </div>

          {/* Profile Photo Avatar Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Profile Photo Avatar
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img
                src={form.avatar_url || CURATED_AVATARS[0]}
                alt="Profile Preview"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-sm shrink-0"
              />
              <div className="space-y-2 w-full">
                <p className="text-xs text-slate-500 font-medium">
                  Select a curated avatar or paste an image URL:
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {CURATED_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const updated = { ...form, avatar_url: url }
                        setForm(updated)
                        saveLocalDraft(updated, currentStep)
                      }}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 ${
                        form.avatar_url === url ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200'
                      }`}
                    >
                      <img src={url} alt={`Avatar option ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Or enter custom image URL (https://...)"
                  value={form.avatar_url}
                  onChange={(e) => {
                    const updated = { ...form, avatar_url: e.target.value }
                    setForm(updated)
                    saveLocalDraft(updated, currentStep)
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={form.full_name}
                onChange={(e) => {
                  const updated = { ...form, full_name: e.target.value }
                  setForm(updated)
                  saveLocalDraft(updated, currentStep)
                }}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="mentor@company.com"
                value={form.email}
                onChange={(e) => {
                  const updated = { ...form, email: e.target.value }
                  setForm(updated)
                  saveLocalDraft(updated, currentStep)
                }}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Phone Number & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => {
                  const updated = { ...form, phone: e.target.value }
                  setForm(updated)
                  saveLocalDraft(updated, currentStep)
                }}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Country
              </label>
              <select
                value={form.country}
                onChange={(e) => {
                  const updated = { ...form, country: e.target.value }
                  setForm(updated)
                  saveLocalDraft(updated, currentStep)
                }}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="Singapore">Singapore</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          {/* Time Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Operating Time Zone <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.timezone}
              onChange={(e) => {
                const updated = { ...form, timezone: e.target.value }
                setForm(updated)
                saveLocalDraft(updated, currentStep)
              }}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Your availability slots and student bookings are converted from this time zone to UTC.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 2: Professional Experience
          ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Professional Credentials</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Share your verified employment, current role, and educational background.
            </p>
          </div>

          {/* Current Job Title & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Software Engineer"
                value={form.title}
                onChange={(e) => {
                  const updated = { ...form, title: e.target.value }
                  setForm(updated)
                  saveLocalDraft(updated, currentStep)
                }}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Company / Organization <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Google, Stripe, or Microsoft"
                value={form.organisation}
                onChange={(e) => {
                  const updated = { ...form, organisation: e.target.value }
                  setForm(updated)
                  saveLocalDraft(updated, currentStep)
                }}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Years of Experience & Education */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Years of Professional Experience: <span className="text-blue-600">{form.years_experience} YOE</span>
              </label>
              <input
                type="range"
                min={1}
                max={25}
                value={form.years_experience}
                onChange={(e) => {
                  const updated = { ...form, years_experience: parseInt(e.target.value, 10) }
                  setForm(updated)
                  saveLocalDraft(updated, currentStep)
                }}
                className="w-full accent-blue-600 mt-2"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1 yr</span>
                <span>10 yrs</span>
                <span>25+ yrs</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Education & Degree
              </label>
              <input
                type="text"
                placeholder="e.g. B.Tech Computer Science, IIT Delhi"
                value={form.education}
                onChange={(e) => {
                  const updated = { ...form, education: e.target.value }
                  setForm(updated)
                  saveLocalDraft(updated, currentStep)
                }}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Previous Experience */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Previous Experience & Notable Companies
            </label>
            <input
              type="text"
              placeholder="e.g. Ex-Amazon Software Dev, Former Flipkart Tech Lead"
              value={form.previous_experience}
              onChange={(e) => {
                const updated = { ...form, previous_experience: e.target.value }
                setForm(updated)
                saveLocalDraft(updated, currentStep)
              }}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* LinkedIn URL & Portfolio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                LinkedIn Profile URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LinkedinIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  required
                  placeholder="https://linkedin.com/in/username"
                  value={form.linkedin_url}
                  onChange={(e) => {
                    const updated = { ...form, linkedin_url: e.target.value }
                    setForm(updated)
                    saveLocalDraft(updated, currentStep)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Used by our team for verification checks.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Portfolio or Website <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  placeholder="https://yourportfolio.dev"
                  value={form.portfolio_url}
                  onChange={(e) => {
                    const updated = { ...form, portfolio_url: e.target.value }
                    setForm(updated)
                    saveLocalDraft(updated, currentStep)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 3: Mentoring Expertise
          ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Mentoring Scope & Skills</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select the career verticals, job roles, and consultation topics you specialize in.
            </p>
          </div>

          {/* Primary Domain */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Primary Career Domain <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {DOMAIN_OPTIONS.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => {
                    const updated = { ...form, primary_domain: domain }
                    setForm(updated)
                    saveLocalDraft(updated, currentStep)
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    form.primary_domain === domain
                      ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* Job Roles */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Job Roles You Guide Students In
            </label>
            <div className="flex flex-wrap gap-2">
              {TARGET_ROLE_OPTIONS.map((role) => {
                const active = form.target_roles.includes(role)
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleArrayItem('target_roles', role)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {role}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mentoring Topics */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mentoring Topics Offered <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TOPIC_OPTIONS.map((topic) => {
                const active = form.mentoring_topics.includes(topic)
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleArrayItem('mentoring_topics', topic)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      active
                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{topic}</span>
                    {active && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Technical Skills & Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Core Technical Skills & Keywords <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom skill (e.g. Rust, Kafka, Next.js)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Add
              </button>
            </div>
            {/* Active Skills Pills */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {form.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => toggleArrayItem('skills', skill)}
                    className="text-slate-400 hover:text-slate-700 font-bold ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            {/* Popular Suggestions */}
            <div className="pt-1">
              <p className="text-[11px] text-slate-400 mb-1.5">Quick popular tags:</p>
              <div className="flex flex-wrap gap-1">
                {POPULAR_SKILLS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (!form.skills.includes(s)) {
                        toggleArrayItem('skills', s)
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                      form.skills.includes(s)
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Languages Supported */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Languages Supported
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => {
                const active = form.languages.includes(lang)
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleArrayItem('languages', lang)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {lang}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Biography */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Professional Biography <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  form.bio.length < 50 ? 'text-amber-600' : 'text-slate-400'
                }`}
              >
                {form.bio.length} / 50 min chars
              </span>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Tell students about your journey, engineering challenges you solved, and how you can support their interview or career growth..."
              value={form.bio}
              onChange={(e) => {
                const updated = { ...form, bio: e.target.value }
                setForm(updated)
                saveLocalDraft(updated, currentStep)
              }}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 4: Session Preferences
          ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Session Formats & Preferences</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure session durations, fair student pricing, and weekly mentoring capacity.
            </p>
          </div>

          {/* Session Durations */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Session Durations Offered <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[30, 45, 60].map((dur) => {
                const active = form.session_duration_mins.includes(dur)
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => toggleDuration(dur)}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {dur} Minutes
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Students can choose from whichever durations you enable here.
            </p>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Session Fee (INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  required
                  value={form.session_price_inr}
                  onChange={(e) => {
                    const updated = { ...form, session_price_inr: parseInt(e.target.value || '0', 10) }
                    setForm(updated)
                    saveLocalDraft(updated, currentStep)
                  }}
                  className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Recommended for students: ₹400 – ₹1,200.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Weekly Mentoring Capacity
              </label>
              <select
                value={form.weekly_capacity}
                onChange={(e) => {
                  const updated = { ...form, weekly_capacity: parseInt(e.target.value, 10) }
                  setForm(updated)
                  saveLocalDraft(updated, currentStep)
                }}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
              >
                <option value={2}>1 - 2 sessions / week (~1-2 hrs)</option>
                <option value={4}>3 - 5 sessions / week (~3-5 hrs)</option>
                <option value={8}>6 - 10 sessions / week (~6-10 hrs)</option>
                <option value={15}>10+ sessions / week (High availability)</option>
              </select>
            </div>
          </div>

          {/* Consultation Format (Google Meet) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Consultation Meeting Format</h4>
                <p className="text-xs text-slate-500">Google Meet (Auto-generated calendar video link)</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              Standardized
            </span>
          </div>

          {/* Target Student Audience */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Preferred Student Audience
            </label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map((aud) => {
                const active = form.target_audience.includes(aud)
                return (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => toggleArrayItem('target_audience', aud)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {aud}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 5: Review & Submit
          ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-fade-in">
          {/* Marketplace Card Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Profile Preview</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  This is how students will discover and view your profile in the marketplace.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Pending Verification
              </span>
            </div>

            {/* Profile Card Mockup */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={form.avatar_url || CURATED_AVATARS[0]}
                  alt={form.full_name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{form.full_name || 'Your Full Name'}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {form.title || 'Your Job Title'} at{' '}
                    <strong className="text-slate-900">{form.organisation || 'Your Company'}</strong>
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{form.years_experience} Years Exp</span>
                    <span>&bull;</span>
                    <span>{form.primary_domain}</span>
                    <span>&bull;</span>
                    <span>{form.country}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                {form.bio || 'Your bio will appear here once entered in Step 3.'}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {form.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-200 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <span>Languages: {form.languages.join(', ')}</span>
                  <span>&bull;</span>
                  <span>Format: Google Meet</span>
                </div>
                <div className="text-slate-900 font-bold text-sm">
                  ₹{form.session_price_inr}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    / {form.session_duration_mins.join('/')} mins
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Application Summary Checklist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-800">Basic Info & Time Zone</p>
                  <p className="text-slate-500">{form.email} &bull; {form.timezone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-800">Experience & LinkedIn</p>
                  <p className="text-slate-500">{form.title} ({form.years_experience} YOE)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-800">Expertise & Topics</p>
                  <p className="text-slate-500">{form.mentoring_topics.length} topics &bull; {form.skills.length} skills</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-800">Session Preferences</p>
                  <p className="text-slate-500">₹{form.session_price_inr} &bull; {form.session_duration_mins.join(', ')} mins</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.terms_accepted}
                onChange={(e) => {
                  const updated = { ...form, terms_accepted: e.target.checked }
                  setForm(updated)
                  saveLocalDraft(updated, currentStep)
                }}
                className="w-4 h-4 rounded mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                I verify that all professional details provided are accurate and reflect real industry experience.
                I agree to the <strong>PathPilot AI Mentoring Conduct Code</strong>, privacy policy, and understanding
                that my profile will be placed in review prior to appearing in the student marketplace.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* ── Action Buttons Footer ───────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Save Draft</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitApproval}
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:shadow-lg disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{saving ? 'Submitting...' : 'Submit Profile for Approval'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
