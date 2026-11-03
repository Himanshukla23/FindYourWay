'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  Bookmark, 
  RefreshCw, 
  CheckCircle2, 
  Filter, 
  ExternalLink,
  Layers,
  GraduationCap,
  Globe2,
  Building,
  Check,
  RotateCcw
} from 'lucide-react'
import { JobListing, JobCategory, WorkMode, ApplicationStage } from '@/types'
import { fetchJobs, toggleSaveJob, trackJobApplication, syncJobsEngine } from '@/lib/api-client'
import { JobCard } from '@/components/jobs/JobCard'
import { JobDetailModal } from '@/components/jobs/JobDetailModal'
import { JobKanban } from '@/components/jobs/JobKanban'
import { cn } from '@/lib/utils'

const ROLE_CATEGORIES = [
  'All',
  'Product',
  'Software Engineering',
  'Design',
  'Data & Analytics',
  'Cloud & DevOps',
  'AI & Machine Learning'
]

const EXP_LEVELS = [
  { id: 'All', label: 'All Experience' },
  { id: '0-1', label: '🎓 Freshers & Interns (0–1 yrs)' },
  { id: '1-3', label: '🌱 Early Career (1–3 yrs)' },
  { id: '3+', label: '⚡ Experienced (3+ yrs)' },
]

