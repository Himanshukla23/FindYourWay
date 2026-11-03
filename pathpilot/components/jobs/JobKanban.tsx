'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  ArrowRight, 
  ChevronRight,
  MoreVertical,
  Plus,
  Clock,
  Briefcase
} from 'lucide-react'
import { JobListing, ApplicationStage } from '@/types'
import { cn } from '@/lib/utils'
import { trackJobApplication } from '@/lib/api-client'

interface JobKanbanProps {
  jobs: JobListing[]
  onSelectJob: (job: JobListing) => void
  onUpdateStatus: (jobId: string, newStatus: ApplicationStage) => void
  userEmail?: string
}

const PIPELINE_COLUMNS: Array<{ id: ApplicationStage; title: string; color: string; badgeBg: string }> = [
  { id: 'applied', title: 'Applied', color: 'text-blue-600', badgeBg: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'interviewing', title: 'Interviewing 🎯', color: 'text-purple-600', badgeBg: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'offered', title: 'Offer Received 🎉', color: 'text-emerald-600', badgeBg: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 'rejected', title: 'Archived', color: 'text-muted-foreground', badgeBg: 'bg-muted border-border' }
]

export function JobKanban({ jobs, onSelectJob, onUpdateStatus, userEmail = 'student@pathpilot.ai' }: JobKanbanProps) {
  // Group jobs by application stage
  const columnsData = React.useMemo(() => {
    const map: Record<ApplicationStage, JobListing[]> = {
      saved: [],
      applied: [],
      interviewing: [],
      offered: [],
      rejected: []
    }

    jobs.forEach((j) => {
      const stage = (j.application_status as ApplicationStage) || 'applied'
      if (map[stage]) {
        map[stage].push(j)
      } else {
        map['applied'].push(j)
      }
    })

    return map
  }, [jobs])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Application Pipeline Kanban</h2>
          <p className="text-xs text-muted-foreground">
            Track your recruitment stages from submission to offer letter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/mentors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Book Mock Interview for Your Applications</span>
          </Link>
        </div>
      </div>

      {/* 4-Column Responsive Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PIPELINE_COLUMNS.map((col) => {
          const colJobs = columnsData[col.id] || []

          return (
            <div 
              key={col.id}
              className="flex flex-col rounded-2xl border border-border/80 bg-muted/20 p-4 min-h-[450px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <h3 className={cn("text-xs font-bold uppercase tracking-wider", col.color)}>
                    {col.title}
                  </h3>
                  <span className="rounded-full bg-card border border-border px-2 py-0.5 text-[11px] font-bold text-foreground">
                    {colJobs.length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colJobs.length > 0 ? (
                  colJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      className="group cursor-pointer rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 font-bold text-xs text-foreground">
                            {job.company_logo ? (
                              <img
                                src={job.company_logo}
                                alt={job.company}
                                className="h-full w-full object-contain p-1"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none'
                                }}
                              />
                            ) : (
                              job.company.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground block">
                              {job.company}
                            </span>
                            <h4 className="text-xs font-bold text-foreground group-hover:text-primary line-clamp-1">
                              {job.title}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Info & Salary */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{job.work_mode}</span>
                        {job.salary_display && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {job.salary_display}
                          </span>
                        )}
                      </div>

                      {/* Mentorship Bridge for Interviewing Candidates */}
                      {col.id === 'interviewing' && (
                        <div className="mt-3 rounded-lg border border-purple-500/20 bg-purple-500/10 p-2 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Interview Ready?
                            </span>
                            <Link
                              href="/mentors"
                              onClick={(e) => e.stopPropagation()}
                              className="text-purple-700 dark:text-purple-300 font-semibold hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Mock Call</span>
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Quick Stage Switcher */}
                      <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Stage:</span>
                        <select
                          value={job.application_status || 'applied'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation()
                            onUpdateStatus(job.id, e.target.value as ApplicationStage)
                          }}
                          className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground focus:outline-hidden"
                        >
                          <option value="applied">Applied</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offered">Offered</option>
                          <option value="rejected">Archived</option>
                        </select>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-border/60 text-center p-3 text-muted-foreground">
                    <p className="text-[11px]">No applications in this stage</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

