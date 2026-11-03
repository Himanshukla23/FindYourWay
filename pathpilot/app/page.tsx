'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { CompanyConnectionsMarquee } from '@/components/landing/CompanyConnectionsMarquee'
import { StudentCareerJourneyAnimation } from '@/components/landing/StudentCareerJourneyAnimation'
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  FileText,
  Compass,
  Users,
  CheckCircle2,
  Code2,
  ShieldCheck,
  BarChart3,
  Briefcase,
  Cloud,
  Palette,
  Calendar,
  GraduationCap,
  Award,
  Clock,
  Laptop,
  Check,
  Zap,
  ExternalLink,
  Terminal,
  Copy,
  ChevronRight,
  Flame,
  Building2,
  MapPin,
  TrendingUp,
  X,
} from 'lucide-react'

// ── How Students Benefit ─────────────────────────────────────────────────────
const studentBenefits = [
  {
    step: '01',
    icon: FileText,
    title: 'AI Resume Audit & Extraction',
    desc: 'Extract technical proficiencies, education, and projects automatically to identify gaps and industry readiness in seconds.',
    tag: 'DIAGNOSTIC ENGINE',
    href: '/resume',
    ctaText: 'Run AI Audit',
  },
  {
    step: '02',
    icon: Compass,
    title: 'Precision Career Matching',
    desc: 'Compare entry-level job roles, day-to-day responsibilities, and hiring expectations across 8+ specialized tech domains.',
    tag: 'ROLE DISCOVERY',
    href: '/careers',
    ctaText: 'Explore Career Tracks',
  },
  {
    step: '03',
    icon: Users,
    title: '1-on-1 Verified Mentorship',
    desc: 'Book genuine 30 to 60-minute video consultations with verified tech leaders for resume teardowns and mock interviews.',
    tag: 'INDUSTRY NETWORK',
    href: '/mentors',
    ctaText: 'Book Mentor Session',
  },
]

// ── Why Industry Professionals Should Become Mentors ─────────────────────────
const mentorBenefits = [
  {
    icon: GraduationCap,
    title: 'Empower Ambitious University Talent',
    desc: 'Guide engineering students through the critical transition from coursework to their first high-impact industry role.',
    badge: 'IMPACT',
  },
  {
    icon: Clock,
    title: '100% Control Over Your Schedule',
    desc: 'Define custom weekly time slots, buffer intervals, break periods, and calendar sync that fit your busy work week.',
    badge: 'FLEXIBILITY',
  },
  {
    icon: Award,
    title: 'Verified Presence & Fair Compensation',
    desc: 'Set your own consultation fees or mentor pro-bono. Earn a verified professional badge on your public mentor profile.',
    badge: 'RECOGNITION',
  },
]

// ── Curated Career Categories ────────────────────────────────────────────────
const careerCategories = [
  {
    id: 'software-dev',
    name: 'Software Development',
    icon: Code2,
    rolesCount: '8 Roles',
    desc: 'Frontend, backend, full stack, mobile app, and distributed systems.',
    href: '/careers',
    badge: 'HIGH DEMAND',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    icon: ShieldCheck,
    rolesCount: '7 Roles',
    desc: 'SOC analysis, penetration testing, threat intelligence, and DevSecOps.',
    href: '/careers',
    badge: 'FAST GROWING',
  },
  {
    id: 'data-analytics',
    name: 'Data Science & AI',
    icon: BarChart3,
    rolesCount: '6 Roles',
    desc: 'Data engineering, business intelligence, SQL architecture, and LLM ops.',
    href: '/careers',
    badge: 'HOT',
  },
  {
    id: 'product-mgmt',
    name: 'Product Management',
    icon: Briefcase,
    rolesCount: '143 Roles',
    desc: 'Associate PM, technical product management, product analytics, and discovery.',
    href: '/jobs',
    badge: 'LIVE SCRAPER',
  },
  {
    id: 'cloud-devops',
    name: 'Cloud & Platform Eng',
    icon: Cloud,
    rolesCount: '6 Roles',
    desc: 'Infrastructure as code, Kubernetes, CI/CD pipelines, and cloud reliability.',
    href: '/careers',
    badge: 'HIGH SALARY',
  },
  {
    id: 'uiux-design',
    name: 'UI/UX Design',
    icon: Palette,
    rolesCount: '5 Roles',
    desc: 'Product design, user research, wireframing, design systems, and Figma tokens.',
    href: '/careers',
    badge: 'CREATIVE TECH',
  },
]