const INDIA_CITIES = [
  { id: 'All', label: 'All Cities' },
  { id: 'Bengaluru', label: 'Bengaluru' },
  { id: 'Delhi', label: 'Delhi NCR / Gurgaon' },
  { id: 'Mumbai', label: 'Mumbai / Pune' },
  { id: 'Hyderabad', label: 'Hyderabad' },
  { id: 'Remote', label: 'Remote (India)' },
]

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastVerified, setLastVerified] = useState<string>('')
  
  // Filters State - Defaults to India jobs first as requested
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'India' | 'Global'>('India')
  const [selectedCity, setSelectedCity] = useState<string>('All')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedExp, setSelectedExp] = useState<string>('All')
  const [viewMode, setViewMode] = useState<'all' | 'saved' | 'applied'>('all')

  // Modal State
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Current user email (dynamic with resilient fallback)
  const [userEmail, setUserEmail] = useState('student@pathpilot.ai')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initialize from URL search parameters if arriving from Roadmap / Career explorer
    const params = new URLSearchParams(window.location.search)
    const q = params.get('search')
    if (q) setSearchQuery(q)
    const region = params.get('region')
    if (region === 'India' || region === 'Global' || region === 'All') setSelectedRegion(region as any)
    const exp = params.get('exp')
    if (exp) setSelectedExp(exp)
    const cat = params.get('category')
    if (cat) setSelectedCategory(cat)

    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user?.email) {
            setUserEmail(user.email)
          } else {
            const profile = localStorage.getItem('pathpilot_student_profile')
            if (profile) {
              try {
                const parsed = JSON.parse(profile)
                if (parsed.email) setUserEmail(parsed.email)
              } catch {}
            }
          }
        })
      }
    })
  }, [])

  // Load jobs on mount and on filter changes
  useEffect(() => {
    loadJobs()
  }, [selectedRegion, selectedCategory, selectedExp])

  async function loadJobs() {
    setIsLoading(true)
    try {
      const res = await fetchJobs({
        country: selectedRegion !== 'All' ? selectedRegion : undefined,
        role_category: selectedCategory !== 'All' ? selectedCategory : undefined,
        exp_range: selectedExp !== 'All' ? selectedExp : undefined,
        user_email: userEmail
      })
      setJobs(res.jobs || [])
      setLastVerified(res.last_verified || new Date().toISOString())
    } catch (err) {
      console.error('Failed to load jobs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      // Trigger background sync endpoint
      await syncJobsEngine().catch(() => {})
      await loadJobs()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle Save / Bookmark
  async function handleToggleSave(job: JobListing) {
    const nextSavedState = !job.is_saved
    // Optimistic update
    setJobs((prev) => 
      prev.map((j) => (j.id === job.id ? { ...j, is_saved: nextSavedState } : j))
    )
    if (selectedJob && selectedJob.id === job.id) {
      setSelectedJob({ ...selectedJob, is_saved: nextSavedState })
    }

    try {
      await toggleSaveJob(job.id, userEmail, nextSavedState)
    } catch (err) {
      // Rollback on failure
      setJobs((prev) => 
        prev.map((j) => (j.id === job.id ? { ...j, is_saved: !nextSavedState } : j))
      )
    }
  }

  async function handleUpdateAppStatus(jobId: string, newStatus: ApplicationStage) {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, application_status: newStatus } : j))
    )
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob({ ...selectedJob, application_status: newStatus })
    }
    try {
      await trackJobApplication(jobId, userEmail, newStatus)
    } catch (e) {
      console.error('Failed to update stage:', e)
    }
  }

  // Filter client-side by search query, region, city, experience, category, and viewMode
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // View Mode filter
      if (viewMode === 'saved' && !job.is_saved) return false
      if (viewMode === 'applied' && !job.application_status) return false

      // Region Filter
      if (selectedRegion === 'India' && job.country.toLowerCase() !== 'india') return false
      if (selectedRegion === 'Global' && job.country.toLowerCase() === 'india' && job.work_mode.toLowerCase() !== 'remote') return false

      // City Filter (applicable when selectedRegion is India or All)
      if (selectedCity && selectedCity !== 'All') {
        const loc = job.location.toLowerCase()
        if (selectedCity === 'Delhi') {
          if (!loc.includes('delhi') && !loc.includes('gurgaon') && !loc.includes('noida') && !loc.includes('saket') && !loc.includes('haryana')) return false
        } else if (selectedCity === 'Mumbai') {
          if (!loc.includes('mumbai') && !loc.includes('pune') && !loc.includes('maharashtra')) return false
        } else if (selectedCity === 'Remote') {
          if (job.work_mode.toLowerCase() !== 'remote' && !loc.includes('remote')) return false
        } else {
          if (!loc.includes(selectedCity.toLowerCase())) return false
        }
      }

      // Experience Filter (Strict Fresher vs Early Career vs Senior enforcement)
      if (selectedExp === '0-1') {
        // Strictly pure fresher: 0 years minimum experience required, max <= 2 years
        if (job.exp_min > 0 || job.exp_max > 2) return false
        const titleL = job.title.toLowerCase()
        if (['senior', 'sr.', 'lead', 'principal', 'staff', 'director', 'vp'].some(w => titleL.includes(w))) return false
      } else if (selectedExp === '1-3') {
        // Early career: 1-3 years experience (requires 1+ yr or up to 3 yrs)
        if (job.exp_min > 3 || job.exp_max < 1) return false
        if (job.exp_min === 0 && job.exp_max <= 2) return false
      } else if (selectedExp === '3+') {
        // Senior roles: requiring 3+ years experience
        if (job.exp_max < 3 && job.exp_min < 3) return false
      }

      // Category Filter
      if (selectedCategory !== 'All') {
        if (!job.role_category.toLowerCase().includes(selectedCategory.toLowerCase())) return false
      }

      // Search query filter (instant search across title, company, skills, location)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = job.title.toLowerCase().includes(query)
        const matchCompany = job.company.toLowerCase().includes(query)
        const matchLocation = job.location.toLowerCase().includes(query)
        const matchSkills = job.skills.some((s) => s.toLowerCase().includes(query))
        if (!matchTitle && !matchCompany && !matchLocation && !matchSkills) {
          return false
        }
      }

      return true
    })
  }, [jobs, searchQuery, viewMode, selectedRegion, selectedCity, selectedExp, selectedCategory])

  const savedCount = useMemo(() => jobs.filter((j) => j.is_saved).length, [jobs])
  const appliedCount = useMemo(() => jobs.filter((j) => !!j.application_status).length, [jobs])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero / Header Section */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  🇮🇳 India Jobs Prioritized • 100% Verified ATS Feeds
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Direct recruiter ATS links • Zero dead aggregator links
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                India & Global Tech / APM Launchpad
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                Verified fresher, entry-level, APM, and junior software engineer opportunities across India's top tech companies and global remote teams.
              </p>
            </div>

            {/* Quick Stats & Sync */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end text-right">
                <span className="text-2xl font-black text-foreground">
                  {filteredJobs.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedRegion === 'India' ? '🇮🇳 Active India Roles' : selectedRegion === 'Global' ? '🌍 Global Roles' : 'Active Opportunities'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground shadow-xs hover:bg-muted active:scale-95 disabled:opacity-50 transition-all"
                title="Refresh listings"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-primary")} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Region Tabs (India First!) + View Mode */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-4">
            {/* Region Segmented Controls (India first by default) */}
            <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setSelectedRegion('India')
                  setSelectedCity('All')
                }}
                className={cn(
                  "rounded-lg px-4 py-1.5 transition-all flex items-center gap-1.5",
                  selectedRegion === 'India' ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>🇮🇳 India Roles</span>
                <span className="rounded-full bg-primary/10 text-primary px-1.5 py-0.2 text-[10px] font-bold">Default</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRegion('Global')
                  setSelectedCity('All')
                }}
                className={cn(
                  "rounded-lg px-4 py-1.5 transition-all flex items-center gap-1.5",
                  selectedRegion === 'Global' ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>🌍 Global & Remote</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRegion('All')
                  setSelectedCity('All')
                }}
                className={cn(
                  "rounded-lg px-4 py-1.5 transition-all",
                  selectedRegion === 'All' ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                🌐 All Regions
              </button>
            </div>

            {/* View Filter: All / Saved / Applied */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  viewMode === 'all' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                All Jobs
              </button>

              <button
                type="button"
                onClick={() => setViewMode('saved')}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5",
                  viewMode === 'saved' ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>Saved ({savedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('applied')}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5",
                  viewMode === 'applied' ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Applied ({appliedCount})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Search & Filters */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
        {/* Search Bar + Experience Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or skills (e.g. 'Swiggy', 'APM', 'React', 'SQL')..."
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Experience Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {EXP_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedExp(lvl.id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium border transition-colors",
                  selectedExp === lvl.id
                    ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Indian Tech Hub Filter Pills (Active when India or All is selected) */}
        {(selectedRegion === 'India' || selectedRegion === 'All') && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Top Hubs:
            </span>
            {INDIA_CITIES.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => setSelectedCity(city.id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-2.5 py-1 text-xs transition-all",
                  selectedCity === city.id
                    ? "bg-foreground text-background font-bold shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {city.label}
              </button>
            ))}
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ROLE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                selectedCategory === cat
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Job Listings Grid or Kanban View */}
        {viewMode === 'applied' ? (
          <JobKanban
            jobs={jobs.filter((j) => !!j.application_status)}
            onSelectJob={(j) => {
              setSelectedJob(j)
              setIsModalOpen(true)
            }}
            onUpdateStatus={handleUpdateAppStatus}
            userEmail={userEmail}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="h-64 rounded-xl border border-border/60 bg-card p-5 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 bg-muted rounded-sm" />
                      <div className="h-5 w-44 bg-muted rounded-sm" />
                    </div>
                  </div>
                  <div className="h-4 w-3/4 bg-muted rounded-sm mt-4" />
                </div>
                <div className="h-8 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSelect={(j) => {
                  setSelectedJob(j)
                  setIsModalOpen(true)
                }}
                onToggleSave={handleToggleSave}
                onMatchClick={(j) => {
                  setSelectedJob(j)
                  setIsModalOpen(true)
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">No matching opportunities found</h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Try adjusting your search keywords, region, or experience level filter to see more openings.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedRegion('India')
                setSelectedCity('All')
                setSelectedCategory('All')
                setSelectedExp('All')
                setViewMode('all')
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to India Fresher Roles</span>
            </button>
          </div>
        )}
      </div>

      {/* Detail & AI Fit Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggleSave={handleToggleSave}
        userEmail={userEmail}
      />
    </div>
  )
}

