'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Compass,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  Zap,
  ChevronRight,
  ShieldCheck,
  Target,
  Sparkles,
  BookOpen,
  User,
  GraduationCap,
  Award,
  Briefcase,
  MapPin,
  ExternalLink
} from 'lucide-react'
import { BookingResponse, fetchJobs } from '@/lib/api-client'
import { JobListing } from '@/types'

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

const STATUS_LABELS: Record<string, string> = {
  first_year: '1st Year Student',
  second_year: '2nd Year Student',
  third_year: '3rd Year Student',
  final_year: 'Final Year Student',
  recent_graduate: 'Recent Graduate',
  working_professional: 'Working Professional',
  career_switcher: 'Career Switcher',
  other: 'Student',
  'College student': 'College Student',
  'Recent graduate': 'Recent Graduate',
  'Working professional': 'Working Professional',
  'Career switcher': 'Career Switcher',
}

export default function DashboardPage() {
  const [studentName, setStudentName] = useState('Student')
  const [degree, setDegree] = useState('')
  const [branch, setBranch] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [currentStatus, setCurrentStatus] = useState('')
  const [targetRole, setTargetRole] = useState<string | null>(null)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [resumeTopRole, setResumeTopRole] = useState<string | null>(null)
  const [resumeSummary, setResumeSummary] = useState<string | null>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<BookingResponse[]>([])
  const [careerInterests, setCareerInterests] = useState<string[]>([])
  const [hoursPerWeek, setHoursPerWeek] = useState(8)
  const [skills, setSkills] = useState<Array<{ name: string; level: string }>>([])
  const [featuredJobs, setFeaturedJobs] = useState<JobListing[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Load authenticated user name from Supabase or localStorage
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            const name =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              (user.email ? user.email.split('@')[0] : 'Student')
            setStudentName(name)
          } else {
            const profileRaw = localStorage.getItem('pathpilot_student_profile')
            if (profileRaw) {
              try {
                const p = JSON.parse(profileRaw)
                if (p.full_name || p.fullName) {
                  setStudentName(p.full_name || p.fullName)
                }
              } catch {}
            }
          }
        })
      }
    })

    // 2. Load Student Profile
    const profileRaw = localStorage.getItem('pathpilot_student_profile')
    if (profileRaw) {
      try {
        const p = JSON.parse(profileRaw)
        if (p.degree) setDegree(p.degree)
        if (p.branch) setBranch(p.branch)
        if (p.graduation_year || p.graduationYear) setGradYear(p.graduation_year || p.graduationYear)
        if (p.current_status || p.currentStatus) setCurrentStatus(p.current_status || p.currentStatus)
        if (p.target_job_role || p.targetRole) setTargetRole(p.target_job_role || p.targetRole)
        if (p.career_interests && Array.isArray(p.career_interests)) setCareerInterests(p.career_interests)
        if (p.hours_per_week || p.hoursPerWeek) setHoursPerWeek(p.hours_per_week || p.hoursPerWeek)
        if (p.skills && Array.isArray(p.skills)) setSkills(p.skills)
        if (p.resume_uploaded) setResumeUploaded(true)
      } catch {}
    }

    // 3. Load Target Role
    const storedTarget = localStorage.getItem('pathpilot_target_role')
    if (storedTarget) setTargetRole(storedTarget)

    // 4. Load Resume Analysis
    const resumeRaw = localStorage.getItem('pathpilot_resume_analysis')
    if (resumeRaw) {
      try {
        const r = JSON.parse(resumeRaw)
        setResumeUploaded(true)
        if (r.summary) setResumeSummary(r.summary)
        if (r.recommendedRoles?.[0]?.title) {
          setResumeTopRole(r.recommendedRoles[0].title)
        }
      } catch {}
    }

    // 5. Load Bookings
    const bookingsRaw = localStorage.getItem('pathpilot_user_bookings')
    if (bookingsRaw) {
      try {
        const b = JSON.parse(bookingsRaw)
        if (Array.isArray(b)) {
          setUpcomingBookings(b.filter((item: any) => item.status === 'confirmed'))
        }
      } catch {}
    }

    // Load top verified job opportunities matching profile
    fetchJobs({ limit: 3 })
      .then((res) => {
        if (res && res.jobs) {
          setFeaturedJobs(res.jobs.slice(0, 3))
        }
      })
      .catch(() => {})
  }, [])

  // Career Readiness Score Calculation
  let readinessScore = 20
  if (degree && branch) readinessScore += 20
  if (resumeUploaded) readinessScore += 25
  if (targetRole) readinessScore += 20
  if (careerInterests.length > 0) readinessScore += 10
  if (skills.length > 0) readinessScore += 5

  // ── Determine student's next useful action ──────────────────────────────────
  let nextAction = {
    title: 'Review Resume Analysis',
    desc: 'Extract your skills, view matched roles, and diagnose experience gaps.',
    href: '/resume',
    cta: 'Upload & Analyze Resume',
  }

  if (!resumeUploaded) {
    nextAction = {
      title: 'Analyze Your Resume',
      desc: 'Upload your resume to extract skills, discover best-fit roles, and highlight blind spots.',
      href: '/resume',
      cta: 'Start Resume Analysis',
    }
  } else if (!targetRole) {
    nextAction = {
      title: 'Select Your Target Role',
      desc: 'Explore curated entry-level roles across Software, AI, Cloud, and Product to pick your focus.',
      href: '/careers',
      cta: 'Explore Entry-Level Roles',
    }
  } else if (upcomingBookings.length === 0) {
    nextAction = {
      title: 'Book a 1:1 Consultation with an Industry Mentor',
      desc: `Connect with seasoned professionals in ${targetRole} for portfolio review and placement strategy.`,
      href: `/mentors?search=${encodeURIComponent(targetRole)}`,
      cta: 'Find Mentors for Your Role',
    }
  } else {
    nextAction = {
      title: 'Prepare for Your Upcoming Mentorship Session',
      desc: 'Review session topics and questions before your live consultation.',
      href: '/consultations',
      cta: 'View My Sessions',
    }
  }

  // Build subtitle
  const subtitleParts: string[] = []
  if (degree) subtitleParts.push(degree)
  if (branch) subtitleParts.push(branch)
  if (gradYear) subtitleParts.push(`Class of ${gradYear}`)
  else if (currentStatus) subtitleParts.push(STATUS_LABELS[currentStatus] || currentStatus)

  return (
    <div className="page-container animate-fade-in space-y-6 max-w-7xl mx-auto py-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {studentName.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            {subtitleParts.length > 0
              ? `${subtitleParts.join(' • ')} • Let's accelerate your career journey.`
              : "Let's accelerate your career journey today."}
          </p>
        </div>

        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-center transition-all"
        >
          <User className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Next Priority Action Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-0.5">
              <span>Next Recommended Action</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{nextAction.title}</h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xl leading-relaxed">{nextAction.desc}</p>
          </div>
        </div>

        <Link
          href={nextAction.href}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold whitespace-nowrap self-start sm:self-center transition-all shadow-xs cursor-pointer"
        >
          <span>{nextAction.cta}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Career Readiness Index Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Career Readiness Index
          </span>
          <span className="text-xs font-extrabold text-blue-600">{readinessScore}% Complete</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${readinessScore}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {readinessScore >= 80
            ? '🔥 Excellent profile depth! Your resume audit, target career track, and verified skills are active.'
            : 'Complete your resume upload, target role selection, and mentor consultation to boost your readiness.'}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Role</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block truncate">
            {targetRole || 'Not Selected'}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {targetRole ? 'Active target' : 'Browse catalogue'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Commitment</span>
          <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{hoursPerWeek}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">hours/week allocated</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Industry Sessions</span>
          <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">{upcomingBookings.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">confirmed 1:1 sessions</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tracked Skills</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{skills.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">competencies recorded</span>
        </div>
      </div>

      {/* Career Interests Strip (if populated) */}
      {careerInterests.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Career Interests:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {careerInterests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700"
              >
                {INTEREST_LABELS[interest] || interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Featured Verified Openings for Target Role */}
      {featuredJobs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Verified Early-Career &amp; APM Openings
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Live Direct ATS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active opportunities verified from official company boards.
              </p>
            </div>

            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 self-start sm:self-center"
            >
              <span>Explore All Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="group relative flex flex-col justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400/60 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800 overflow-hidden shrink-0">
                        {job.company_logo ? (
                          <img
                            src={job.company_logo}
                            alt={job.company}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          job.company.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-600 block">{job.company}</span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[100px]">{job.location.split(',')[0]}</span>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">{job.salary_display || job.work_mode}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                  <Link
                    href={`/jobs`}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    View Details
                  </Link>
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-colors"
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 4-Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget 1: Resume Analysis & Skill Diagnostic */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Resume &amp; Skill Diagnostic
              </h3>
              {resumeUploaded ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                  Analysed
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase">
                  Pending Upload
                </span>
              )}
            </div>

            {resumeUploaded ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {resumeSummary || 'Your resume has been parsed for technical skills, demonstrated projects, and domain match.'}
                </p>
                {resumeTopRole && (
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
                    <span className="font-bold block text-[10px] text-blue-700 uppercase tracking-wider">
                      Top Matched Role:
                    </span>
                    <strong className="text-sm text-slate-900 block mt-0.5">{resumeTopRole}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Upload your PDF or DOCX resume to identify your core strengths and role gaps.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
            <Link
              href="/resume"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>{resumeUploaded ? 'Review Full Resume Diagnostic' : 'Upload Resume Document'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Widget 2: Target Career Role & Explorer */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                Target Career Role
              </h3>
              {targetRole ? (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase">
                  Target Set
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                  Not Chosen
                </span>
              )}
            </div>

            {targetRole ? (
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Active Target Role:
                  </span>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">{targetRole}</div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your mentor matches and profile preparation are calibrated for this entry-level role.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <Compass className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Browse our curated catalogue of roles across Software, AI, Cybersecurity, Cloud, and Product.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
            <Link
              href="/careers"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>{targetRole ? 'Explore Adjacent Career Roles' : 'Browse & Set Target Role'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Widget 3: 1:1 Industry Mentorship */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                1:1 Industry Mentorship
              </h3>
              {upcomingBookings.length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase">
                  {upcomingBookings.length} Active Session{upcomingBookings.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                  Available
                </span>
              )}
            </div>

            {upcomingBookings.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingBookings.slice(0, 2).map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{b.topic}</span>
                      <span className="text-blue-600 font-medium">{b.date}</span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      With {b.mentor_name} ({b.mentor_org})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Connect 1:1 with verified professionals from Google, Microsoft, Amazon, and top startups.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/consultations"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              My Sessions
            </Link>
            <Link
              href="/mentors"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Browse All Mentors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Widget 4: Skills & Profile Overview */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                Your Skills &amp; Competencies
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {skills.length} Recorded
              </span>
            </div>

            {skills.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {skills.slice(0, 10).map((sk) => (
                    <span
                      key={sk.name}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-900"
                    >
                      {sk.name}
                    </span>
                  ))}
                  {skills.length > 10 && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-xs self-center">
                      +{skills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <Award className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Add technical skills or upload your resume to track your growing skill inventory.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
            <Link
              href="/profile"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Manage Profile &amp; Skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
