'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Search,
  CheckCircle2,
  Users,
  Briefcase,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Award,
  Flame,
  Check,
} from 'lucide-react'

interface JourneyStep {
  id: number
  tag: string
  title: string
  subtitle: string
  badgeText: string
  badgeColor: string
}

const STEPS: JourneyStep[] = [
  {
    id: 0,
    tag: '01 / SEARCHING & LOST',
    title: 'Looking for a Job & Mentor',
    subtitle: 'Alex graduated with an engineering degree but felt overwhelmed searching random job boards with no feedback or mentors to guide him.',
    badgeText: 'FRUSTRATED SEARCH',
    badgeColor: '#EF4444',
  },
  {
    id: 1,
    tag: '02 / DISCOVERING PATHPILOT',
    title: 'Discovers PathPilot AI',
    subtitle: 'Alex finds PathPilot AI! Within 30 seconds, his resume is audited by AI, gaps are diagnosed, and 143+ direct fresher roles are indexed.',
    badgeText: 'LIGHTBULB MOMENT 💡',
    badgeColor: '#F59E0B',
  },
  {
    id: 2,
    tag: '03 / 1-ON-1 MENTORSHIP',
    title: 'Guided by a Tech Leader',
    subtitle: 'Alex books a 1-on-1 mock interview session with a Staff Engineer from a top tech unicorn who reviews his projects and placement strategy.',
    badgeText: 'EXPERT COACHING 🤝',
    badgeColor: '#3B82F6',
  },
  {
    id: 3,
    tag: '04 / HIRED & CELEBRATION',
    title: 'Alex Lands His Dream Job!',
    subtitle: 'Armed with ATS resume tailoring and mentor insights, Alex aces his interviews and receives an official ₹18.5 LPA job offer letter!',
    badgeText: 'OFFER ACCEPTED 🎉',
    badgeColor: '#00F090',
  },
]

