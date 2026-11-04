'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  User,
  Briefcase,
  Building,
  Mail,
  ShieldCheck,
  AlertCircle,
  Clock,
  Award,
  CheckCircle2,
  Edit3,
  Calendar,
  Sparkles,
  ExternalLink,
  Globe,
  Video,
  DollarSign,
  Languages,
  BookOpen,
} from 'lucide-react'
import { MentorProfile } from '@/types'

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  )
}

export default function MentorProfilePage() {
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/mentor/profile')
        const data = await res.json()
        if (data.success && data.profile) {
          setProfile(data.profile)
        } else {
          // Check local draft fallback
          if (typeof window !== 'undefined') {
            const draft = localStorage.getItem('pathpilot_mentor_draft')
            if (draft) {
              setProfile(JSON.parse(draft))
            }
          }
        }
      } catch (err) {
        console.error('Error fetching mentor profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const defaultProfile: Partial<MentorProfile> = {
    full_name: 'Industry Mentor',
    email: 'mentor@pathpilot.ai',
    title: 'Lead Software Engineer',
    organisation: 'Tech Enterprise',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    years_experience: 6,
    primary_domain: 'Software Engineering',
    skills: ['System Design', 'React / Next.js', 'Python', 'PostgreSQL', 'Microservices'],
    mentoring_topics: ['Resume Review & Project Critique', 'System Design Fundamentals', 'Mock Technical Interview'],
    languages: ['English', 'Hindi'],
    bio: 'Passionate engineering leader dedicated to mentoring computer science students on real-world systems, clean architecture, and technical interview excellence.',
    session_price_inr: 599,
    session_duration_mins: [30, 60],
    country: 'India',
    timezone: 'Asia/Kolkata',
    verification_status: 'pending_approval',
    linkedin_url: 'https://linkedin.com',
  }

  const p = profile || defaultProfile
  const status = p.verification_status || 'draft'
  const isApproved = status === 'approved'
  const isPending = status === 'pending_approval'

  // Calculate completion percentage
  const fields = [
    Boolean(p.full_name),
    Boolean(p.email),
    Boolean(p.title),
    Boolean(p.organisation),
    Boolean(p.linkedin_url),
    Boolean(p.primary_domain || (p.domains && p.domains.length > 0)),
    Boolean(p.skills && p.skills.length > 0),
    Boolean(p.mentoring_topics && p.mentoring_topics.length > 0),
    Boolean(p.bio && p.bio.length >= 50),
    Boolean(p.session_duration_mins && p.session_duration_mins.length > 0),
  ]
  const completedFields = fields.filter(Boolean).length
  const completionPercent = Math.round((completedFields / fields.length) * 100)

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Professional Presence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Mentor Profile
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage how your professional credentials, expertise, and consultation preferences appear to students.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/mentor/profile/edit"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
          <Link
            href="/mentor/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all"
          >
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* ── Verification Status Banner ─────────────────────────────── */}
      <div
        className={`rounded-2xl p-6 border transition-all ${
          isApproved
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : isPending
            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-700'
                  : isPending
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isApproved ? (
                <ShieldCheck className="w-6 h-6" />
              ) : isPending ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Edit3 className="w-6 h-6" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold">
                  {isApproved
                    ? 'Verified & Published in Student Marketplace'
                    : isPending
                    ? 'Application Pending Review'
                    : 'Profile Draft Incomplete'}
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isApproved
                      ? 'bg-emerald-200 text-emerald-900'
                      : isPending
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed opacity-90 max-w-2xl">
                {isApproved
                  ? 'Your profile is approved and live in the student consultation directory. Students can view your weekly availability and schedule genuine 1-on-1 consultations.'
                  : isPending
                  ? 'Your profile details have been submitted for verification. Our review team verifies professional credentials and LinkedIn history to keep PathPilot a high-trust marketplace. You will be notified once approved.'
                  : 'Your profile has not yet been submitted for verification. Complete the 5-step onboarding wizard to submit your profile for student discovery.'}
              </p>
            </div>
          </div>

          {!isApproved && (
            <Link
              href="/mentor/onboarding"
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs whitespace-nowrap self-start sm:self-auto shrink-0 shadow-xs"
            >
              {isPending ? 'Update Application' : 'Complete Onboarding →'}
            </Link>
          )}
        </div>

        {/* Completion Progress */}
        <div className="mt-4 pt-4 border-t border-slate-200/60">
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
            <span>Profile Completion</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Profile Summary Card ───────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Cover / Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
              alt={p.full_name || 'Mentor'}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{p.full_name}</h2>
                {isApproved && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-700 flex items-center gap-2 flex-wrap">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{p.title}</span>
                <span className="text-slate-400">&bull;</span>
                <Building className="w-4 h-4 text-slate-400" />
                <span>{p.organisation}</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                <span>{p.years_experience} Years Experience</span>
                <span>&bull;</span>
                <span>{p.primary_domain || (p.domains && p.domains[0]) || 'Software Engineering'}</span>
                <span>&bull;</span>
                <span>{p.country || 'India'} ({p.timezone || 'Asia/Kolkata'})</span>
              </div>
            </div>

            {p.linkedin_url && (
              <a
                href={p.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 text-xs font-semibold self-start sm:self-auto transition-colors"
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* Biography */}
        <div className="p-6 sm:p-8 border-b border-slate-100 space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">About & Bio</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {p.bio || 'No biography written yet.'}
          </p>
        </div>

        {/* Mentoring Topics & Skills */}
        <div className="p-6 sm:p-8 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Mentoring Topics</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {p.mentoring_topics && p.mentoring_topics.length > 0 ? (
                p.mentoring_topics.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-100 text-xs font-medium"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">None selected</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Core Technical Skills</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {p.skills && p.skills.length > 0 ? (
                p.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">None listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Session Formats & Pricing */}
        <div className="p-6 sm:p-8 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Video className="w-4 h-4 text-blue-600" />
              <span>Google Meet Video Sessions</span>
              <span>&bull;</span>
              <Languages className="w-4 h-4 text-slate-400" />
              <span>{(p.languages || ['English']).join(', ')}</span>
            </div>
            <p className="text-xs text-slate-500">
              Durations enabled: {(p.session_duration_mins || [30, 60]).map((d) => `${d}m`).join(', ')}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Consultation Rate</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ₹{p.session_price_inr ?? 500}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
