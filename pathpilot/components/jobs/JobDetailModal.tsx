'use client'

import React, { useState } from 'react'
import { 
  X, 
  Building2, 
  MapPin, 
  ExternalLink, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  ArrowUpRight, 
  Send, 
  Loader2,
  Copy,
  Check,
  FileText,
  Wand2,
  Layers,
  MessageSquare
} from 'lucide-react'
import { JobListing, JobMatchAnalysis, JobTailorResponse } from '@/types'
import { cn } from '@/lib/utils'
import { matchResumeWithJob, trackJobApplication, tailorResumeForJob } from '@/lib/api-client'

interface JobDetailModalProps {
  job: JobListing | null
  isOpen: boolean
  onClose: () => void
  onToggleSave: (job: JobListing) => void
  userEmail?: string
}

export function JobDetailModal({
  job,
  isOpen,
  onClose,
  onToggleSave,
  userEmail = 'student@pathpilot.ai'
}: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tailor'>('overview')
  const [matchAnalysis, setMatchAnalysis] = useState<JobMatchAnalysis | null>(null)
  const [isMatching, setIsMatching] = useState(false)
  
  // Tailor State
  const [tailorResult, setTailorResult] = useState<JobTailorResponse | null>(null)
  const [isTailoring, setIsTailoring] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const [appStatus, setAppStatus] = useState<string>(job?.application_status || '')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  if (!isOpen || !job) return null

  function copyToClipboard(text: string, key: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  function getCandidateData() {
    let resumeSkills: string[] = []
    let resumeText = ''
    try {
      const resumeRaw = localStorage.getItem('pathpilot_resume_analysis')
      if (resumeRaw) {
        const parsed = JSON.parse(resumeRaw)
        if (parsed.skills && Array.isArray(parsed.skills)) {
          resumeSkills.push(...parsed.skills)
        }
        if (parsed.strengths && Array.isArray(parsed.strengths)) {
          resumeSkills.push(...parsed.strengths)
        }
        if (parsed.summary) {
          resumeText = parsed.summary
        }
      }
      const profileRaw = localStorage.getItem('pathpilot_student_profile')
      if (profileRaw) {
        const parsed = JSON.parse(profileRaw)
        if (parsed.skills && Array.isArray(parsed.skills)) {
          const pSkills = parsed.skills.map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
          resumeSkills.push(...pSkills)
        }
        if (!resumeText && parsed.bio) {
          resumeText = parsed.bio
        }
      }
      const stored = localStorage.getItem('pathpilot_user_profile')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.skills && Array.isArray(parsed.skills)) resumeSkills.push(...parsed.skills)
        if (!resumeText && (parsed.bio || parsed.target_role)) resumeText = parsed.bio || parsed.target_role
      }
    } catch {}
    return {
      resumeSkills: Array.from(new Set(resumeSkills)),
      resumeText
    }
  }

  async function handleRunMatch() {
    if (!job) return
    setIsMatching(true)
    try {
      const { resumeSkills, resumeText } = getCandidateData()
      const analysis = await matchResumeWithJob(job.id, resumeText, resumeSkills)
      if (analysis) {
        setMatchAnalysis(analysis)
      }
    } finally {
      setIsMatching(false)
    }
  }

  async function handleRunTailor() {
    if (!job) return
    setIsTailoring(true)
    try {
      const { resumeSkills, resumeText } = getCandidateData()
      const result = await tailorResumeForJob({
        job_id: job.id,
        user_email: userEmail,
        resume_text: resumeText,
        student_skills: resumeSkills
      })
      if (result) {
        setTailorResult(result)
      }
    } finally {
      setIsTailoring(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!job) return
    setIsUpdatingStatus(true)
    setAppStatus(newStatus)
    try {
      await trackJobApplication(job.id, userEmail, newStatus)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border/60 p-6 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-xs">
              {job.company_logo ? (
                <img
                  src={job.company_logo} 
                  alt={job.company}
                  className="h-full w-full object-contain p-2"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-xl font-bold text-foreground">{job.company.slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">{job.company}</span>
                {job.tier === 1 && (
                  <span className="rounded-sm bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                    Tier 1 FAANG / Giant
                  </span>
                )}
                {job.tier === 2 && (
                  <span className="rounded-sm bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    Top Tier Unicorn
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-foreground tracking-tight mt-0.5">
                {job.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {job.location}
                </span>
                <span>•</span>
                <span className="font-medium text-foreground">{job.work_mode}</span>
                <span>•</span>
                <span className="font-medium text-foreground">
                  {job.exp_min === 0 ? "Fresher / 0–2 yrs" : `${job.exp_min}–${job.exp_max} yrs`}
                </span>
                {job.salary_display && (
                  <>
                    <span>•</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {job.salary_display}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-border/50 bg-card">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={cn(
              "flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all",
              activeTab === 'overview'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Job Description & Fit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('tailor')
              if (!tailorResult && !isTailoring) {
                handleRunTailor()
              }
            }}
            className={cn(
              "flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all",
              activeTab === 'tailor'
                ? "border-purple-600 text-purple-600 dark:text-purple-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>AI Application Kit & Tailor</span>
            <span className="rounded-full bg-purple-500/10 px-1.5 py-0.2 text-[10px] font-bold text-purple-600 dark:text-purple-400">
              STAR & Pitch
            </span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Row: Apply, Save, Track Application */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <span>Direct Apply on ATS</span>
                <ExternalLink className="h-4 w-4" />
              </a>

              <button
                type="button"
                onClick={() => onToggleSave(job)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                  job.is_saved && "border-amber-500/30 bg-amber-500/10 text-amber-500 font-semibold"
                )}
              >
                <Bookmark className={cn("h-4 w-4", job.is_saved && "fill-current")} />
                <span>{job.is_saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Pipeline Stage Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-medium">Stage:</span>
              <select
                value={appStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className="rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground shadow-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="">Not Applied</option>
                <option value="applied">Applied ↗</option>
                <option value="interviewing">Interviewing 🎯</option>
                <option value="offered">Offer Received 🎉</option>
                <option value="rejected">Archived</option>
              </select>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & JD */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              {/* AI Resume Fit Analysis Widget */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">AI Resume Fit & Tailoring Engine</h4>
                      <p className="text-xs text-muted-foreground">Compare your skills & resume against this specific opening</p>
                    </div>
                  </div>

                  {!matchAnalysis && (
                    <button
                      type="button"
                      onClick={handleRunMatch}
                      disabled={isMatching}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      {isMatching ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Analyze My Resume</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Analysis Results View */}
                {matchAnalysis && (
                  <div className="mt-4 pt-4 border-t border-purple-500/15 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                          {matchAnalysis.match_score}%
                        </span>
                        <span className="ml-2 text-xs font-semibold rounded-full bg-purple-500/10 px-2.5 py-0.5 text-purple-600 dark:text-purple-400">
                          {matchAnalysis.recommendation_level}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRunMatch}
                        disabled={isMatching}
                        className="text-xs font-medium text-purple-600 hover:underline"
                      >
                        Re-analyze
                      </button>
                    </div>

                    {/* Overlap & Gaps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-card border border-border/60">
                        <span className="font-semibold text-emerald-600 flex items-center gap-1 mb-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Matching Strengths
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {matchAnalysis.matching_skills.map((s, idx) => (
                            <span key={idx} className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-card border border-border/60">
                        <span className="font-semibold text-amber-600 flex items-center gap-1 mb-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Missing Skills Gap
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {matchAnalysis.missing_skills.length > 0 ? (
                            matchAnalysis.missing_skills.map((s, idx) => (
                              <span key={idx} className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-[11px]">No critical skill gaps detected!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hiring Contact / Verified Recruiter */}
              {job.hiring_contact && job.hiring_contact.name && (
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 font-bold text-sm">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{job.hiring_contact.name}</h4>
                      <p className="text-xs text-muted-foreground">{job.hiring_contact.role || 'Talent Partner'}</p>
                    </div>
                  </div>

                  {job.hiring_contact.linkedin && (
                    <a
                      href={job.hiring_contact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      <span>Connect on LinkedIn</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Full Job Description */}
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                  About the Role
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-3 whitespace-pre-line">
                  {job.jd_full || job.jd_summary || "Join our team to solve impactful challenges at scale."}
                </div>
              </div>

              {/* Required Skills */}
              {job.skills && job.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2.5">
                    Key Technologies & Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI APPLICATION KIT & TAILOR */}
          {activeTab === 'tailor' && (
            <div className="space-y-6 animate-in fade-in">
              {isTailoring ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <h4 className="text-sm font-bold text-foreground">Calibrating Tailored Application Kit...</h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Generating ATS-optimized STAR bullets, recruiter LinkedIn DM, and target keyword density for {job.company}.
                  </p>
                </div>
              ) : tailorResult ? (
                <div className="space-y-6">
                  {/* 1. Recruiter LinkedIn Outreach DM */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                          Recruiter LinkedIn Outreach Note
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.hiring_contact?.linkedin && (
                          <a
                            href={job.hiring_contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            <span>Open Profile</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(tailorResult.recruiter_outreach_dm, 'recruiter_dm')}
                          className="inline-flex items-center gap-1 rounded-lg bg-card border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                        >
                          {copiedKey === 'recruiter_dm' ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy DM</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <pre className="text-xs text-foreground bg-card p-3 rounded-lg border border-border/80 whitespace-pre-wrap font-sans leading-relaxed">
                      {tailorResult.recruiter_outreach_dm}
                    </pre>
                  </div>

                  {/* 2. STAR Format Bullets */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          STAR-Method Tailored Bullets (Add to Experience/Projects)
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {tailorResult.tailored_bullets.map((b, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                              {b.original_theme}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(b.tailored_star, `bullet_${idx}`)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                            >
                              {copiedKey === `bullet_${idx}` ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Copied
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Copy className="h-3 w-3" /> Copy
                                </span>
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-foreground font-medium leading-relaxed">
                            {b.tailored_star}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-muted-foreground">Targeted Keywords:</span>
                            {b.targeted_keywords.map((kw, i) => (
                              <span key={i} className="rounded-md bg-muted px-1.5 py-0.2 text-[10px] font-medium text-foreground">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Essential ATS Keywords */}
                  {tailorResult.ats_keywords_to_include && tailorResult.ats_keywords_to_include.length > 0 && (
                    <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        ATS Keyword Density Checklist
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Ensure these exact terms appear in your skills or summary section:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tailorResult.ats_keywords_to_include.map((kw, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Short Cover Pitch */}
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Quick Application Cover Pitch
                      </h4>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(tailorResult.cover_pitch, 'cover_pitch')}
                        className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted/80"
                      >
                        {copiedKey === 'cover_pitch' ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Pitch</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed pt-1">
                      {tailorResult.cover_pitch}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-muted-foreground">Click below to generate a tailored application kit for this role.</p>
                  <button
                    type="button"
                    onClick={handleRunTailor}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>Generate Application Kit</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