export function StudentCareerJourneyAnimation() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  // Auto-advance loop every 4.2 seconds
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length)
    }, 4200)
    return () => clearInterval(timer)
  }, [isPlaying])

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 px-4 sm:px-6">
      {/* Outer Card with Koyeb Style Border */}
      <div
        className="rounded-2xl border border-neutral-800 bg-[#0C0D0E] shadow-2xl overflow-hidden font-tech-mono relative"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* ── Top Header Controls ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-[#121316] gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-neutral-300 font-bold uppercase tracking-wider">
              ALEX&apos;S CAREER JOURNEY // FROM STUDENT TO HIRED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause Story' : 'Play Story'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-[#00F090]" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-[#00F090]" />
                  <span>PLAY</span>
                </>
              )}
            </button>
            <button
              onClick={() => setCurrentStep(0)}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Restart from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Step Progress Indicator Pills ─────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-neutral-800 bg-black/40 text-[11px]">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`py-3 px-3 text-left transition-all border-r last:border-r-0 border-neutral-800 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-neutral-800/80 text-white'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-[10px] tracking-wider text-[#00F090]">
                    STAGE 0{step.id + 1}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F090] animate-ping" />
                  )}
                </div>
                <span className="font-sans font-semibold text-xs truncate">
                  {step.title}
                </span>

                {/* Progress bar line for active step */}
                <div className="w-full bg-neutral-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isActive ? 'bg-[#00F090] w-full' : 'w-0'
                    }`}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Main Stage Animation Theater ───────────────────────────── */}
        <div className="p-6 sm:p-10 min-h-[380px] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#555 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Column: Expressive Cartoon Character SVG */}
            <div className="md:col-span-5 flex justify-center items-center">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Stage 0: Confused searching character */}
                {currentStep === 0 && (
                  <div className="animate-fade-in flex flex-col items-center">
                    <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-xl animate-bounce-slow">
                      {/* Aura */}
                      <circle cx="100" cy="100" r="85" fill="#EF4444" fillOpacity="0.1" />
                      <circle cx="100" cy="100" r="70" fill="#18181B" stroke="#27272A" strokeWidth="3" />
                      
                      {/* Character Body */}
                      <rect x="75" y="125" width="50" height="55" rx="16" fill="#3B82F6" />
                      <rect x="85" y="130" width="30" height="20" rx="4" fill="#2563EB" />
                      {/* Backpack strap */}
                      <path d="M78 130 L78 175" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" />
                      <path d="M122 130 L122 175" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" />

                      {/* Head */}
                      <circle cx="100" cy="85" r="38" fill="#FDE047" />
                      {/* Hair */}
                      <path d="M68 80 C68 52 132 52 132 80 C125 65 110 65 100 68 C90 65 75 65 68 80 Z" fill="#78350F" />
                      
                      {/* Confused Eyes */}
                      <circle cx="88" cy="82" r="5" fill="#000" />
                      <circle cx="112" cy="82" r="7" fill="#000" />
                      <circle cx="89" cy="80" r="2" fill="#FFF" />
                      <circle cx="113" cy="80" r="2.5" fill="#FFF" />
                      {/* Tilted Eyebrows */}
                      <path d="M82 72 L94 77" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
                      <path d="M106 75 L118 70" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
                      {/* Wavy confused mouth */}
                      <path d="M92 98 Q96 93 100 98 Q104 103 108 98" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />

                      {/* Magnifying Glass */}
                      <g className="animate-pulse">
                        <circle cx="138" cy="100" r="18" fill="none" stroke="#F59E0B" strokeWidth="4" />
                        <line x1="151" y1="113" x2="168" y2="130" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
                        <circle cx="138" cy="100" r="14" fill="#60A5FA" fillOpacity="0.25" />
                        <text x="133" y="105" fontSize="14" fill="#F59E0B" fontWeight="bold">?</text>
                      </g>

                      {/* Floating Question marks */}
                      <text x="45" y="60" fontSize="22" fill="#EF4444" fontWeight="bold" className="animate-ping">?</text>
                      <text x="145" y="55" fontSize="18" fill="#F59E0B" fontWeight="bold">?</text>
                    </svg>
                  </div>
                )}

                {/* Stage 1: Lightbulb Discovery */}
                {currentStep === 1 && (
                  <div className="animate-fade-in flex flex-col items-center">
                    <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-xl animate-bounce-slow">
                      {/* Mint Aura */}
                      <circle cx="100" cy="100" r="85" fill="#00F090" fillOpacity="0.12" />
                      <circle cx="100" cy="100" r="70" fill="#18181B" stroke="#00F090" strokeWidth="2" strokeDasharray="4 4" />

                      {/* Glowing Lightbulb above head */}
                      <g className="animate-bounce">
                        <circle cx="100" cy="32" r="14" fill="#FBBF24" />
                        <rect x="96" y="44" width="8" height="5" fill="#9CA3AF" />
                        <line x1="100" y1="12" x2="100" y2="6" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
                        <line x1="82" y1="20" x2="76" y2="16" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
                        <line x1="118" y1="20" x2="124" y2="16" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
                      </g>

                      {/* Body */}
                      <rect x="75" y="125" width="50" height="55" rx="16" fill="#059669" />
                      {/* Tablet holding */}
                      <rect x="80" y="135" width="40" height="26" rx="4" fill="#000" stroke="#00F090" strokeWidth="2" />
                      <line x1="86" y1="144" x2="114" y2="144" stroke="#00F090" strokeWidth="2" />
                      <line x1="86" y1="150" x2="106" y2="150" stroke="#00F090" strokeWidth="2" />

                      {/* Head */}
                      <circle cx="100" cy="85" r="38" fill="#FDE047" />
                      {/* Hair */}
                      <path d="M68 80 C68 52 132 52 132 80 C125 65 110 65 100 68 C90 65 75 65 68 80 Z" fill="#78350F" />
                      
                      {/* Excited Eyes */}
                      <ellipse cx="88" cy="84" rx="6" ry="7" fill="#000" />
                      <ellipse cx="112" cy="84" rx="6" ry="7" fill="#000" />
                      <circle cx="86" cy="82" r="2.5" fill="#FFF" />
                      <circle cx="110" cy="82" r="2.5" fill="#FFF" />
                      {/* Happy curved eyebrows */}
                      <path d="M82 72 Q88 68 94 72" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <path d="M106 72 Q112 68 118 72" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
                      {/* Big open smile */}
                      <path d="M90 95 Q100 110 110 95 Z" fill="#DC2626" />
                    </svg>
                  </div>
                )}

                {/* Stage 2: 1-on-1 Mentorship Video Consultation */}
                {currentStep === 2 && (
                  <div className="animate-fade-in flex flex-col items-center">
                    <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-xl animate-bounce-slow">
                      <circle cx="100" cy="100" r="85" fill="#3B82F6" fillOpacity="0.12" />
                      <circle cx="100" cy="100" r="70" fill="#18181B" stroke="#3B82F6" strokeWidth="3" />

                      {/* Laptop on desk */}
                      <rect x="60" y="145" width="80" height="6" rx="2" fill="#94A3B8" />
                      <rect x="70" y="115" width="60" height="32" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                      {/* Mentor on screen */}
                      <circle cx="100" cy="128" r="8" fill="#FDE047" />
                      <rect x="94" y="136" width="12" height="10" rx="3" fill="#6366F1" />

                      {/* Alex Head with Headset */}
                      <circle cx="100" cy="82" r="34" fill="#FDE047" />
                      <path d="M72 78 C72 52 128 52 128 78 Z" fill="#78350F" />
                      {/* Headset Arc */}
                      <path d="M68 84 A34 34 0 0 1 132 84" stroke="#1E293B" strokeWidth="5" fill="none" />
                      <rect x="64" y="78" width="8" height="16" rx="4" fill="#00F090" />
                      <rect x="128" y="78" width="8" height="16" rx="4" fill="#00F090" />
                      <path d="M68 90 L85 96" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

                      {/* Attentive Eyes & Smile */}
                      <circle cx="90" cy="82" r="4.5" fill="#000" />
                      <circle cx="110" cy="82" r="4.5" fill="#000" />
                      <path d="M92 94 Q100 102 108 94" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />

                      {/* Speech Bubble */}
                      <rect x="135" y="45" width="55" height="24" rx="6" fill="#00F090" />
                      <text x="142" y="61" fontSize="10" fontWeight="bold" fill="#000">PRO TIPS!</text>
                    </svg>
                  </div>
                )}

                {/* Stage 3: Hired! Celebration with Offer Letter */}
                {currentStep === 3 && (
                  <div className="animate-fade-in flex flex-col items-center">
                    <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-xl animate-bounce-slow">
                      <circle cx="100" cy="100" r="85" fill="#00F090" fillOpacity="0.18" />
                      <circle cx="100" cy="100" r="70" fill="#18181B" stroke="#00F090" strokeWidth="4" />

                      {/* Confetti particles */}
                      <circle cx="45" cy="45" r="4" fill="#F59E0B" className="animate-ping" />
                      <rect x="150" y="40" width="7" height="7" fill="#3B82F6" transform="rotate(25)" />
                      <polygon points="160,140 166,150 154,150" fill="#EC4899" />
                      <circle cx="35" cy="130" r="4" fill="#00F090" />

                      {/* Alex Body - Arms raised in victory! */}
                      <rect x="75" y="118" width="50" height="58" rx="16" fill="#10B981" />
                      {/* Left raised arm */}
                      <path d="M76 126 L55 95" stroke="#10B981" strokeWidth="12" strokeLinecap="round" />
                      {/* Right arm holding Offer Letter */}
                      <path d="M124 126 L148 100" stroke="#10B981" strokeWidth="12" strokeLinecap="round" />

                      {/* Official Offer Letter */}
                      <g className="animate-pulse">
                        <rect x="140" y="80" width="36" height="46" rx="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
                        <rect x="145" y="86" width="26" height="4" fill="#10B981" />
                        <rect x="145" y="94" width="20" height="2" fill="#94A3B8" />
                        <rect x="145" y="99" width="24" height="2" fill="#94A3B8" />
                        <circle cx="158" cy="114" r="6" fill="#F59E0B" />
                      </g>

                      {/* Head */}
                      <circle cx="100" cy="78" r="36" fill="#FDE047" />
                      {/* Hair */}
                      <path d="M68 72 C68 46 132 46 132 72 Z" fill="#78350F" />
                      {/* Sunglasses of victory */}
                      <rect x="80" y="72" width="18" height="12" rx="3" fill="#000" />
                      <rect x="102" y="72" width="18" height="12" rx="3" fill="#000" />
                      <line x1="97" y1="76" x2="103" y2="76" stroke="#000" strokeWidth="3" />
                      {/* Triumphant grin */}
                      <path d="M88 94 Q100 114 112 94 Z" fill="#FFF" stroke="#78350F" strokeWidth="2" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Story Text & Live Context Badges */}
            <div className="md:col-span-7 space-y-4">
              {/* Badge & Stage Counter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-tech-mono font-bold px-2.5 py-1 rounded bg-[#00F090]/15 text-[#00F090] border border-[#00F090]/30">
                  {STEPS[currentStep].tag}
                </span>
                <span
                  className="text-xs font-tech-mono font-bold px-2.5 py-1 rounded border uppercase text-white"
                  style={{ backgroundColor: `${STEPS[currentStep].badgeColor}25`, borderColor: STEPS[currentStep].badgeColor }}
                >
                  {STEPS[currentStep].badgeText}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display text-3xl sm:text-4xl text-white tracking-tight uppercase leading-tight">
                {STEPS[currentStep].title}
              </h3>

              {/* Story Description */}
              <p className="font-sans text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
                {STEPS[currentStep].subtitle}
              </p>

              {/* Dynamic Feature Pills based on Step */}
              <div className="pt-2">
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-tech-mono text-neutral-300">
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                      <span className="text-red-400">❌</span>
                      <span>Generic job board ghosting</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                      <span className="text-amber-400">🔍</span>
                      <span>No verified mentor advice</span>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-tech-mono text-neutral-300">
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                      <span className="text-[#00F090]">✔</span>
                      <span>AI Resume Scored: 95% Match</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                      <span className="text-[#00F090]">✔</span>
                      <span>143+ Indian Fresher Jobs Indexed</span>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-tech-mono text-neutral-300">
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                      <span className="text-blue-400">🤝</span>
                      <span>1:1 Live Mock System Design</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                      <span className="text-[#00F090]">🎯</span>
                      <span>Readiness Score: 100% Ready</span>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-tech-mono text-neutral-300">
                    <div className="p-2.5 rounded-lg bg-[#00F090]/10 border border-[#00F090]/30 text-[#00F090] font-bold flex items-center gap-2">
                      <span>🚀</span>
                      <span>Offer: ₹18.5 LPA Package</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#00F090]/10 border border-[#00F090]/30 text-[#00F090] font-bold flex items-center gap-2">
                      <span>🎉</span>
                      <span>Hired at Top Tech Unicorn</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Interactive Callout ─────────────────────────────── */}
        <div className="px-6 py-3.5 bg-[#141518] border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00F090] animate-pulse" />
            <span>Auto-repeating career loop • Ready to write your own hire story?</span>
          </div>
          <Link
            href="/jobs"
            className="koyeb-btn-mint px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5"
          >
            <span>START YOUR JOURNEY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
