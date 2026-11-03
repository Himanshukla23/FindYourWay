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
  ExternalLink,
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
  const [skills, setSkills] = useState<{ name: string; category?: string }[]>([])
  const [featuredJobs, setFeaturedJobs] = useState<JobListing[]>([])

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('pathpilot_student_profile')
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile)
        if (parsed.full_name) setStudentName(parsed.full_name)
        if (parsed.degree) setDegree(parsed.degree)
        if (parsed.branch) setBranch(parsed.branch)
        if (parsed.grad_year) setGradYear(parsed.grad_year)
        if (parsed.current_status) setCurrentStatus(parsed.current_status)
        if (parsed.hours_per_week) setHoursPerWeek(parsed.hours_per_week)
        if (parsed.career_interests) setCareerInterests(parsed.career_interests)
        if (parsed.skills) setSkills(parsed.skills)
        if (parsed.targetRole || parsed.target_job_role) {
          setTargetRole(parsed.targetRole || parsed.target_job_role)
        }
      }

      const storedTarget = localStorage.getItem('pathpilot_target_role')
      if (storedTarget) setTargetRole(storedTarget)

      const storedResume = localStorage.getItem('pathpilot_resume_analysis')
      if (storedResume) {
        const parsedResume = JSON.parse(storedResume)
        setResumeUploaded(true)
        if (parsedResume.summary) setResumeSummary(parsedResume.summary)
        if (parsedResume.recommendedRoles?.[0]?.title) {
          setResumeTopRole(parsedResume.recommendedRoles[0].title)
          if (!storedTarget) setTargetRole(parsedResume.recommendedRoles[0].title)
        }
        if (parsedResume.skills && parsedResume.skills.length > 0) {
          setSkills((prev) => {
            const existing = new Set(prev.map((s) => s.name.toLowerCase()))
            const additions = parsedResume.skills
              .filter((sk: string) => !existing.has(sk.toLowerCase()))
              .map((sk: string) => ({ name: sk, category: 'Extracted' }))
            return [...prev, ...additions]
          })
        }
      }

      const storedBookings = localStorage.getItem('pathpilot_user_bookings')
      if (storedBookings) {
        try {
          const parsedB = JSON.parse(storedBookings)
          if (Array.isArray(parsedB)) setUpcomingBookings(parsedB)
        } catch {}
      }
    } catch (e) {
      console.error('Error hydrating dashboard profile:', e)
    }

    fetchJobs({ country: 'India', limit: 3 })
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

  const subtitleParts: string[] = []
  if (degree) subtitleParts.push(degree)
  if (branch) subtitleParts.push(branch)
  if (gradYear) subtitleParts.push(`Class of ${gradYear}`)
  else if (currentStatus) subtitleParts.push(STATUS_LABELS[currentStatus] || currentStatus)

  return (
    <div className="page-container space-y-7 max-w-7xl mx-auto py-6">
      {/* ── Welcome Header with Koyeb Display Font ─────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E3DC] shadow-2xs font-tech-mono text-[10px] font-semibold text-neutral-800 tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00F090] animate-pulse" />
            <span>// STUDENT TELEMETRY &amp; CAREER COCKPIT</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#0C0D0E] tracking-tight leading-[0.95] uppercase">
            WELCOME BACK, {studentName.split(' ')[0]}
          </h1>
          <p className="font-sans text-neutral-600 text-sm mt-1">
            {subtitleParts.length > 0
              ? `${subtitleParts.join(' • ')} • Accelerating your graduation-to-hire velocity.`
              : 'Accelerating your tech graduation-to-hire velocity today.'}
          </p>
        </div>

        <Link
          href="/profile"
          className="font-tech-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#E5E3DC] hover:border-black text-neutral-800 transition-all self-start sm:self-center shadow-2xs"
        >
          <User className="w-3.5 h-3.5" />
          <span>EDIT PROFILE</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        </Link>
      </div>

      {/* ── Next Priority Action Card (Koyeb Dark Modern Architecture) ── */}
      <div className="bg-[#0C0D0E] text-white border border-neutral-800 rounded-xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#16181C] border border-neutral-700 text-[#00F090] flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-6 h-6 text-[#00F090]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 font-tech-mono text-[10px] font-bold uppercase tracking-wider text-[#00F090] mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F090] animate-ping" />
              <span>// NEXT RECOMMENDED ACTION</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-white uppercase tracking-tight">
              {nextAction.title}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              {nextAction.desc}
            </p>
          </div>
        </div>

        <Link
          href={nextAction.href}
          className="relative z-10 koyeb-btn-mint px-6 py-3.5 rounded-lg text-xs font-tech-mono flex items-center justify-center gap-2 self-start sm:self-center shrink-0 shadow-md cursor-pointer"
        >
          <span>▸</span>
          <span>{nextAction.cta}</span>
          <span>◂</span>
        </Link>
      </div>

      {/* ── Career Readiness Index Bar ───────────────────────────────── */}
      <div className="bg-white border border-[#E5E3DC] rounded-xl p-5 shadow-2xs">
        <div className="flex justify-between items-center mb-2.5">
          <span className="font-tech-mono text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            CAREER READINESS TELEMETRY
          </span>
          <span className="font-tech-mono text-xs font-extrabold text-black bg-[#00F090] px-2 py-0.5 rounded">
            {readinessScore}% COMPLETE
          </span>
        </div>
        <div className="w-full bg-[#FAF9F6] border border-[#E5E3DC] rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#0C0D0E] h-full rounded-full transition-all duration-700"
            style={{ width: `${readinessScore}%` }}
          />
        </div>
        <p className="font-sans text-xs text-neutral-500 mt-2.5">
          {readinessScore >= 80
            ? '🔥 Excellent profile depth! Your resume audit, target career track, and verified skills are calibrated.'
            : 'Complete your resume upload, target role selection, and mentor consultation to boost your readiness.'}
        </p>
      </div>

      {/* ── 4 High-Impact Metrics (Koyeb Specs) ──────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E3DC] rounded-xl p-5 shadow-2xs">
          <span className="font-tech-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            // TARGET ROLE
          </span>
          <span className="font-display text-2xl text-neutral-900 uppercase mt-1 block truncate">
            {targetRole || 'NOT SELECTED'}
          </span>
          <span className="font-tech-mono text-[10px] text-neutral-500 mt-1 block">
            {targetRole ? 'Active target' : 'Browse catalogue'}
          </span>
        </div>

        <div className="bg-white border border-[#E5E3DC] rounded-xl p-5 shadow-2xs">
          <span className="font-tech-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            // WEEKLY TIME
          </span>
          <span className="font-display text-3xl text-neutral-900 mt-1 block font-black">
            {hoursPerWeek} <span className="text-sm font-sans font-normal text-neutral-500">HRS</span>
          </span>
          <span className="font-tech-mono text-[10px] text-neutral-500 mt-1 block">
            Allocated / week
          </span>
        </div>

        <div className="bg-white border border-[#E5E3DC] rounded-xl p-5 shadow-2xs">
          <span className="font-tech-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            // SESSIONS
          </span>
          <span className="font-display text-3xl text-neutral-900 mt-1 block font-black">
            {upcomingBookings.length}
          </span>
          <span className="font-tech-mono text-[10px] text-neutral-500 mt-1 block">
            Confirmed 1:1 sessions
          </span>
        </div>

        <div className="bg-white border border-[#E5E3DC] rounded-xl p-5 shadow-2xs">
          <span className="font-tech-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            // SKILLS LOGGED
          </span>
          <span className="font-display text-3xl text-[#064E3B] mt-1 block font-black">
            {skills.length}
          </span>
          <span className="font-tech-mono text-[10px] text-neutral-500 mt-1 block">
            Verified competencies
          </span>
        </div>
      </div>

      {/* ── Featured Verified Indian Openings ───────────────────────── */}
      {featuredJobs.length > 0 && (
        <div className="bg-white border border-[#E5E3DC] rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E3DC]">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-black" />
                <h3 className="font-display text-xl text-neutral-900 uppercase tracking-tight">
                  VERIFIED EARLY-CAREER &amp; FRESHER ROLES
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00F090]/15 text-[#064E3B] border border-[#00F090]/40 font-tech-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F090] animate-ping" />
                  LIVE ATS
                </span>
              </div>
              <p className="font-sans text-xs text-neutral-500 mt-0.5">
                Active opportunities filtered for 0-2 years experience from monitored Indian employers.
              </p>
            </div>

            <Link
              href="/jobs"
              className="font-tech-mono text-xs font-bold uppercase text-black hover:text-[#0B63E5] inline-flex items-center gap-1 self-start sm:self-center"
            >
              <span>VIEW ALL 143+ ROLES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="group relative flex flex-col justify-between p-4 rounded-xl border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-white hover:border-black/40 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-black text-[#00F090] flex items-center justify-center font-display text-xs font-black shrink-0">
                      {job.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-tech-mono text-[10px] text-neutral-500 uppercase tracking-wider block truncate">
                        {job.company}
                      </span>
                      <h4 className="font-display text-base text-neutral-900 uppercase truncate group-hover:text-black">
                        {job.title}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 font-tech-mono text-[10px] text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      <span className="truncate max-w-[90px]">{job.location.split(',')[0]}</span>
                    </span>
                    <span>•</span>
                    <span className="font-bold text-neutral-800">{job.salary_display || job.work_mode}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E3DC] flex items-center justify-between font-tech-mono text-[11px]">
                  <Link
                    href={`/jobs`}
                    className="text-neutral-600 hover:text-black font-semibold"
                  >
                    Details
                  </Link>
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="koyeb-btn-black px-2.5 py-1 rounded text-[10px] inline-flex items-center gap-1"
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4 Main Cockpit Widgets ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget 1: Resume Analysis */}
        <div className="bg-white border border-[#E5E3DC] rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                // DIAGNOSTICS
              </span>
              {resumeUploaded ? (
                <span className="font-tech-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#00F090]/15 text-[#064E3B] border border-[#00F090]/40 uppercase">
                  ANALYZED
                </span>
              ) : (
                <span className="font-tech-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                  PENDING UPLOAD
                </span>
              )}
            </div>

            <h3 className="font-display text-xl text-neutral-900 uppercase tracking-tight mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-black" />
              RESUME &amp; SKILL DIAGNOSTIC
            </h3>

            {resumeUploaded ? (
              <div className="space-y-3">
                <p className="font-sans text-xs text-neutral-600 leading-relaxed bg-[#FAF9F6] p-3 rounded-lg border border-[#E5E3DC]">
                  {resumeSummary || 'Your resume has been parsed for technical skills, demonstrated projects, and domain match.'}
                </p>
                {resumeTopRole && (
                  <div className="bg-black text-white rounded-lg p-3 font-tech-mono">
                    <span className="text-[10px] text-[#00F090] font-bold uppercase tracking-wider block">
                      TOP MATCHED TARGET:
                    </span>
                    <span className="font-display text-base uppercase text-white mt-0.5 block">{resumeTopRole}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#FAF9F6] border border-dashed border-[#D6D4CA] text-center space-y-2">
                <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="font-sans text-xs text-neutral-600">
                  Upload your PDF or DOCX resume to extract technical strengths and bridge skill gaps.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E3DC] flex justify-end">
            <Link
              href="/resume"
              className="font-tech-mono text-xs font-bold uppercase text-black hover:text-[#0B63E5] inline-flex items-center gap-1.5"
            >
              <span>{resumeUploaded ? '▸ REVIEW FULL DIAGNOSTIC' : '▸ UPLOAD RESUME'}</span>
              <span>◂</span>
            </Link>
          </div>
        </div>

        {/* Widget 2: Target Career Track */}
        <div className="bg-white border border-[#E5E3DC] rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                // TARGET ROLE
              </span>
              {targetRole ? (
                <span className="font-tech-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black text-[#00F090] uppercase">
                  ACTIVE TARGET
                </span>
              ) : (
                <span className="font-tech-mono text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 uppercase">
                  NOT CHOSEN
                </span>
              )}
            </div>

            <h3 className="font-display text-xl text-neutral-900 uppercase tracking-tight mb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-black" />
              CAREER TRACK SELECTION
            </h3>

            {targetRole ? (
              <div className="space-y-3">
                <div className="bg-[#FAF9F6] border border-[#E5E3DC] rounded-lg p-3.5 font-tech-mono">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                    ACTIVE CAREER SPECIALIZATION:
                  </span>
                  <div className="font-display text-lg text-neutral-900 uppercase mt-0.5">{targetRole}</div>
                </div>
                <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                  Your mentor matches and ATS preparation roadmap are calibrated for this entry-level track.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#FAF9F6] border border-dashed border-[#D6D4CA] text-center space-y-2">
                <Compass className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="font-sans text-xs text-neutral-600">
                  Browse curated entry-level roles across Software, AI, Cybersecurity, Cloud, and Product.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E3DC] flex justify-end">
            <Link
              href="/careers"
              className="font-tech-mono text-xs font-bold uppercase text-black hover:text-[#0B63E5] inline-flex items-center gap-1.5"
            >
              <span>{targetRole ? '▸ EXPLORE ADJACENT TRACKS' : '▸ BROWSE & SET TRACK'}</span>
              <span>◂</span>
            </Link>
          </div>
        </div>

        {/* Widget 3: 1:1 Mentorship Sessions */}
        <div className="bg-white border border-[#E5E3DC] rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                // NETWORK
              </span>
              <span className="font-tech-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black text-[#00F090] uppercase">
                {upcomingBookings.length} ACTIVE SESSIONS
              </span>
            </div>

            <h3 className="font-display text-xl text-neutral-900 uppercase tracking-tight mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-black" />
              1:1 INDUSTRY MENTORSHIP
            </h3>

            {upcomingBookings.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingBookings.slice(0, 2).map((b) => (
                  <div key={b.id} className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E5E3DC] font-tech-mono text-xs">
                    <div className="flex items-center justify-between font-bold text-neutral-900">
                      <span>{b.topic}</span>
                      <span className="text-[#064E3B]">{b.date}</span>
                    </div>
                    <div className="text-neutral-500 text-[11px] mt-0.5 font-sans">
                      With {b.mentor_name} ({b.mentor_org})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#FAF9F6] border border-dashed border-[#D6D4CA] text-center space-y-2">
                <Users className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="font-sans text-xs text-neutral-600">
                  Connect 1-on-1 with verified practitioners from Google, Microsoft, Amazon, Infosys, and top startups.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E3DC] flex items-center justify-between font-tech-mono text-xs">
            <Link
              href="/consultations"
              className="text-neutral-600 hover:text-black font-semibold"
            >
              MY SESSIONS
            </Link>
            <Link
              href="/mentors"
              className="font-bold uppercase text-black hover:text-[#0B63E5] inline-flex items-center gap-1.5"
            >
              <span>▸ BROWSE ALL MENTORS</span>
              <span>◂</span>
            </Link>
          </div>
        </div>

        {/* Widget 4: Skills Telemetry */}
        <div className="bg-white border border-[#E5E3DC] rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                // SKILLS TELEMETRY
              </span>
              <span className="font-tech-mono text-[10px] font-bold text-neutral-500">
                {skills.length} RECORDED
              </span>
            </div>

            <h3 className="font-display text-xl text-neutral-900 uppercase tracking-tight mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-black" />
              VERIFIED COMPETENCIES
            </h3>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 font-tech-mono">
                {skills.slice(0, 10).map((sk) => (
                  <span
                    key={sk.name}
                    className="px-2.5 py-1 rounded bg-[#FAF9F6] border border-[#E5E3DC] text-xs font-semibold text-neutral-800"
                  >
                    {sk.name}
                  </span>
                ))}
                {skills.length > 10 && (
                  <span className="px-2 py-0.5 text-neutral-500 text-xs self-center">
                    +{skills.length - 10} more
                  </span>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#FAF9F6] border border-dashed border-[#D6D4CA] text-center space-y-2">
                <Award className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="font-sans text-xs text-neutral-600">
                  Add technical skills or upload your resume to build your verified competency graph.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E3DC] flex justify-end">
            <Link
              href="/profile"
              className="font-tech-mono text-xs font-bold uppercase text-black hover:text-[#0B63E5] inline-flex items-center gap-1.5"
            >
              <span>▸ MANAGE PROFILE</span>
              <span>◂</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
