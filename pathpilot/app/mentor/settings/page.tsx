'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Settings,
  User,
  ShieldCheck,
  Video,
  Bell,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Lock,
} from 'lucide-react'

export default function MentorSettingsPage() {
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsReminders, setSmsReminders] = useState(false)
  const [autoConfirm, setAutoConfirm] = useState(true)
  const [saved, setSaved] = useState(false)

  const [mentorEmail, setMentorEmail] = useState('mentor@pathpilot.dev')
  const [mentorName, setMentorName] = useState('Mentor')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('calendar') === 'connected' || document.cookie.includes('pathpilot_google_calendar_connected=true')) {
        setCalendarConnected(true)
      }

      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient()
        if (supabase) {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              setMentorEmail(user.email || 'mentor@pathpilot.dev')
              setMentorName(user.user_metadata?.full_name || user.user_metadata?.name || 'Mentor')
              if (user.user_metadata?.google_calendar_connected) {
                setCalendarConnected(true)
              }
            }
          })
        }
      })
    }
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Mentor Configuration &amp; Integrations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account &amp; Portal Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your Google Calendar connection, notifications, and marketplace preferences.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your mentor preferences have been saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Account Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Mentor Credentials</h2>
              <p className="text-xs text-slate-500">Your registered platform account details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={mentorName}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Account Email</label>
              <input
                type="email"
                disabled
                value={mentorEmail}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Need to modify your public bio, hourly rate, or mentoring expertise?
            </span>
            <Link
              href="/mentor/profile/edit"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
            >
              <span>Edit Profile</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* 2. Google Calendar & Meet Integration Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Google Calendar &amp; Meet</h2>
                <p className="text-xs text-slate-500">
                  Auto-create genuine Google Meet conferencing links and sync bookings to your Google Calendar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {calendarConnected ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Connected</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarConnected(false)
                      document.cookie = 'pathpilot_google_calendar_connected=; path=/; max-age=0'
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <a
                  href="/api/auth/google/calendar-connect"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs inline-flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Connect Google</span>
                </a>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            When connected, whenever a student books a session, Google Calendar API with{' '}
            <code className="text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded">
              conferenceDataVersion=1
            </code>{' '}
            automatically provisions an official Google Meet room, sends instant calendar invites with notification alarms to both participants, and emails the student preparation agenda.
          </p>
        </div>

        {/* 3. Notification Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Communication &amp; Alerts</h2>
              <p className="text-xs text-slate-500">Configure how and when you receive mentee updates.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Email Alerts on New Booking</p>
                <p className="text-[11px] text-slate-500">
                  Receive an instant email summary whenever a candidate confirms a slot.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Instant Booking Confirmation</p>
                <p className="text-[11px] text-slate-500">
                  Automatically confirm bookings that match your open availability without manual approval.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoConfirm}
                onChange={e => setAutoConfirm(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  )
}
