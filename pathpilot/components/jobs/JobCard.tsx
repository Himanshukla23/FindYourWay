'use client'

import React from 'react'
import Image from 'next/image'
import { 
  Building2, 
  MapPin, 
  Clock, 
  Briefcase, 
  ExternalLink, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  UserCheck
} from 'lucide-react'
import { JobListing } from '@/types'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: JobListing
  onSelect: (job: JobListing) => void
  onToggleSave: (job: JobListing) => void
  onMatchClick: (job: JobListing) => void
}

export function JobCard({ job, onSelect, onToggleSave, onMatchClick }: JobCardProps) {
  const isIndia = job.country.toLowerCase() === 'india'
  const isRemote = job.work_mode.toLowerCase() === 'remote'

  return (
    <div className={cn(
      "group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
      job.status === 'new' && "ring-1 ring-primary/30"
    )}>
      {/* Top Bar: Company, Logo, Badges */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30 font-semibold text-muted-foreground shadow-xs">
              {job.company_logo ? (
                <img
                  src={job.company_logo} 
                  alt={job.company}
                  className="h-full w-full object-contain p-1.5"
                  onError={(e) => {
                    // Fallback to initial
                    (e.target as HTMLElement).style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-base font-bold text-foreground">{job.company.slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground hover:underline cursor-pointer" onClick={() => onSelect(job)}>
                  {job.company}
                </span>
                {job.tier === 1 && (
                  <span className="inline-flex items-center rounded-sm bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                    Tier 1 Giant
                  </span>
                )}
                {job.tier === 2 && (
                  <span className="inline-flex items-center rounded-sm bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    Top Tier
                  </span>
                )}
              </div>

              <h3 
                className="cursor-pointer text-base font-bold text-foreground transition-colors group-hover:text-primary line-clamp-1"
                onClick={() => onSelect(job)}
              >
                {job.title}
              </h3>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSave(job)
            }}
            className={cn(
              "rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              job.is_saved && "text-amber-500 hover:text-amber-600 bg-amber-500/10"
            )}
            title={job.is_saved ? "Remove from saved" : "Save job"}
          >
            <Bookmark className={cn("h-4 w-4", job.is_saved && "fill-current")} />
          </button>
        </div>

        {/* Location & Tags Row */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            {job.location}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className={cn(
            "rounded-md px-2 py-0.5 font-medium",
            isRemote ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-foreground"
          )}>
            {job.work_mode}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
            {job.exp_min === 0 ? "Fresher / 0–2y" : `${job.exp_min}–${job.exp_max} yrs`}
          </span>
          {job.salary_display && job.salary_display !== 'Not Disclosed' && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {job.salary_display}
              </span>
            </>
          )}
        </div>

        {/* Brief Summary */}
        {job.jd_summary && (
          <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {job.jd_summary}
          </p>
        )}

        {/* Skills Pills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span 
                key={idx}
                className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[11px] text-muted-foreground/70">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar: Recruiter / Verified + Action Buttons */}
      <div className="mt-4 pt-3.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
        {/* Recruiter contact or verified pulse */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {job.hiring_contact?.name ? (
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              <UserCheck className="h-3 w-3" />
              Recruiter: {job.hiring_contact.name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Verified Active
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* AI Match Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMatchClick(job)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-600 transition-all hover:bg-purple-500/20 dark:text-purple-400"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Fit Score
          </button>

          {/* Direct Apply */}
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-transform hover:opacity-90 active:scale-95"
          >
            <span>Apply</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

