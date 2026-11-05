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
  Power,
  RotateCcw,
} from 'lucide-react'
import { MentorProfile } from '@/types'

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

export default function MentorProfilePage() {
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/mentor/profile')
      const data = await res.json()
      if (data.success && data.profile) {
        setProfile(data.profile)
      }
    } catch (err) {
      console.error('Error fetching mentor profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  // Fast self-service toggle: Mentor has full authority to approve/publish or unpublish!
  const handleTogglePublish = async (targetStatus: 'approved' | 'draft') => {
    if (!profile) return
    setUpdatingStatus(true)
    setStatusMessage(null)

    try {
      const res = await fetch('/api/mentor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: targetStatus === 'approved' ? 'approve' : 'unpublish',
          isDraft: targetStatus !== 'approved',
          profile: {
            ...profile,
            verification_status: targetStatus,
            is_verified: targetStatus === 'approved',
          },
        }),
      })

      const data = await res.json()
      if (data.success) {
        setProfile((prev) => (prev ? {
          ...prev,
          verification_status: targetStatus,
          is_verified: targetStatus === 'approved',
        } : null))
        setStatusMessage(
          targetStatus === 'approved'
            ? 'Success! Your mentor profile is verified and active in the student marketplace.'
            : 'Your profile visibility has been paused.'
        )
        setTimeout(() => setStatusMessage(null), 5000)
      } else {
        setStatusMessage(`Error: ${data.error || 'Failed to update status'}`)
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err?.message || 'Something went wrong'}`)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const defaultProfile: Partial<MentorProfile> = {
    full_name: 'Mentor Profile',
    email: '',
    title: 'Software Engineer',
    organisation: 'Tech Enterprise',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    years_experience: 4,
    primary_domain: 'Software Engineering',
    skills: ['System Design', 'React / Next.js', 'Python', 'PostgreSQL'],
    mentoring_topics: ['Resume Review & Project Critique', 'Mock Technical Interview'],
    languages: ['English', 'Hindi'],
    bio: 'Passionate engineering leader dedicated to mentoring computer science students on real-world systems, clean architecture, and technical interview excellence.',
    session_price_inr: 499,
    session_duration_mins: [30, 60],
    country: 'India',
    timezone: 'Asia/Kolkata',
    verification_status: 'approved',
    is_verified: true,
    linkedin_url: 'https://linkedin.com',
  }

  const p = profile || defaultProfile
  const status = p.verification_status || 'approved'
  const isApproved = status === 'approved' || Boolean(p.is_verified)

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
    Boolean(p.bio && p.bio.length >= 30),
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
            Manage your credentials, expertise, consultation pricing, and live marketplace availability.
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

      {/* ── Status Feedback Alert ───────────────────────────────────── */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 text-sm animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Verification & Authority Banner ─────────────────────────── */}
      <div
        className={`rounded-2xl p-6 border transition-all ${
          isApproved
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/90 border-amber-200 text-amber-950'
          }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
                }`}
            >
              {isApproved ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold">
                  {isApproved
                    ? 'Verified & Published in Student Marketplace'
                    : 'Profile Pending Activation'}
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isApproved
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-200 text-amber-900'
                    }`}
                >
                  {isApproved ? 'LIVE & ACTIVE' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed opacity-90 max-w-2xl">
                {isApproved
                  ? 'Your profile is approved and live in the student directory. Students can view your background, book 1-on-1 consultations, and receive automatic Google Meet invitations.'
                  : 'You have full authority over your profile. Click "Publish & Go Live" below to immediately activate your profile in the student marketplace.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            {isApproved ? (
              <button
                type="button"
                onClick={() => handleTogglePublish('draft')}
                disabled={updatingStatus}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors"
              >
                <Power className="w-3.5 h-3.5 text-slate-500" />
                <span>{updatingStatus ? 'Updating...' : 'Pause Visibility'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleTogglePublish('approved')}
                disabled={updatingStatus}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{updatingStatus ? 'Publishing...' : 'Approve & Go Live Now'}</span>
              </button>
            )}

            <Link
              href="/mentor/profile/edit"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs"
            >
              Update Details
            </Link>
          </div>
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

      {/* ── Authority & Marketplace Controls ────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Mentor Authority & Publishing Rights
            </h4>
          </div>
          <p className="text-xs text-slate-600 max-w-xl">
            You hold complete administrative authority over your profile information, pricing, and availability. All edits persist directly to your verified profile and update your marketplace listings in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/mentor/availability"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Hours</span>
          </Link>
          <Link
            href="/mentors"
            target="_blank"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-semibold"
          >
            <span>View in Marketplace</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Main Profile Summary Card ───────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Header / Intro */}
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

        {/* Expertise & Skills */}
        <div className="p-6 sm:p-8 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Core Technical Proficiencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {p.skills && p.skills.length > 0 ? (
                p.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No skills selected</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mentoring & Consultation Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {p.mentoring_topics && p.mentoring_topics.length > 0 ? (
                p.mentoring_topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No topics selected</span>
              )}
            </div>
          </div>
        </div>

        {/* Consultation Pricing & Duration Details */}
        <div className="p-6 sm:p-8 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-3 gap-6 text-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Session Pricing</span>
            </div>
            <p className="text-xl font-extrabold text-slate-900">
              ₹{p.session_price_inr ?? 499}{' '}
              <span className="text-xs font-normal text-slate-500">per session</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Session Durations</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {p.session_duration_mins && p.session_duration_mins.length > 0
                ? p.session_duration_mins.map((d) => `${d} mins`).join(' & ')
                : '30 & 60 mins'}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
              <Languages className="w-3.5 h-3.5 text-purple-600" />
              <span>Languages</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {p.languages && p.languages.length > 0 ? p.languages.join(', ') : 'English, Hindi'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