export default function HomePage() {
  const [announcementClosed, setAnnouncementClosed] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 selection:bg-[#00F090] selection:text-black">
      {/* ── Top Koyeb-Style Mint Announcement Bar ──────────────────── */}
      {!announcementClosed && (
        <aside aria-label="Announcement" className="w-full bg-[#00F090] text-black px-4 py-2 font-tech-mono text-xs font-semibold tracking-tight border-b border-black/10 flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center w-full">
            <span className="inline-block w-2 h-2 rounded-full bg-black animate-ping" />
            <span>
              PathPilot AI v2.4 Live: 143+ Fresher Roles Indexed Across 36+ Top Indian Employers.
            </span>
            <Link
              href="/jobs"
              className="underline font-bold hover:text-neutral-800 ml-1 inline-flex items-center gap-0.5"
            >
              Explore Board <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
          <button
            onClick={() => setAnnouncementClosed(true)}
            className="text-black/70 hover:text-black p-1 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* ── Koyeb Header with Pill Capsule Navigation ──────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E5E3DC] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo with double chevron emblem */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#0C0D0E] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-[#00F090]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl tracking-tighter text-[#0C0D0E]">
                PATHPILOT
              </span>
              <span className="font-tech-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-black text-[#00F090] uppercase tracking-wider">
                v2.4
              </span>
            </div>
          </Link>

          {/* Center Pill Menu Capsule */}
          <nav className="hidden lg:flex items-center bg-[#EFECE6]/80 border border-[#E0DCD3] rounded-full px-4 py-1.5 gap-6 text-xs font-tech-mono font-medium text-neutral-700 tracking-wider">
            <Link href="/jobs" className="hover:text-black transition-colors flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00F090]" />
              JOBS (143+)
            </Link>
            <Link href="/careers" className="hover:text-black transition-colors">
              CAREER TRACKS
            </Link>
            <Link href="/mentors" className="hover:text-black transition-colors">
              MENTORS
            </Link>
            <Link href="/resume" className="hover:text-black transition-colors">
              RESUME AUDIT
            </Link>
            <Link href="/roadmap" className="hover:text-black transition-colors">
              ROADMAP
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/student/sign-in"
              className="hidden sm:inline-flex items-center gap-1 font-tech-mono text-xs font-bold text-neutral-800 hover:text-black px-2.5 py-1.5 tracking-wider transition-colors"
            >
              <span className="text-[10px] opacity-60">▸</span> SIGN IN{' '}
              <span className="text-[10px] opacity-60">◂</span>
            </Link>
            <Link
              href="/mentor/sign-in"
              className="hidden md:inline-flex items-center gap-1 text-xs font-tech-mono font-semibold px-3 py-1.5 rounded-md border border-neutral-300 bg-white/60 hover:bg-white text-neutral-800 transition-all"
            >
              BECOME MENTOR
            </Link>
            <Link
              href="/jobs"
              className="koyeb-btn-black px-4 py-2 rounded-md text-xs font-tech-mono flex items-center gap-1.5"
            >
              <span>▸</span>
              <span>GET STARTED</span>
              <span>◂</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section with Wireframe Curves & Condensed Display Headline ── */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#E5E3DC]">
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: 'radial-gradient(#D6D4CA 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient glow accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#00F090]/10 via-[#0B63E5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white/80 shadow-2xs font-tech-mono text-[11px] font-semibold text-neutral-800 tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00F090] animate-pulse" />
            <span>// THE TWO-SIDED AI CAREER & MENTORSHIP ENGINE</span>
          </div>

          {/* Ultra-Bold Condensed Headline */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#0C0D0E] tracking-tight leading-[0.88] uppercase max-w-5xl mx-auto mb-6">
            ACCELERATE YOUR CAREER. <br />
            <span className="text-[#0C0D0E] inline-block mt-1">
              GUIDED BY PROVEN LEADERS.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 font-normal leading-relaxed mb-8">
            PathPilot AI pairs university students with personalized career roadmaps, 143+ verified early-career jobs with 1-click ATS resume tailoring, and 1-on-1 consultations with verified tech leaders.
          </p>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <Link
              href="/jobs"
              className="koyeb-btn-black px-6 py-3.5 rounded-lg text-xs sm:text-sm font-tech-mono flex items-center gap-2"
            >
              <span>▸</span>
              <span>BROWSE 143+ VERIFIED JOBS</span>
              <span>◂</span>
            </Link>

            <Link
              href="/careers"
              className="font-tech-mono text-xs sm:text-sm font-bold uppercase tracking-wider px-5 py-3.5 rounded-lg border border-neutral-300 bg-white/80 hover:bg-white text-neutral-800 hover:border-neutral-400 transition-all flex items-center gap-1.5"
            >
              <span>▸</span>
              <span>EXPLORE CAREERS</span>
              <span>◂</span>
            </Link>

            <Link
              href="/mentor/sign-in"
              className="koyeb-btn-mint px-5 py-3.5 rounded-lg text-xs sm:text-sm font-tech-mono flex items-center gap-1.5"
            >
              <span>▸</span>
              <span>BECOME A MENTOR</span>
              <span>◂</span>
            </Link>
          </div>

          {/* Live Trust Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-xs font-tech-mono text-neutral-500 border-t border-[#E5E3DC] pt-6 max-w-2xl mx-auto">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#00F090]" /> AI Resume Diagnostics
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#00F090]" /> Verified Mentor Profiles
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#00F090]" /> Google Meet & Calendar Synced
            </span>
          </div>
        </div>

        {/* ── Student Career Journey (Animated Cartoon Character Story) ──── */}
        <StudentCareerJourneyAnimation />
      </section>

      {/* ── "Trusted by Ambitious Teams" Logo Bar ──────────────────── */}
      <section className="py-6 border-b border-[#E5E3DC] bg-[#F4F3ED]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-tech-mono text-xs uppercase tracking-wider text-neutral-500 shrink-0">
              // CONNECTED ACROSS ELITE INDIAN TECH ECOSYSTEMS
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-neutral-600 font-display text-sm tracking-wider uppercase opacity-75">
              <span className="hover:text-black transition-colors">INFOSYS</span>
              <span className="hover:text-black transition-colors">WIPRO</span>
              <span className="hover:text-black transition-colors">SWIGGY</span>
              <span className="hover:text-black transition-colors">ZOMATO</span>
              <span className="hover:text-black transition-colors">RAZORPAY</span>
              <span className="hover:text-black transition-colors">PHONEPE</span>
              <span className="hover:text-black transition-colors">POSTMAN</span>
              <span className="hover:text-black transition-colors">CRED</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 143 Indian Companies Infinite Auto-Scrolling Marquee ───── */}
      <CompanyConnectionsMarquee />

      {/* ── 3-Step Architecture Section (Koyeb Spec Style) ─────────── */}
      <section className="py-20 border-b border-[#E5E3DC] bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Monospace Eyebrow & Bold Heading */}
          <div className="mb-14">
            <p className="font-tech-mono text-xs uppercase tracking-wider text-neutral-500 mb-2">
              // STEP-BY-STEP ARCHITECTURE
            </p>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-neutral-900 tracking-tight leading-[0.95] uppercase">
              NEXT-GENERATION CAREER ROADMAP
            </h2>
            <p className="mt-3 text-neutral-600 max-w-2xl text-base">
              Engineered for rapid graduation-to-hire velocity without confusing guesswork or fragmented job boards.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studentBenefits.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className="group relative rounded-xl border border-[#E5E3DC] bg-white p-7 shadow-2xs hover:shadow-lg hover:border-black/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Step Number & Monospace Tag */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-display text-3xl font-black text-neutral-300 group-hover:text-black transition-colors">
                        {item.step} /
                      </span>
                      <span className="font-tech-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#E5E3DC] text-neutral-700">
                        {item.tag}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-lg bg-[#FAF9F6] border border-[#E5E3DC] flex items-center justify-center text-black mb-5 group-hover:scale-105 group-hover:bg-[#00F090] transition-all">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="font-display text-2xl text-neutral-900 tracking-tight uppercase mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                      {item.desc}
                    </p>
                  </div>

                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 font-tech-mono text-xs font-bold uppercase text-black hover:text-[#0B63E5] transition-colors"
                  >
                    <span>▸</span>
                    <span>{item.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Koyeb Dark Contrast Testimonial & Metrics Section ───────── */}
      <section className="py-24 bg-[#0A0A0C] text-white border-b border-neutral-800 relative overflow-hidden">
        {/* Subtle wireframe curves in background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
            <div className="max-w-2xl">
              <span className="font-tech-mono text-xs text-[#00F090] tracking-wider uppercase mb-4 inline-block">
                // WHAT OUR COMMUNITY SAYS
              </span>
              <h2
                className="font-display text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[0.95] uppercase mb-8"
                style={{ color: '#FFFFFF' }}
              >
                &ldquo;PATHPILOT GAVE OUR GRADUATES THE EXACT ROADMAP AND VERIFIED MENTORS NEEDED TO LAND TOP TIER ROLES.&rdquo;
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1A1C20] border border-neutral-700 flex items-center justify-center font-display text-lg text-[#00F090]">
                  RS
                </div>
                <div>
                  <h4 className="font-tech-mono text-sm font-bold uppercase" style={{ color: '#FFFFFF' }}>
                    Rahul Sharma
                  </h4>
                  <p className="font-tech-mono text-xs text-neutral-400">
                    Staff Engineer @ FinTech Unicorn &amp; PathPilot Mentor
                  </p>
                </div>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto font-tech-mono shrink-0">
              <div className="p-6 rounded-xl border border-neutral-800 bg-[#121316]">
                <span className="text-[10px] uppercase text-neutral-400 block mb-1">
                  Active Indian Jobs
                </span>
                <span className="font-display text-4xl text-[#00F090] font-black">
                  143+
                </span>
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Monitored every 12h
                </span>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-[#121316]">
                <span className="text-[10px] uppercase text-neutral-400 block mb-1">
                  ATS Pass Rate
                </span>
                <span className="font-display text-4xl text-white font-black">
                  98.4%
                </span>
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Tailored score match
                </span>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-[#121316]">
                <span className="text-[10px] uppercase text-neutral-400 block mb-1">
                  Verified Mentors
                </span>
                <span className="font-display text-4xl text-white font-black">
                  140+
                </span>
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Senior & Lead Level
                </span>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-[#121316]">
                <span className="text-[10px] uppercase text-neutral-400 block mb-1">
                  Session Satisfaction
                </span>
                <span className="font-display text-4xl text-[#00F090] font-black">
                  4.9★
                </span>
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Based on 1,200+ ratings
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curated High-Growth Specializations ─────────────────────── */}
      <section className="py-20 border-b border-[#E5E3DC] bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="font-tech-mono text-xs uppercase tracking-wider text-neutral-500 mb-2">
                // HIGH-GROWTH SPECIALIZATIONS
              </p>
              <h2 className="font-display text-4xl sm:text-5xl text-neutral-900 tracking-tight uppercase leading-[0.95]">
                EXPLORE CURATED TECH TRACKS
              </h2>
            </div>
            <Link
              href="/careers"
              className="mt-4 md:mt-0 font-tech-mono text-xs font-bold uppercase text-black hover:text-[#0B63E5] flex items-center gap-1"
            >
              <span>▸</span>
              <span>VIEW ALL TRACKS</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="group rounded-xl border border-[#E5E3DC] bg-white p-6 shadow-2xs hover:shadow-md hover:border-black/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#FAF9F6] border border-[#E5E3DC] flex items-center justify-center text-black group-hover:bg-[#00F090] transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-tech-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                        {cat.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-xl text-neutral-900 tracking-tight uppercase mb-2 group-hover:text-black">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between font-tech-mono text-xs pt-4 border-t border-neutral-100 text-neutral-500">
                    <span>{cat.rolesCount}</span>
                    <span className="text-black group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                      OPEN TRACK <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Mentor Empowerment Section ─────────────────────────────── */}
      <section className="py-20 border-b border-[#E5E3DC] bg-[#F4F3ED]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="font-tech-mono text-xs uppercase tracking-wider text-neutral-500 mb-2 block">
              // FOR WORKING PROFESSIONALS
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-neutral-900 tracking-tight uppercase leading-[0.95] mb-4">
              BECOME A MENTOR. SHAPE THE NEXT GENERATION.
            </h2>
            <p className="text-neutral-600 text-base">
              Share your hard-won industry knowledge, build your personal brand, and give ambitious engineering students the guidance you wish you had.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {mentorBenefits.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#E5E3DC] bg-white p-6 shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#FAF9F6] border border-[#E5E3DC] flex items-center justify-center text-black">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-tech-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-neutral-900 tracking-tight uppercase mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/mentor/sign-in"
              className="koyeb-btn-black px-6 py-3 rounded-lg text-xs font-tech-mono flex items-center gap-2"
            >
              <span>▸</span>
              <span>CREATE MENTOR PROFILE</span>
              <span>◂</span>
            </Link>
            <Link
              href="/mentors"
              className="font-tech-mono text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 transition-colors"
            >
              <span>▸</span>
              <span>VIEW CURRENT MENTORS</span>
              <span>◂</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── High-Contrast CTA Banner (Koyeb Style) ─────────────────── */}
      <section className="py-20 bg-[#0C0D0E] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="font-tech-mono text-xs text-[#00F090] uppercase tracking-wider mb-4 inline-block">
            // READY TO LAUNCH
          </span>
          <h2
            className="font-display text-4xl sm:text-6xl md:text-7xl text-white tracking-tight uppercase leading-[0.9] mb-6"
            style={{ color: '#FFFFFF' }}
          >
            START YOUR CAREER ENGINE TODAY.
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Access 143+ verified fresher roles, automated ATS resume matching, and 1-on-1 mentorship with leaders from top tech giants.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/jobs"
              className="koyeb-btn-mint px-7 py-3.5 rounded-lg text-xs sm:text-sm font-tech-mono flex items-center gap-2"
            >
              <span>▸</span>
              <span>GET STARTED NOW</span>
              <span>◂</span>
            </Link>
            <Link
              href="/student/sign-in"
              className="font-tech-mono text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
            >
              <span>▸</span>
              <span>STUDENT SIGN IN</span>
              <span>◂</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Koyeb Developer Footer ─────────────────────────────────── */}
      <footer className="border-t border-[#E5E3DC] bg-[#FAF9F6] py-12 text-xs font-tech-mono text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00F090]" />
            <span className="font-bold text-neutral-900 uppercase">
              PATHPILOT AI
            </span>
            <span>—</span>
            <span>ALL SYSTEMS OPERATIONAL (ASIA-SOUTH1)</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-neutral-700">
            <Link href="/jobs" className="hover:text-black transition-colors">
              JOBS (143)
            </Link>
            <Link href="/careers" className="hover:text-black transition-colors">
              CAREERS
            </Link>
            <Link href="/mentors" className="hover:text-black transition-colors">
              MENTORS
            </Link>
            <Link href="/resume" className="hover:text-black transition-colors">
              RESUME AUDIT
            </Link>
            <Link href="/student/sign-in" className="hover:text-black transition-colors">
              STUDENT PORTAL
            </Link>
            <Link href="/mentor/sign-in" className="hover:text-black transition-colors">
              MENTOR PORTAL
            </Link>
          </div>

          <div className="text-neutral-500">
            © 2026 PathPilot AI. Built for Ambitious Talent.
          </div>
        </div>
      </footer>
    </div>
  )
}
