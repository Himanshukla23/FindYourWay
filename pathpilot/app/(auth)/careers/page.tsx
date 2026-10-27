'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Compass,
  ArrowRight,
  Sparkles,
  Briefcase,
  Layers,
  ChevronRight,
  Check,
  CheckCircle2,
  Code2,
  ShieldCheck,
  BrainCircuit,
  CloudLightning,
  Palette,
  BarChart3,
  Users,
  Search,
  Filter
} from 'lucide-react'
import { DEMO_DOMAINS, DEMO_JOB_PROFILES } from '@/lib/demo-data'
import type { CareerDomain, JobProfile } from '@/types'

// Map domain icons cleanly
const DOMAIN_ICONS: Record<string, React.ElementType> = {
  'domain-1': Code2,
  'domain-2': ShieldCheck,
  'domain-3': BrainCircuit,
  'domain-4': Compass,
  'domain-5': CloudLightning,
  'domain-6': Palette,
  'domain-7': BarChart3,
  'domain-8': Layers,
}

export default function CareersPage() {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('all')
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<JobProfile | null>(null)
  const [targetRoleId, setTargetRoleId] = useState<string | null>('job-1')
  const [searchQuery, setSearchQuery] = useState('')

  // Load saved target role from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('pathpilot_target_role')
    if (saved) {
      const match = DEMO_JOB_PROFILES.find(
        (j) => j.title.toLowerCase().includes(saved.toLowerCase()) || saved.toLowerCase().includes(j.title.toLowerCase())
      )
      if (match) {
        setTargetRoleId(match.id)
      }
    }
  }, [])

  const handleSetTargetRole = (job: JobProfile) => {
    setTargetRoleId(job.id)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pathpilot_target_role', job.title)

      // Also update stored student profile target role
      try {
        const stored = localStorage.getItem('pathpilot_student_profile')
        if (stored) {
          const profile = JSON.parse(stored)
          profile.target_job_role = job.title
          profile.targetRole = job.title
          localStorage.setItem('pathpilot_student_profile', JSON.stringify(profile))
        }
      } catch {}
    }
  }

  // Filter jobs by domain and search query
  const filteredJobs = DEMO_JOB_PROFILES.filter((job) => {
    const matchesDomain = selectedDomainId === 'all' || job.domain_id === selectedDomainId
    const matchesSearch =
      !searchQuery.trim() ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.required_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesDomain && matchesSearch
  })

  const activeTargetJob = DEMO_JOB_PROFILES.find((j) => j.id === targetRoleId)

  return (
    <div className="page-container animate-fade-in space-y-8 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            Entry-Level Career Explorer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Career Domains &amp; Entry-Level Roles
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
            Compare curated technology domains, core prerequisites, and real industry expectations. Set your target role to guide your profile and connect with verified mentors.
          </p>
        </div>

        {activeTargetJob && (
          <div className="self-start md:self-auto px-4 py-2.5 bg-white border border-blue-200 rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-500">Active Target: </span>
              <span className="font-bold text-slate-900">{activeTargetJob.title}</span>
            </div>
            <Link
              href={`/mentors?search=${encodeURIComponent(activeTargetJob.title)}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 ml-1 inline-flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              Find Mentors
            </Link>
          </div>
        )}
      </div>

      {/* Search & Domain Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Domain Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            <button
              onClick={() => setSelectedDomainId('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedDomainId === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              All Domains ({DEMO_DOMAINS.length})
            </button>
            {DEMO_DOMAINS.map((domain) => {
              const count = DEMO_JOB_PROFILES.filter((j) => j.domain_id === domain.id).length
              return (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomainId(domain.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    selectedDomainId === domain.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{domain.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedDomainId === domain.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles or skills..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Domain Cards Strip (when 'all' is selected and no search) */}
        {selectedDomainId === 'all' && !searchQuery.trim() && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_DOMAINS.map((domain) => {
              const IconComponent = DOMAIN_ICONS[domain.id] || Briefcase
              const roleCount = DEMO_JOB_PROFILES.filter((j) => j.domain_id === domain.id).length
              return (
                <div
                  key={domain.id}
                  onClick={() => setSelectedDomainId(domain.id)}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: `${domain.color}15`, color: domain.color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex items-baseline justify-between gap-1">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {domain.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {domain.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {roleCount > 0 ? `${roleCount} entry-level role${roleCount > 1 ? 's' : ''}` : 'Catalogue roles'}
                    </span>
                    <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Explore <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Job Profiles Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            Curated Entry-Level Job Roles ({filteredJobs.length})
          </h2>
          {selectedDomainId !== 'all' && (
            <button
              onClick={() => setSelectedDomainId('all')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Show all domains
            </button>
          )}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
            <Compass className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No matching roles found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or selecting a different career domain.
            </p>
            <button
              onClick={() => {
                setSelectedDomainId('all')
                setSearchQuery('')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.map((job) => {
              const isTarget = targetRoleId === job.id
              const domain = DEMO_DOMAINS.find((d) => d.id === job.domain_id)
              const IconComponent = DOMAIN_ICONS[job.domain_id] || Briefcase

              return (
                <div
                  key={job.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    isTarget
                      ? 'bg-blue-50/70 border-2 border-blue-600 shadow-md shadow-blue-500/10 ring-2 ring-blue-600/20'
                      : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: domain ? `${domain.color}15` : '#EFF6FF',
                            color: domain ? domain.color : '#2563EB',
                          }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700">
                            {domain?.name || 'Technology'}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">{job.title}</h3>
                        </div>
                      </div>

                      {isTarget && (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Target
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      {job.overview}
                    </p>

                    {/* Skills preview */}
                    <div className="mt-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Required Core Skills:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {job.required_skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.required_skills.length > 5 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium self-center">
                            +{job.required_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRoleForModal(job)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      View Details &amp; Spec &rarr;
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetTargetRole(job)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isTarget
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isTarget ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Selected Target
                          </>
                        ) : (
                          'Set as Target Role'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Role Details Modal */}
      {selectedRoleForModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                  {DEMO_DOMAINS.find((d) => d.id === selectedRoleForModal.domain_id)?.name || 'Technology'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedRoleForModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoleForModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Role Overview</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                {selectedRoleForModal.overview}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Key Day-to-Day Responsibilities
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {selectedRoleForModal.responsibilities.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 font-bold">&bull;</span>
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Required Prerequisite Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedRoleForModal.required_skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Standard Industry Tools
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedRoleForModal.tools.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {selectedRoleForModal.eligibility && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <strong className="text-slate-800 block mb-0.5">Typical Eligibility:</strong>
                {selectedRoleForModal.eligibility}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <Link
                href={`/mentors?search=${encodeURIComponent(selectedRoleForModal.title)}`}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                Find Mentors for this Role
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoleForModal(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSetTargetRole(selectedRoleForModal)
                    setSelectedRoleForModal(null)
                  }}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Set as Target Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
