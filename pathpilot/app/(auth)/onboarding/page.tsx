'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  GraduationCap,
  Briefcase,
  Target,
  Compass,
  Trash2,
  Plus,
  X,
  ShieldCheck,
  Check,
  Clock,
  User,
  Link as LinkIcon,
  Award,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { saveOnboardingProfile, parseResumeWithBackend, ResumeParseResult } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatusOption =
  | 'College student'
  | 'Recent graduate'
  | 'Working professional'
  | 'Career switcher'
  | 'Other'

export type PrimaryGoalOption =
  | 'Find an internship'
  | 'Secure my first job'
  | 'Prepare for placements'
  | 'Explore career options'
  | 'Change careers'
  | 'Grow in my current role'

export type WeeklyHoursOption =
  | '3–5 hours'
  | '6–10 hours'
  | '11–15 hours'
  | '16+ hours'

export interface ExtractedProject {
  title: string
  description: string
  technologies: string[]
}

export interface ExtractedExperience {
  company: string
  role: string
  duration: string
  description: string
}

export interface ExtractedLink {
  type: string
  url: string
}

export interface OnboardingState {
  // Step A: Resume
  resumeFile: File | null
  resumeFileName: string
  resumeFileSize: number | null
  resumeConsent: boolean
  resumeSkipped: boolean
  resumeParsed: boolean

  // Step B: Extracted & Confirmed Profile
  fullName: string
  email: string
  phone: string
  location: string
  degree: string
  branch: string
  college: string
  graduationYear: string
  technicalSkills: string[]
  nonTechnicalSkills: string[]
  projects: ExtractedProject[]
  experience: ExtractedExperience[]
  certifications: string[]
  links: ExtractedLink[]
  summary: string
  recommendedRoles: Array<{ title: string; match: number; domain: string }>

  // Step C: Essential Career Questions
  currentStatus: StatusOption | ''
  careerInterests: string[]
  primaryGoal: PrimaryGoalOption | ''
  hasTargetRole: boolean | null
  targetRole: string
  weeklyHours: WeeklyHoursOption | ''
}

const DEFAULT_STATE: OnboardingState = {
  resumeFile: null,
  resumeFileName: '',
  resumeFileSize: null,
  resumeConsent: true,
  resumeSkipped: false,
  resumeParsed: false,

  fullName: '',
  email: '',
  phone: '',
  location: 'India',
  degree: '',
  branch: '',
  college: '',
  graduationYear: '2026',
  technicalSkills: [],
  nonTechnicalSkills: [],
  projects: [],
  experience: [],
  certifications: [],
  links: [],
  summary: '',
  recommendedRoles: [],

  currentStatus: 'College student',
  careerInterests: [],
  primaryGoal: 'Prepare for placements',
  hasTargetRole: null,
  targetRole: '',
  weeklyHours: '6–10 hours',
}

const STATUS_LIST: StatusOption[] = [
  'College student',
  'Recent graduate',
  'Working professional',
  'Career switcher',
  'Other',
]

const CAREER_AREAS = [
  'Software Development',
  'Cybersecurity',
  'Data Analytics',
  'Product Management',
  'Cloud and DevOps',
  'UI/UX Design',
  'Digital Marketing',
  'Business Analysis',
  'Finance and Consulting',
  'Other',
  'Not sure yet',
]

const GOAL_OPTIONS: PrimaryGoalOption[] = [
  'Find an internship',
  'Secure my first job',
  'Prepare for placements',
  'Explore career options',
  'Change careers',
  'Grow in my current role',
]

const TIME_OPTIONS: WeeklyHoursOption[] = [
  '3–5 hours',
  '6–10 hours',
  '11–15 hours',
  '16+ hours',
]

const POPULAR_TARGET_ROLES = [
  'Full Stack Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'Associate Product Manager (APM)',
  'Cybersecurity Analyst',
  'Cloud & DevOps Engineer',
  'UI/UX Designer',
  'Machine Learning Engineer',
]

