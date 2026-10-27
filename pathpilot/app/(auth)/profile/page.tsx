'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  User,
  GraduationCap,
  Clock,
  Briefcase,
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Target,
  Mail,
  Award,
  BookOpen,
  Users,
  MapPin,
  X,
  Plus,
  AlertCircle,
  Pencil,
  Check,
  Phone,
  Eye,
  Lock,
  Compass
} from 'lucide-react'
import { saveOnboardingProfile } from '@/lib/api-client'
import type { UserSkill } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  first_year: 'First-year college student',
  second_year: 'Second-year college student',
  third_year: 'Third-year college student',
  final_year: 'Final-year college student',
  recent_graduate: 'Recent graduate',
  working_professional: 'Working professional',
  career_switcher: 'Career switcher',
  other: 'Other',
  'College student': 'College student',
  'Recent graduate': 'Recent graduate',
  'Working professional': 'Working professional',
  'Career switcher': 'Career switcher',
}

const INTEREST_LABELS: Record<string, string> = {
  software_dev: 'Software Development',
  cybersecurity: 'Cybersecurity',
  data_analytics: 'Data Analytics & Data Science',
  product_mgmt: 'Product Management',
  cloud_devops: 'Cloud Computing & DevOps',
  uiux_design: 'UI/UX Design',
  digital_marketing: 'Digital Marketing',
  business_analysis: 'Business Analysis',
  finance_consulting: 'Finance & Consulting',
  other: 'Other',
  not_sure: 'Not sure yet',
}

const ALL_INTERESTS = [
  'Software Development',
  'Cybersecurity',
  'Data Analytics',
  'Product Management',
  'Cloud and DevOps',
  'UI/UX Design',
  'Digital Marketing',
  'Business Analysis',
  'Finance and Consulting',
]

