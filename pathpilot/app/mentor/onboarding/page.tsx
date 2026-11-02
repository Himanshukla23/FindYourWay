'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, ArrowLeft, LogOut } from 'lucide-react'
import { MentorProfileWizard } from '@/components/mentor/MentorProfileWizard'

export default function MentorOnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                PathPilot <span className="text-blue-600">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">
                Mentor Onboarding
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/mentor/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Skip to Dashboard
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2.5 py-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <div className="mb-4">
          <Link
            href="/mentor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Mentor Portal</span>
          </Link>
        </div>

        <MentorProfileWizard mode="onboarding" />
      </main>
    </div>
  )
}
