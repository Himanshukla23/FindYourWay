import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles,
  ArrowRight,
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
} from 'lucide-react'

// ── How Students Benefit ─────────────────────────────────────────────────────
const studentBenefits = [
  {
    icon: FileText,
    title: 'AI Resume Audit & Skill Extraction',
    desc: 'Extract technical proficiencies, education, and projects automatically to identify gaps and industry readiness in seconds.',
    badge: 'Step 1: Discover',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Compass,
    title: 'Precision Career Track Matching',
    desc: 'Compare entry-level job roles, day-to-day responsibilities, and hiring expectations across 8+ specialized tech domains.',
    badge: 'Step 2: Compare',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    icon: Users,
    title: 'Direct 1-on-1 Mentor Sessions',
    desc: 'Book genuine 30 to 60-minute video consultations with verified tech leaders for resume teardowns and mock interviews.',
    badge: 'Step 3: Connect',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
]

// ── Why Industry Professionals Should Become Mentors ─────────────────────────
const mentorBenefits = [
  {
    icon: GraduationCap,
    title: 'Empower Ambitious University Talent',
    desc: 'Guide engineering students through the critical transition from university coursework to their first high-impact industry role.',
    badge: 'Impact',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: Clock,
    title: '100% Control Over Your Schedule',
    desc: 'Define custom weekly time slots, buffer intervals, break periods, and calendar exceptions that fit your busy work week.',
    badge: 'Flexibility',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Award,
    title: 'Verified Presence & Fair Compensation',
    desc: 'Set your own consultation fees or mentor pro-bono. Earn a verified professional badge on your public mentor profile.',
    badge: 'Recognition',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
]

// ── Curated Career Categories ────────────────────────────────────────────────
const careerCategories = [
  {
    id: 'software-dev',
    name: 'Software Development',
    icon: Code2,
    rolesCount: 8,
    desc: 'Frontend, backend, full stack, mobile app, and systems engineering.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    icon: ShieldCheck,
    rolesCount: 7,
    desc: 'SOC analysis, penetration testing, threat intelligence, and security operations.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    id: 'data-analytics',
    name: 'Data Analytics & Science',
    icon: BarChart3,
    rolesCount: 6,
    desc: 'Data analysis, business intelligence, SQL engineering, and machine learning.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    id: 'product-mgmt',
    name: 'Product Management',
    icon: Briefcase,
    rolesCount: 5,
    desc: 'Associate PM, technical product management, product ops, and feature discovery.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    id: 'cloud-devops',
    name: 'Cloud & DevOps',
    icon: Cloud,
    rolesCount: 6,
    desc: 'Infrastructure as code, CI/CD pipelines, container orchestration, and reliability.',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
  {
    id: 'uiux-design',
    name: 'UI/UX Design',
    icon: Palette,
    rolesCount: 5,
    desc: 'Product design, user research, wireframing, design systems, and usability testing.',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ── Sticky Dual-Portal Navigation Header ──────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                PathPilot
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 uppercase tracking-wider">
                AI
              </span>
            </div>
          </Link>

          {/* Distinguishable Student & Mentor Entry Points */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Login Link */}
            <Link
              href="/student/sign-in"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Student Login
            </Link>

            {/* Mentor Login Link */}
            <Link
              href="/mentor/sign-in"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors hidden md:inline-flex items-center gap-1"
            >
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Mentor Login</span>
            </Link>

            {/* Become a Mentor (Secondary Registration CTA) */}
            <Link
              href="/mentor/sign-up"
              className="hidden lg:inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-3.5 py-1.5 rounded-xl transition-all"
            >
              <span>Become a Mentor</span>
            </Link>

            {/* Get Started (Primary Student Registration CTA) */}
            <Link
              href="/student/sign-up"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 sm:px-4 py-2 rounded-xl shadow-xs transition-all hover:shadow-md"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section with Dual Portal Pathways ───────────────── */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>The Two-Sided AI Career &amp; Mentorship Marketplace</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
                Accelerate your career. <br className="hidden sm:inline" />
                <span className="text-blue-600">Guided by proven industry mentors.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                PathPilot AI pairs university students with personalized career roadmaps and 1-on-1 consultations with verified professionals from top technology companies.
              </p>

              {/* Dual Entry Action Cards / Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Student CTA */}
                <Link
                  href="/student/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Get Started as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Mentor CTA */}
                <Link
                  href="/mentor/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 font-semibold text-sm shadow-2xs transition-all"
                >
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Become a Mentor</span>
                </Link>
              </div>

              {/* Quick links to respective sign-in pages */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span>Already have an account?</span>
                <Link href="/student/sign-in" className="font-semibold text-blue-600 hover:underline">
                  Student Sign In
                </Link>
                <span className="text-slate-300">•</span>
                <Link href="/mentor/sign-in" className="font-semibold text-indigo-600 hover:underline">
                  Mentor Sign In
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>AI Resume Diagnostics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Mentor Profiles</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Google Meet &amp; Calendar Synced</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-100 group">
                <img
                  src="/images/pathpilot-career-mentoring.png"
                  alt="South Asian college students collaborating with a professional mentor in a bright, modern study environment"
                  className="w-full h-auto aspect-video lg:aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-sm flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-900">Dual-Portal Network</span>
                  </div>
                  <span className="text-slate-500 font-medium">Students &amp; Mentors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 1: How Students Benefit ───────────────────────── */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              For Students
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              How Students Benefit from PathPilot AI
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              From your initial resume audit to landing consultations with leaders in your target role, our student portal is built to give you measurable career clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {studentBenefits.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-6 sm:p-7 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/80">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <Link
                      href="/student/sign-up"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>Explore Student Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Section 2: Why Industry Professionals Should Become Mentors */}
      <section className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              For Industry Mentors
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Why Become a Mentor on PathPilot AI
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Share your real-world experience, guide the next generation of engineers and tech leaders, and manage bookings seamlessly with automated calendar sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {mentorBenefits.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-6 sm:p-7 bg-white hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/80">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <Link
                      href="/mentor/sign-up"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>Apply as a Mentor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mentor Trust Highlights */}
          <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-base font-bold text-slate-900">
                Ready to mentor on your own terms?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Profiles are reviewed by our team to maintain verified credentials and a high-trust marketplace.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                href="/mentor/sign-up"
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm text-center shadow-xs transition-all"
              >
                Become a Mentor
              </Link>
              <Link
                href="/mentor/sign-in"
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm text-center transition-all"
              >
                Mentor Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Career Explorer Categories ─────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
                Career Explorer
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Explore in-demand career areas
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Browse entry-level specializations and inspect skill prerequisites based on current hiring benchmarks.
              </p>
            </div>

            <Link
              href="/student/sign-up"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 self-start sm:self-auto"
            >
              <span>View all categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {careerCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.id}
                  href="/student/sign-up"
                  className="rounded-2xl border border-slate-200 p-5 bg-white hover:border-blue-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex flex-col justify-between group text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {cat.rolesCount} roles
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
                    <span>Explore Roles</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Dual Call To Action Banner ────────────────────────────── */}
      <section className="py-14 sm:py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Join the PathPilot AI Dual-Portal Community
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Whether you are a student discovering your path or a practitioner offering guidance, your journey starts here.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/student/sign-up"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-all"
            >
              Get Started as Student
            </Link>
            <Link
              href="/mentor/sign-up"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900 border border-indigo-400/50 text-white font-semibold text-sm transition-all"
            >
              Apply as a Mentor
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-200">PathPilot AI</span>
            <span className="text-slate-500">— Two-Sided Career &amp; Mentorship Marketplace</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/student/sign-in" className="hover:text-white transition-colors">
              Student Portal
            </Link>
            <Link href="/mentor/sign-in" className="hover:text-white transition-colors">
              Mentor Portal
            </Link>
            <span>&copy; 2026 PathPilot AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