export default function ProfilePage() {
  // Identity
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [currentStatus, setCurrentStatus] = useState('College student')
  const [location, setLocation] = useState('India')

  // Education & Experience
  const [degree, setDegree] = useState('')
  const [branch, setBranch] = useState('')
  const [college, setCollege] = useState('')
  const [gradYear, setGradYear] = useState('2026')
  const [yearsExperience, setYearsExperience] = useState('0')

  // Skills & Interests
  const [skills, setSkills] = useState<UserSkill[]>([])
  const [careerInterests, setCareerInterests] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [skillLevel, setSkillLevel] = useState<UserSkill['level']>('Beginner')

  // Career Goals
  const [targetRole, setTargetRole] = useState('')
  const [primaryGoal, setPrimaryGoal] = useState('Prepare for placements')
  const [hoursPerWeek, setHoursPerWeek] = useState(8)

  // Mentoring Preferences
  const [preferredLanguage, setPreferredLanguage] = useState('English')
  const [sessionBudget, setSessionBudget] = useState('Flexible')
  const [sessionDuration, setSessionDuration] = useState('30 minutes')

  // Resume & Privacy
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [resumeFileName, setResumeFileName] = useState('')
  const [profileVisibility, setProfileVisibility] = useState('Mentors Only')
  const [consentGiven, setConsentGiven] = useState(true)

  // Section Edit States
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingEducation, setEditingEducation] = useState(false)
  const [editingSkills, setEditingSkills] = useState(false)
  const [editingGoals, setEditingGoals] = useState(false)
  const [editingMentoring, setEditingMentoring] = useState(false)
  const [editingPrivacy, setEditingPrivacy] = useState(false)

  // Feedback states
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Supabase User info
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            const name =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              (user.email ? user.email.split('@')[0] : '')
            setFullName(name)
            setEmail(user.email || '')
            setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || '')
          }
        })
      }
    })

    // 2. Load Student Profile
    const stored = localStorage.getItem('pathpilot_student_profile')
    if (stored) {
      try {
        const p = JSON.parse(stored)
        if (p.full_name) setFullName(p.full_name)
        else if (p.fullName && !fullName) setFullName(p.fullName)
        if (p.email) setEmail(p.email)
        if (p.phone) setPhone(p.phone)
        if (p.current_status) setCurrentStatus(p.current_status)
        if (p.preferred_location || p.country) setLocation(p.preferred_location || p.country)

        if (p.degree) setDegree(p.degree)
        if (p.branch) setBranch(p.branch)
        if (p.college_name || p.college) setCollege(p.college_name || p.college)
        if (p.graduation_year || p.graduationYear) setGradYear(p.graduation_year || p.graduationYear)
        if (p.years_experience !== undefined) setYearsExperience(String(p.years_experience))

        if (p.skills && Array.isArray(p.skills)) setSkills(p.skills)
        if (p.career_interests && Array.isArray(p.career_interests)) setCareerInterests(p.career_interests)

        if (p.target_job_role || p.targetRole) setTargetRole(p.target_job_role || p.targetRole)
        if (p.career_objective) setPrimaryGoal(p.career_objective)
        if (p.hours_per_week || p.hoursPerWeek) setHoursPerWeek(p.hours_per_week || p.hoursPerWeek)

        if (p.mentor_language) setPreferredLanguage(p.mentor_language)
        if (p.session_budget) setSessionBudget(p.session_budget)

        if (p.resume_uploaded) setResumeUploaded(true)
        if (p.resume_file_name) setResumeFileName(p.resume_file_name)
      } catch {}
    }

    const targetStored = localStorage.getItem('pathpilot_target_role')
    if (targetStored) setTargetRole(targetStored)
  }, [])

  // Persist helper
  const saveAll = async () => {
    setIsSaving(true)
    const updated = {
      full_name: fullName,
      fullName,
      email,
      phone,
      current_status: currentStatus,
      preferred_location: location,
      country: location,
      degree,
      branch,
      college_name: college,
      graduation_year: gradYear,
      years_experience: Number(yearsExperience) || 0,
      skills,
      career_interests: careerInterests,
      target_job_role: targetRole,
      targetRole,
      career_objective: primaryGoal,
      hours_per_week: hoursPerWeek,
      mentor_language: preferredLanguage,
      session_budget: sessionBudget,
      resume_uploaded: resumeUploaded,
      resume_file_name: resumeFileName,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }

    try {
      await saveOnboardingProfile(updated)
      if (typeof window !== 'undefined') {
        localStorage.setItem('pathpilot_student_profile', JSON.stringify(updated))
        if (targetRole) localStorage.setItem('pathpilot_target_role', targetRole)
      }
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch (e) {
      console.error('Failed to save profile:', e)
    } finally {
      setIsSaving(false)
    }
  }

  // Skills handlers
  const addSkill = () => {
    const s = skillInput.trim()
    if (!s) return
    if (skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase())) return
    setSkills((prev) => [...prev, { name: s, level: skillLevel }])
    setSkillInput('')
  }
  const removeSkill = (name: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== name))
  }

  const toggleInterest = (interest: string) => {
    setCareerInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  return (
    <div className="page-container animate-fade-in max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5 text-blue-600" />
            Profile &amp; Career Account
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Profile Summary
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            An editable overview of your credentials, verified skills, target roles, and mentorship preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={saveAll}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-center disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save All Changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Profile updated successfully! Changes saved across your account and dashboard.</span>
        </div>
      )}

      {/* ── SECTION 1: Personal Information ───────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            1. Personal &amp; Contact Information
          </h2>
          <button
            type="button"
            onClick={() => {
              if (editingPersonal) saveAll()
              setEditingPersonal(!editingPersonal)
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            {editingPersonal ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editingPersonal ? 'Done' : 'Edit Section'}
          </button>
        </div>

        {editingPersonal ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Academic Status</label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="College student">College student</option>
                <option value="Recent graduate">Recent graduate</option>
                <option value="Working professional">Working professional</option>
                <option value="Career switcher">Career switcher</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">{fullName || 'Not provided'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 block truncate">{email || 'Not provided'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone</span>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 block">{phone || 'Not provided'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location &amp; Status</span>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                {location} &bull; {STATUS_LABELS[currentStatus] || currentStatus}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 2: Education and Experience ────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            2. Education &amp; Experience
          </h2>
          <button
            type="button"
            onClick={() => {
              if (editingEducation) saveAll()
              setEditingEducation(!editingEducation)
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            {editingEducation ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editingEducation ? 'Done' : 'Edit Section'}
          </button>
        </div>

        {editingEducation ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree / Qualification</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech / B.E."
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch / Specialization</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
              <select
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                  <option key={yr} value={String(yr)}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Degree &amp; Branch</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                {degree || 'In Progress'} {branch ? `(${branch})` : ''}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Institution</span>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 block truncate">{college || 'University'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Graduation</span>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 block">Class of {gradYear}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prior Experience</span>
              <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                {Number(yearsExperience) > 0 ? `${yearsExperience} years` : 'Entry-level candidate'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: Skills and Career Interests ─────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            3. Skills &amp; Career Interests
          </h2>
          <button
            type="button"
            onClick={() => {
              if (editingSkills) saveAll()
              setEditingSkills(!editingSkills)
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            {editingSkills ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editingSkills ? 'Done' : 'Edit Section'}
          </button>
        </div>

        <div className="space-y-4 pt-1">
          {/* Skills Chips */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">Tracked Competencies ({skills.length})</span>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-900"
                >
                  {skill.name}
                  {editingSkills && (
                    <button
                      type="button"
                      onClick={() => removeSkill(skill.name)}
                      className="text-blue-500 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-400 italic">No skills recorded yet.</span>
              )}
            </div>

            {editingSkills && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Next.js, SQL, Figma)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                  className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Career Interests */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-2">Selected Career Areas</span>
            <div className="flex flex-wrap gap-2">
              {editingSkills
                ? ALL_INTERESTS.map((interest) => {
                    const isSelected = careerInterests.includes(interest)
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {interest}
                      </button>
                    )
                  })
                : careerInterests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                    >
                      {INTEREST_LABELS[interest] || interest}
                    </span>
                  ))}
              {!editingSkills && careerInterests.length === 0 && (
                <span className="text-xs text-slate-400 italic">No career areas selected.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Career Goals ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            4. Career Goals &amp; Availability
          </h2>
          <button
            type="button"
            onClick={() => {
              if (editingGoals) saveAll()
              setEditingGoals(!editingGoals)
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            {editingGoals ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editingGoals ? 'Done' : 'Edit Section'}
          </button>
        </div>

        {editingGoals ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Software Engineer"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Objective</label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Find an internship">Find an internship</option>
                <option value="Secure my first job">Secure my first job</option>
                <option value="Prepare for placements">Prepare for placements</option>
                <option value="Explore career options">Explore career options</option>
                <option value="Change careers">Change careers</option>
                <option value="Grow in my current role">Grow in my current role</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weekly Prep Availability</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="3"
                  max="25"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg shrink-0">
                  {hoursPerWeek} hrs/week
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Target Role</span>
              <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{targetRole || 'Not selected'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Objective</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">{primaryGoal}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Dedication</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">{hoursPerWeek} hours/week</span>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 5: Mentoring Preferences ───────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            5. Mentoring Preferences
          </h2>
          <button
            type="button"
            onClick={() => {
              if (editingMentoring) saveAll()
              setEditingMentoring(!editingMentoring)
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            {editingMentoring ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editingMentoring ? 'Done' : 'Edit Section'}
          </button>
        </div>

        {editingMentoring ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Both English & Hindi">Both English &amp; Hindi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Session Duration</label>
              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="60 minutes">60 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget Preference</label>
              <select
                value={sessionBudget}
                onChange={(e) => setSessionBudget(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Free sessions only">Free sessions only</option>
                <option value="Under ₹500/session">Under ₹500/session</option>
                <option value="Flexible">Flexible / Standard</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Language</span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">{preferredLanguage}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">{sessionDuration}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Budget</span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">{sessionBudget}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 6: Resume & Privacy Settings ───────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            6. Resume &amp; Privacy Settings
          </h2>
          <button
            type="button"
            onClick={() => {
              if (editingPrivacy) saveAll()
              setEditingPrivacy(!editingPrivacy)
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            {editingPrivacy ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editingPrivacy ? 'Done' : 'Edit Section'}
          </button>
        </div>

        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Uploaded Resume</span>
              <p className="text-xs text-slate-500 mt-0.5">
                {resumeUploaded
                  ? `Active document: ${resumeFileName || 'Resume uploaded'}`
                  : 'No resume currently attached to this profile.'}
              </p>
            </div>
            <Link
              href="/resume"
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-blue-600 rounded-full transition-colors self-start sm:self-center"
            >
              {resumeUploaded ? 'Replace Resume' : 'Upload Resume'}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Profile Visibility
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">{profileVisibility}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                AI Analysis Consent
              </span>
              <span className="text-xs font-semibold text-emerald-700 mt-0.5 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active &bull; Confidential
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
