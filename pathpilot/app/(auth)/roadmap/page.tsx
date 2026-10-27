'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Map,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Code2,
  RotateCw,
  Award,
  Layers,
  FileCheck,
  Calendar,
  AlertCircle,
  Zap,
  Bookmark,
  Share2
} from 'lucide-react'
import { updateTaskProgress } from '@/lib/api-client'

interface MilestoneTask {
  id: string
  phase?: string
  title: string
  desc: string
  deliverable?: string
  hours: number
  skills: string[]
  resources?: string[]
  completed: boolean
  notes?: string
  repoUrl?: string
}

interface CapstoneSpec {
  title: string
  description: string
  deliverables: string[]
  recommendedStack: string[]
}

export default function RoadmapPage() {
  const [currentRoleTitle, setCurrentRoleTitle] = useState<string>('Full Stack Software Engineer')
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(15)
  const [graduationYear, setGraduationYear] = useState<string>('2026')
  const [tasks, setTasks] = useState<MilestoneTask[]>([])
  const [capstone, setCapstone] = useState<CapstoneSpec | null>(null)
  const [estimatedWeeks, setEstimatedWeeks] = useState<number>(8)
  const [difficulty, setDifficulty] = useState<string>('Intermediate')
  const [prerequisites, setPrerequisites] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [aiInfo, setAiInfo] = useState<{ provider: string; model: string } | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all')

  // Load target role and profile on mount
  useEffect(() => {
    let role = 'Full Stack Software Engineer'
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlRole = params.get('role')
      const storedRole = localStorage.getItem('pathpilot_target_role')
      
      if (urlRole && urlRole.trim()) {
        role = urlRole.trim()
      } else if (storedRole && storedRole.trim()) {
        role = storedRole.trim()
      }

      // Check onboarding profile for hours/week
      const profileRaw = localStorage.getItem('pathpilot_student_profile')
      if (profileRaw) {
        try {
          const profile = JSON.parse(profileRaw)
          if (profile.hoursPerWeek) setHoursPerWeek(Number(profile.hoursPerWeek))
          if (profile.profile?.graduationYear) setGraduationYear(profile.profile.graduationYear)
        } catch {
          // ignore
        }
      }
    }

    setCurrentRoleTitle(role)
    loadOrFetchRoadmap(role, hoursPerWeek, false)
  }, [])

  const loadOrFetchRoadmap = async (role: string, hours: number, forceRefresh = false) => {
    if (!forceRefresh && typeof window !== 'undefined') {
      const cached = localStorage.getItem(`pathpilot_roadmap_${role}_${hours}`)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setTasks(parsed.tasks || [])
          setCapstone(parsed.capstoneProject || null)
          setEstimatedWeeks(parsed.estimatedWeeks || 8)
          setDifficulty(parsed.difficulty || 'Intermediate')
          setPrerequisites(parsed.prerequisites || [])
          setAiInfo(parsed.aiInfo || { provider: 'Google Gemini', model: 'gemini-flash-latest' })
          setLoading(false)
          return
        } catch {
          // Fall through to live API
        }
      }
    }

    setLoading(true)
    if (forceRefresh) setIsRegenerating(true)

    try {
      // Collect existing skills from resume if stored
      let existingSkills: string[] = []
      const resumeAnalysis = localStorage.getItem('pathpilot_resume_analysis')
      if (resumeAnalysis) {
        try {
          const parsedResume = JSON.parse(resumeAnalysis)
          existingSkills = parsedResume.skills || []
        } catch {
          // ignore
        }
      }

      const res = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleTitle: role,
          hoursPerWeek: hours,
          graduationYear,
          existingSkills
        }),
      })

      const json = await res.json()

      if (json.success && json.data) {
        const data = json.data
        const initializedTasks: MilestoneTask[] = (data.tasks || []).map((t: any, idx: number) => ({
          ...t,
          completed: idx === 0, // First task completed by default as quick start
          notes: '',
          repoUrl: ''
        }))

        setTasks(initializedTasks)
        setCapstone(data.capstoneProject || null)
        setEstimatedWeeks(data.estimatedWeeks || 8)
        setDifficulty(data.difficulty || 'Intermediate')
        setPrerequisites(data.prerequisites || ['Foundational Computer Science Concepts'])
        
        const aiMetadata = {
          provider: json.providerUsed === 'gemini' ? 'Google Gemini' : json.providerUsed === 'groq' ? 'Groq Llama-3.3' : 'PathPilot Curriculum Engine',
          model: json.model || 'gemini-flash-latest'
        }
        setAiInfo(aiMetadata)

        // Cache in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`pathpilot_roadmap_${role}_${hours}`, JSON.stringify({
            ...data,
            tasks: initializedTasks,
            aiInfo: aiMetadata,
            savedAt: new Date().toISOString()
          }))
        }
      }
    } catch (err) {
      console.error('Failed to generate roadmap:', err)
    } finally {
      setLoading(false)
      setIsRegenerating(false)
    }
  }

  const toggleTask = (id: string) => {
    setTasks(prev => {
      let targetCompleted = false
      const updated = prev.map(t => {
        if (t.id === id) {
          targetCompleted = !t.completed
          return { ...t, completed: targetCompleted }
        }
        return t
      })
      // Save state to localStorage
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`pathpilot_roadmap_${currentRoleTitle}_${hoursPerWeek}`)
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            parsed.tasks = updated
            localStorage.setItem(`pathpilot_roadmap_${currentRoleTitle}_${hoursPerWeek}`, JSON.stringify(parsed))
          } catch {
            // ignore
          }
        }
      }
      // Async persist to Python backend
      updateTaskProgress(id, {
        completed: targetCompleted,
        role_title: currentRoleTitle,
      })
      return updated
    })
  }

  const updateTaskNotes = (id: string, notes: string) => {
    setTasks(prev => {
      let taskCompleted = false
      const updated = prev.map(t => {
        if (t.id === id) {
          taskCompleted = t.completed
          return { ...t, notes }
        }
        return t
      })
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`pathpilot_roadmap_${currentRoleTitle}_${hoursPerWeek}`)
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            parsed.tasks = updated
            localStorage.setItem(`pathpilot_roadmap_${currentRoleTitle}_${hoursPerWeek}`, JSON.stringify(parsed))
          } catch {
            // ignore
          }
        }
      }
      // Async persist to Python backend
      updateTaskProgress(id, {
        completed: taskCompleted,
        notes,
        role_title: currentRoleTitle,
      })
      return updated
    })
  }

  const completedCount = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length || 1
  const progressPercent = Math.round((completedCount / totalTasks) * 100)
  const remainingHours = tasks.filter(t => !t.completed).reduce((acc, t) => acc + (t.hours || 0), 0)

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'pending') return !t.completed
    if (activeFilter === 'completed') return t.completed
    return true
  })

  return (
    <div className="page-container animate-fade-in space-y-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider">
              <Map className="w-3.5 h-3.5 text-blue-600" />
              Dynamic AI Curriculum
            </span>
            {aiInfo && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Generated by {aiInfo.provider}
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
              {difficulty}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Target Roadmap: {currentRoleTitle}
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
            Tailored specifically for entry-level hiring bars. Follow each structured milestone, build the required deliverables, and publish your capstone project before graduation.
          </p>
        </div>

        {/* Right Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Hours Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={hoursPerWeek}
              onChange={(e) => {
                const val = Number(e.target.value)
                setHoursPerWeek(val)
                loadOrFetchRoadmap(currentRoleTitle, val, true)
              }}
              className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              <option value={10}>10 hrs / week</option>
              <option value={15}>15 hrs / week (Recommended)</option>
              <option value={20}>20 hrs / week (Intensive)</option>
              <option value={30}>30 hrs / week (Full-time)</option>
            </select>
          </div>

          <button
            onClick={() => loadOrFetchRoadmap(currentRoleTitle, hoursPerWeek, true)}
            disabled={isRegenerating || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Generating...' : 'Regenerate with AI'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Readiness Metric Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="flex-1 w-full space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Overall Roadmap Completion</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
                {completedCount} / {tasks.length} Milestones
              </span>
            </span>
            <span className="text-base font-extrabold text-blue-600">{progressPercent}%</span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex flex-wrap justify-between text-xs text-slate-500 pt-1">
            <span>{remainingHours} estimated hours remaining</span>
            <span>Target Pacing: ~{estimatedWeeks} weeks</span>
          </div>
        </div>

        <div className="md:border-l md:border-slate-100 md:pl-6 shrink-0 flex md:flex-col justify-between items-center md:items-start text-left">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Target Cohort Readiness</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{graduationYear} Placement Season</div>
          </div>
          <Link
            href="/careers"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors mt-2"
          >
            Switch Target Role →
          </Link>
        </div>
      </div>

      {/* Prerequisites Banner if any */}
      {prerequisites.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-800">Assumed Foundations:</span>
            <div className="flex flex-wrap gap-1.5">
              {prerequisites.map((p, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <span className="text-slate-500 shrink-0">Calibrated for College Students</span>
        </div>
      )}

      {/* Milestones Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Milestone Execution Plan</span>
        </h2>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({tasks.length - completedCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 p-6 flex items-start gap-4">
              <div className="w-6 h-6 rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-3 w-4/5 bg-slate-100 rounded" />
                <div className="h-5 w-1/4 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Milestones List */}
      {!loading && (
        <div className="space-y-3.5">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
              No milestones match this filter.
            </div>
          ) : (
            filteredTasks.map((task, index) => {
              const isExpanded = expandedTaskId === task.id
              return (
                <div
                  key={task.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    task.completed
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-sm shadow-xs'
                  }`}
                >
                  <div className="p-5 flex items-start gap-4">
                    {/* Toggle Completion */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                        task.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50/30'
                      }`}
                      aria-label="Toggle completion status"
                    >
                      {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-slate-400" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Phase Tag & Hours */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/60 uppercase tracking-wider">
                          {task.phase || `Milestone ${index + 1}`}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-semibold text-slate-700">{task.hours} hrs</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className={`text-base font-bold tracking-tight ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {index + 1}. {task.title}
                      </h3>

                      {/* Description */}
                      <p className={`text-xs mt-1 leading-relaxed ${task.completed ? 'text-slate-400' : 'text-slate-600'}`}>
                        {task.desc}
                      </p>

                      {/* Deliverable Badge */}
                      {task.deliverable && (
                        <div className="mt-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2 text-xs">
                          <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-blue-900">Practical Deliverable: </span>
                            <span className="text-slate-800">{task.deliverable}</span>
                          </div>
                        </div>
                      )}

                      {/* Skills Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {task.skills.map(s => (
                          <span
                            key={s}
                            className="px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Expand / Details Toggle */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Study Resources & Notes' : 'View Recommended Resources & Add Notes'}</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        <div className="text-[11px] text-slate-400">
                          {task.completed ? 'Status: Completed' : 'Status: Ready to work'}
                        </div>
                      </div>

                      {/* Expanded Section: Resources & Personal Notes */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
                          {/* Recommended Resources */}
                          {task.resources && task.resources.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                                Recommended Resources &amp; Guides
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {task.resources.map((res, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs text-slate-700 hover:border-blue-400 transition-colors"
                                  >
                                    <span className="truncate mr-2 font-medium">{res}</span>
                                    <a
                                      href={`https://www.google.com/search?q=${encodeURIComponent(res + ' ' + currentRoleTitle)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 shrink-0"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Student Notes Field */}
                          <div>
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                              Personal Notes &amp; Evidence Link
                            </label>
                            <textarea
                              value={task.notes || ''}
                              onChange={(e) => updateTaskNotes(task.id, e.target.value)}
                              placeholder="Document your architecture decisions, link your PR or demo repo, or list questions for your mentor..."
                              rows={3}
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed placeholder:text-slate-400"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              Auto-saved locally. Share these notes when booking a 1:1 consultation with a mentor.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Capstone Project Card */}
      {capstone && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-300 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              Flagship Capstone Deliverable
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {capstone.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {capstone.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block mb-2">
                  Key Verification Deliverables
                </span>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {capstone.deliverables.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block mb-2">
                  Recommended Industry Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {capstone.recommendedStack.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-white/10 text-xs text-slate-200 font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Mentor Consultation Banner */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Get Code &amp; Architecture Reviews on this Roadmap
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Connect with seasoned industry practitioners specializing in {currentRoleTitle} to review your portfolio deliverables and mock interviews.
          </p>
        </div>
        <Link
          href="/mentors"
          className="shrink-0 px-6 py-2.5 rounded-full bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-all shadow-xs"
        >
          Find a {currentRoleTitle} Mentor →
        </Link>
      </div>
    </div>
  )
}