export default function OnboardingPage() {
  const router = useRouter()
  // Active step: 1 = Resume Upload, 2 = Review Extracted Profile, 3 = Career Questions, 4 = Review & Launch
  const [step, setStep] = useState<number>(1)
  const [data, setData] = useState<OnboardingState>(DEFAULT_STATE)
  const [isParsing, setIsParsing] = useState<boolean>(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Local inputs for adding items in Step B
  const [newTechSkill, setNewTechSkill] = useState('')
  const [newNonTechSkill, setNewNonTechSkill] = useState('')
  const [showAddProject, setShowAddProject] = useState(false)
  const [newProject, setNewProject] = useState<ExtractedProject>({ title: '', description: '', technologies: [] })
  const [showAddExp, setShowAddExp] = useState(false)
  const [newExp, setNewExp] = useState<ExtractedExperience>({ company: '', role: '', duration: '', description: '' })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState<boolean>(false)

  // ── Restore saved draft on mount ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Check if auth user metadata provides initial full name or email
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            const userName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              (user.email ? user.email.split('@')[0] : '')
            const userEmail = user.email || ''

            setData((prev) => ({
              ...prev,
              fullName: prev.fullName || userName,
              email: prev.email || userEmail,
            }))
          }
        })
      }
    })

    // 2. Load draft from localStorage if present
    try {
      const draft = localStorage.getItem('pathpilot_onboarding_draft')
      if (draft) {
        const parsed = JSON.parse(draft)
        setData((prev) => ({ ...prev, ...parsed }))
        if (parsed.savedStep && parsed.savedStep >= 1 && parsed.savedStep <= 4) {
          setStep(parsed.savedStep)
        }
      }
    } catch {
      // ignore draft parse issue
    }
  }, [])

  // ── Autosave draft on change ──────────────────────────────────────────────
  const persistDraft = useCallback((updated: Partial<OnboardingState>, newStep?: number) => {
    setData((prev) => {
      const next = { ...prev, ...updated }
      if (typeof window !== 'undefined') {
        const toSave = { ...next, resumeFile: null, savedStep: newStep ?? step }
        localStorage.setItem('pathpilot_onboarding_draft', JSON.stringify(toSave))
      }
      return next
    })
  }, [step])

  // ── File Drag & Drop handlers ─────────────────────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  const handleFileSelected = (file: File) => {
    setParseError(null)
    const validExts = ['.pdf', '.docx', '.txt']
    const nameLower = file.name.toLowerCase()
    const isValid = validExts.some((ext) => nameLower.endsWith(ext))

    if (!isValid) {
      setParseError('Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt) file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setParseError('File size exceeds the 10 MB limit. Please upload a smaller file.')
      return
    }

    setData((prev) => ({
      ...prev,
      resumeFile: file,
      resumeFileName: file.name,
      resumeFileSize: file.size,
    }))
  }

  // ── Execute Resume Parsing ────────────────────────────────────────────────
  const handleExtractResume = async () => {
    if (!data.resumeFile) {
      setParseError('Please choose a resume file to extract.')
      return
    }
    if (!data.resumeConsent) {
      setParseError('Please consent to document processing before proceeding.')
      return
    }

    setIsParsing(true)
    setParseError(null)

    try {
      const result = await parseResumeWithBackend(data.resumeFile)

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Unable to parse document. Please ensure the file contains readable text.')
      }

      const parsed: ResumeParseResult = result.data

      // Extract skills arrays
      const techSkills = parsed.skills_breakdown?.technical?.length
        ? parsed.skills_breakdown.technical
        : (parsed.skills || []).slice(0, 10)
      const nonTechSkills = parsed.skills_breakdown?.non_technical || []

      // Prefill state cleanly without fabricating
      const updatedProfile: Partial<OnboardingState> = {
        resumeParsed: true,
        resumeSkipped: false,
        fullName: parsed.full_name || data.fullName,
        email: parsed.email || data.email,
        phone: parsed.phone || data.phone,
        degree: parsed.education?.degree || data.degree,
        branch: parsed.education?.branch || data.branch,
        college: parsed.education?.college || data.college,
        graduationYear: parsed.education?.graduation_year || data.graduationYear,
        summary: parsed.summary || '',
        technicalSkills: techSkills,
        nonTechnicalSkills: nonTechSkills,
        projects: parsed.projects || [],
        experience: (parsed.experience || []).map((exp) => ({
          company: exp.company,
          role: exp.role,
          duration: exp.duration || '',
          description: exp.description || '',
        })),
        certifications: parsed.certifications || [],
        links: parsed.links || [],
        recommendedRoles: parsed.recommendedRoles || [],
      }

      // If AI recommended roles, suggest the top one as default target role
      if (parsed.recommendedRoles?.[0]?.title) {
        updatedProfile.targetRole = parsed.recommendedRoles[0].title
        updatedProfile.hasTargetRole = true
      }

      persistDraft(updatedProfile, 2)
      setStep(2)
    } catch (err: any) {
      console.error('Resume extraction error:', err)
      setParseError(err.message || 'An error occurred while analyzing your resume. You can retry or skip to manual entry.')
    } finally {
      setIsParsing(false)
    }
  }

  // ── Skip Resume Flow ──────────────────────────────────────────────────────
  const handleSkipResume = () => {
    persistDraft({ resumeSkipped: true, resumeFile: null }, 3)
    setStep(3)
  }

  // ── Remove or Replace Resume ──────────────────────────────────────────────
  const handleRemoveResume = () => {
    setData((prev) => ({
      ...prev,
      resumeFile: null,
      resumeFileName: '',
      resumeFileSize: null,
      resumeParsed: false,
    }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Add/Remove Technical Skills ───────────────────────────────────────────
  const addTechnicalSkill = () => {
    const s = newTechSkill.trim()
    if (s && !data.technicalSkills.includes(s)) {
      persistDraft({ technicalSkills: [...data.technicalSkills, s] })
      setNewTechSkill('')
    }
  }
  const removeTechnicalSkill = (skill: string) => {
    persistDraft({ technicalSkills: data.technicalSkills.filter((s) => s !== skill) })
  }

  // ── Add/Remove Non-Tech Skills ────────────────────────────────────────────
  const addNonTechSkill = () => {
    const s = newNonTechSkill.trim()
    if (s && !data.nonTechnicalSkills.includes(s)) {
      persistDraft({ nonTechnicalSkills: [...data.nonTechnicalSkills, s] })
      setNewNonTechSkill('')
    }
  }
  const removeNonTechSkill = (skill: string) => {
    persistDraft({ nonTechnicalSkills: data.nonTechnicalSkills.filter((s) => s !== skill) })
  }

  // ── Toggle Career Interest ────────────────────────────────────────────────
  const toggleInterest = (area: string) => {
    const current = data.careerInterests
    let updated: string[] = []
    if (area === 'Not sure yet') {
      updated = ['Not sure yet']
    } else {
      const filtered = current.filter((i) => i !== 'Not sure yet')
      updated = filtered.includes(area)
        ? filtered.filter((i) => i !== area)
        : [...filtered, area]
    }
    persistDraft({ careerInterests: updated })
  }

  // ── Submit / Final Profile Build ──────────────────────────────────────────
  const handleBuildProfile = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    // Construct unified profile payload
    const finalProfile = {
      full_name: data.fullName || 'Student',
      fullName: data.fullName || 'Student',
      email: data.email,
      phone: data.phone,
      current_status: data.currentStatus || 'College student',
      degree: data.degree,
      branch: data.branch,
      college_name: data.college,
      graduation_year: data.graduationYear,
      country: data.location || 'India',
      preferred_location: data.location || 'India',
      resume_uploaded: data.resumeParsed,
      resume_file_name: data.resumeFileName,
      career_interests: data.careerInterests,
      career_objective: data.primaryGoal,
      target_job_role: data.hasTargetRole ? data.targetRole : null,
      targetRole: data.hasTargetRole ? data.targetRole : null,
      hours_per_week: data.weeklyHours === '3–5 hours' ? 4 : data.weeklyHours === '6–10 hours' ? 8 : data.weeklyHours === '11–15 hours' ? 12 : 16,
      skills: [
        ...data.technicalSkills.map((name) => ({ name, level: 'Intermediate' as const })),
        ...data.nonTechnicalSkills.map((name) => ({ name, level: 'Beginner' as const })),
      ],
      projects: data.projects,
      experience: data.experience,
      certifications: data.certifications,
      links: data.links,
      summary: data.summary,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }

    try {
      // 1. Save to Python backend & Supabase metadata (with 4s max timeout so UI never hangs)
      await Promise.race([
        saveOnboardingProfile(finalProfile),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ])

      // 2. Persist locally
      if (typeof window !== 'undefined') {
        localStorage.setItem('pathpilot_student_profile', JSON.stringify(finalProfile))
        localStorage.setItem('pathpilot_onboarding_completed', 'true')
        if (data.targetRole) {
          localStorage.setItem('pathpilot_target_role', data.targetRole)
        }
        if (data.resumeParsed && data.recommendedRoles.length > 0) {
          localStorage.setItem(
            'pathpilot_resume_analysis',
            JSON.stringify({
              summary: data.summary,
              skills: data.technicalSkills,
              recommendedRoles: data.recommendedRoles,
            })
          )
        }
        // Set client cookie so middleware recognizes completion immediately
        document.cookie = 'pathpilot_onboarded=true; path=/; max-age=2592000'
        // Clear draft
        localStorage.removeItem('pathpilot_onboarding_draft')

        // 3. Navigate directly to Dashboard
        window.location.href = '/dashboard'
        return
      }

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Save onboarding error:', err)
      // Even if network errored, let the user proceed since draft is saved locally
      if (typeof window !== 'undefined') {
        document.cookie = 'pathpilot_onboarded=true; path=/; max-age=2592000'
        window.location.href = '/dashboard'
        return
      }
      setSubmitError(err.message || 'Failed to save profile. Please try again.')
      setIsSubmitting(false)
    }
  }

  // ── Format file size helper ───────────────────────────────────────────────
  const formatSize = (bytes: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Top Stepper Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {[
              { num: 1, label: 'Resume' },
              { num: 2, label: 'Extracted Profile' },
              { num: 3, label: 'Career Goals' },
              { num: 4, label: 'Complete' },
            ].map((s, idx) => {
              const isCompleted = step > s.num
              const isCurrent = step === s.num
              return (
                <div key={s.num} className="flex-1 flex flex-col items-center relative">
                  <div className="flex items-center w-full">
                    <div
                      className={`h-0.5 w-full ${
                        idx === 0 ? 'invisible' : isCompleted || isCurrent ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                          : 'bg-white text-slate-400 border-2 border-slate-200'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                    </div>
                    <div
                      className={`h-0.5 w-full ${
                        idx === 3 ? 'invisible' : isCompleted ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    />
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-semibold tracking-tight ${
                      isCurrent ? 'text-blue-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 1 / A: UPLOAD RESUME                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs animate-in fade-in duration-200 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Resume-First Career Setup
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Let&apos;s start with your resume.
              </h1>
              <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
                Upload your resume and we&apos;ll extract your education, skills, projects, and experience to help personalize your career guidance.
              </p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/60'
                  : data.resumeFile
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-blue-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                className="hidden"
                id="resume-file-input"
              />

              {data.resumeFile ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{data.resumeFileName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{formatSize(data.resumeFileSize)}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <label
                      htmlFor="resume-file-input"
                      className="px-4 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs"
                    >
                      Change file
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Drag and drop your resume here, or{' '}
                      <label htmlFor="resume-file-input" className="text-blue-600 hover:underline cursor-pointer font-bold">
                        browse files
                      </label>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PDF (.pdf), Word (.docx), or plain text (.txt) &bull; Max size: 10 MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Why we collect this explanation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 leading-relaxed">
              <span className="font-bold text-slate-900 block">Why we collect this:</span>
              <p>
                We analyze your existing skills and background to recommend entry-level roles that match your capabilities, identify missing competencies, and pair you with relevant mentors. Your resume stays confidential and is never shared publicly.
              </p>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={data.resumeConsent}
                onChange={(e) => setData((prev) => ({ ...prev, resumeConsent: e.target.checked }))}
                className="mt-0.5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
              />
              <span className="text-xs text-slate-700 leading-snug">
                I consent to PathPilot AI analyzing my resume to personalize my career guidance and prefill my student profile.
              </span>
            </label>

            {/* Error banner */}
            {parseError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{parseError}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkipResume}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all order-2 sm:order-1"
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={handleExtractResume}
                disabled={!data.resumeFile || isParsing || !data.resumeConsent}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer order-1 sm:order-2"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting Profile Details...</span>
                  </>
                ) : (
                  <>
                    <span>Extract &amp; Review Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 2 / B: EXTRACT & REVIEW INFORMATION                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs animate-in fade-in duration-200 space-y-8">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Extracted from Resume &bull; Fully Editable
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  Upload different resume
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Review your extracted profile
              </h1>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                We prefilled this information from your resume. Review each section, correct any inaccuracies, and add any missing details.
              </p>
            </div>

            {/* Section 1: Personal & Contact */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                1. Personal &amp; Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={data.fullName}
                    onChange={(e) => persistDraft({ fullName: e.target.value })}
                    placeholder="e.g. Himanshu Shukla"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => persistDraft({ email: e.target.value })}
                    placeholder="e.g. candidate@university.edu"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => persistDraft({ phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Country</label>
                  <input
                    type="text"
                    value={data.location}
                    onChange={(e) => persistDraft({ location: e.target.value })}
                    placeholder="e.g. Bangalore, India"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Education Credentials */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                2. Academic Background
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Degree / Qualification</label>
                  <input
                    type="text"
                    value={data.degree}
                    onChange={(e) => persistDraft({ degree: e.target.value })}
                    placeholder="e.g. B.Tech / B.E."
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch / Major</label>
                  <input
                    type="text"
                    value={data.branch}
                    onChange={(e) => persistDraft({ branch: e.target.value })}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College / University</label>
                  <input
                    type="text"
                    value={data.college}
                    onChange={(e) => persistDraft({ college: e.target.value })}
                    placeholder="e.g. National Institute of Technology"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
                  <select
                    value={data.graduationYear}
                    onChange={(e) => persistDraft({ graduationYear: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                      <option key={yr} value={String(yr)}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Skills Breakdown */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                3. Skills &amp; Competencies
              </h2>
              {/* Technical skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Technical Skills</label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {data.technicalSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-800"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() => removeTechnicalSkill(sk)}
                        className="text-blue-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {data.technicalSkills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No technical skills added yet.</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTechSkill}
                    onChange={(e) => setNewTechSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTechnicalSkill()
                      }
                    }}
                    placeholder="Add a technical skill (e.g. React, SQL, Python)..."
                    className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTechnicalSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Non-technical skills */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Non-Technical &amp; Analytical Skills</label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {data.nonTechnicalSkills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() => removeNonTechSkill(sk)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {data.nonTechnicalSkills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No non-technical skills added yet.</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNonTechSkill}
                    onChange={(e) => setNewNonTechSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addNonTechSkill()
                      }
                    }}
                    placeholder="Add a non-technical skill (e.g. Communication, Problem Solving)..."
                    className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addNonTechSkill}
                    className="px-4 py-2 bg-slate-700 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Projects & Experience */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                4. Projects &amp; Work Experience
              </h2>

              {/* Projects List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700">Projects ({data.projects.length})</span>
                {data.projects.map((proj, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{proj.title}</span>
                      <button
                        type="button"
                        onClick={() => persistDraft({ projects: data.projects.filter((_, i) => i !== idx) })}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {showAddProject ? (
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs"
                    />
                    <textarea
                      placeholder="Short description of what you built and key impact"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddProject(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (newProject.title.trim()) {
                            persistDraft({ projects: [...data.projects, newProject] })
                            setNewProject({ title: '', description: '', technologies: [] })
                            setShowAddProject(false)
                          }
                        }}
                        className="px-4 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Save Project
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddProject(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add a Project
                  </button>
                )}
              </div>

              {/* Experience List */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold text-slate-700">Internships &amp; Experience ({data.experience.length})</span>
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {exp.role} &bull; <span className="text-blue-600">{exp.company}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => persistDraft({ experience: data.experience.filter((_, i) => i !== idx) })}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {exp.duration && <span className="text-[11px] text-slate-500 block">{exp.duration}</span>}
                    {exp.description && <p className="text-slate-600 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}

                {showAddExp ? (
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Company / Organization"
                        value={newExp.company}
                        onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                        className="rounded-lg bg-white border border-slate-200 p-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Role / Title"
                        value={newExp.role}
                        onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                        className="rounded-lg bg-white border border-slate-200 p-2 text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Duration (e.g. Summer 2025)"
                      value={newExp.duration}
                      onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                      className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddExp(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (newExp.company.trim() && newExp.role.trim()) {
                            persistDraft({ experience: [...data.experience, newExp] })
                            setNewExp({ company: '', role: '', duration: '', description: '' })
                            setShowAddExp(false)
                          }
                        }}
                        className="px-4 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Save Experience
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddExp(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Experience or Internship
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Career Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 3 / C: ESSENTIAL CAREER QUESTIONS                             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs animate-in fade-in duration-200 space-y-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                Step 3 of 4 &bull; Tailor Your Guidance
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tell us about your career goals
              </h1>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                Answer these 5 quick questions that can&apos;t be inferred from a resume alone.
              </p>
            </div>

            {/* Question 1: Current Status */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                1. What is your current status?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STATUS_LIST.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => persistDraft({ currentStatus: opt })}
                    className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      data.currentStatus === opt
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {data.currentStatus === opt && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Career Interests (Multi-select) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  2. Which career areas interest you?
                </label>
                <span className="text-[11px] text-slate-500">Select all that apply</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CAREER_AREAS.map((area) => {
                  const isSelected = data.careerInterests.includes(area)
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleInterest(area)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {area}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Question 3: Primary Goal */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                3. What is your primary goal right now?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => persistDraft({ primaryGoal: g })}
                    className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      data.primaryGoal === g
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{g}</span>
                    {data.primaryGoal === g && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4: Selected a Target Role? */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                4. Have you selected a target role?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => persistDraft({ hasTargetRole: true })}
                  className={`p-4 rounded-2xl border text-left text-xs transition-all ${
                    data.hasTargetRole === true
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold block text-sm mb-1">Yes, I have a specific role in mind</span>
                  <span className="text-[11px] text-slate-500">I will choose or type my target job title</span>
                </button>

                <button
                  type="button"
                  onClick={() => persistDraft({ hasTargetRole: false, targetRole: '' })}
                  className={`p-4 rounded-2xl border text-left text-xs transition-all ${
                    data.hasTargetRole === false
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold block text-sm mb-1">Not yet, help me explore</span>
                  <span className="text-[11px] text-slate-500">Recommend entry-level roles based on my skills</span>
                </button>
              </div>

              {/* If Yes: Select or Enter Target Role */}
              {data.hasTargetRole === true && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-3 animate-in fade-in">
                  <label className="block text-xs font-semibold text-slate-700">Choose or type your target role:</label>
                  <input
                    type="text"
                    value={data.targetRole}
                    onChange={(e) => persistDraft({ targetRole: e.target.value })}
                    placeholder="e.g. Full Stack Developer, Product Manager, Data Analyst"
                    className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-500 mr-1 self-center">Suggestions:</span>
                    {POPULAR_TARGET_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => persistDraft({ targetRole: role })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                          data.targetRole === role
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Question 5: Weekly Hours */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                5. How much time can you spend preparing each week?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TIME_OPTIONS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => persistDraft({ weeklyHours: time })}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all ${
                      data.weeklyHours === time
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(data.resumeParsed ? 2 : 1)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Review &amp; Finish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 4 / D: COMPLETE ONBOARDING & BUILD CAREER PROFILE             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs animate-in fade-in duration-200 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Final Step &bull; Review &amp; Launch
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ready to build your career profile
              </h1>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                Here is a concise summary of your profile information. Once saved, you&apos;ll be directed straight to your personalized student dashboard.
              </p>
            </div>

            {/* Concise Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Identity & Education */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                  Identity &amp; Background
                </span>
                <div className="font-bold text-sm text-slate-900">{data.fullName || 'Student'}</div>
                <div className="text-slate-600">
                  {data.degree ? `${data.degree} (${data.branch || 'Engineering'})` : 'Degree: In progress'}
                </div>
                {data.college && <div className="text-slate-600">{data.college}</div>}
                <div className="text-slate-500 font-medium">
                  {data.currentStatus || 'College student'} &bull; Class of {data.graduationYear || '2026'}
                </div>
              </div>

              {/* Card 2: Career Strategy */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs">
                <span className="font-bold text-blue-700 uppercase tracking-wider text-[10px] block">
                  Career Direction &amp; Goal
                </span>
                <div className="font-bold text-sm text-blue-950">
                  {data.hasTargetRole && data.targetRole ? data.targetRole : 'Open Career Exploration'}
                </div>
                <div className="text-blue-900 font-medium">Primary Goal: {data.primaryGoal || 'Explore career options'}</div>
                <div className="text-blue-800">Commitment: {data.weeklyHours || '6–10 hours/week'}</div>
              </div>
            </div>

            {/* Extracted Skills Preview if present */}
            {data.technicalSkills.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Key Skills Configured ({data.technicalSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.technicalSkills.slice(0, 12).map((sk) => (
                    <span key={sk} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium">
                      {sk}
                    </span>
                  ))}
                  {data.technicalSkills.length > 12 && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-xs">
                      +{data.technicalSkills.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Launch Action */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit Answers
              </button>

              <button
                type="button"
                onClick={handleBuildProfile}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Career Profile...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Build My Career Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
