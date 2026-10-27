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
  Megaphone,
  TrendingUp,
} from 'lucide-react'

// ── Three Core Benefits ──────────────────────────────────────────────────────
const coreBenefits = [
  {
    icon: FileText,
    title: 'Resume Analysis',
    desc: 'Understand your existing skills, strengths, and experience with automated entity extraction and actionable feedback.',
    badge: 'Step 1: Discover',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Compass,
    title: 'Career Explorer',
    desc: 'Compare relevant entry-level job roles and their real-world requirements across 8+ specialized tech domains.',
    badge: 'Step 2: Compare',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    icon: Users,
    title: 'Industry Mentors',
    desc: 'Discover and book 1-on-1 consultations with verified industry professionals who can guide your next step.',
    badge: 'Step 3: Connect',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
]

// ── 3-Step Guided Workflow ───────────────────────────────────────────────────
const workflowSteps = [
  {
    step: '01',
    title: 'Upload Your Resume',
    desc: 'Start by uploading your PDF or DOCX resume. We automatically extract your skills, education, and projects so you can skip tedious profile forms.',
  },
  {
    step: '02',
    title: 'Explore Tailored Career Options',
    desc: 'View roles that match your actual background and learn what each role requires — including day-in-the-life summaries and salary benchmarks.',
  },
  {
    step: '03',
    title: 'Consult with Industry Mentors',
    desc: 'Book one-to-one sessions with practitioners from leading companies for resume teardowns, interview prep, and career strategy.',
  },
]

// ── Curated Career Categories with Professional Lucide Icons ─────────────────
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
    desc: 'Product design, user research, wireframing, Figma systems, and usability testing.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    icon: Megaphone,
    rolesCount: 6,
    desc: 'Growth marketing, search optimization, technical content, and funnel analysis.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    id: 'business-analysis',
    name: 'Business Analysis',
    icon: TrendingUp,
    rolesCount: 5,
    desc: 'Requirements engineering, process optimization, stakeholder mapping, and metrics.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col font-sans">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                PathPilot
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700 uppercase tracking-wider">
                AI
              </span>
            </div>
          </Link>

          {/* Navigation CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-xs transition-all hover:shadow-md"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI-powered career guidance for college students</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
                Find the career path that&apos;s right for you.
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Discover career options based on your skills and interests, improve your resume, and connect with professionals who can help you take the next step.
              </p>

              {/* Call-to-action buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 hover:bg-slate-50 font-semibold text-sm shadow-2xs transition-all"
                >
                  Sign In
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resume-first personalization</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified industry mentors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free to explore</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-100 group">
                <img
                  src="/images/pathpilot-career-mentoring.png"
                  alt="South Asian college students collaborating with a professional mentor in a bright, modern study environment"
                  className="w-full h-auto aspect-video lg:aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/90 backdrop-blur-md rounded-xl border border-white/40 shadow-xs flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">1-on-1 Guidance</div>
                    <div className="text-[11px] text-slate-500">Live advice from engineers &amp; PMs</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Active Network
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three Core Benefits ────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Three pillars for career readiness
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              A structured platform that translates your college coursework into marketable industry skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {coreBenefits.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-6 sm:p-7 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl ${item.bg} ${item.color} flex items-center justify-center border ${item.border}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>Explore this feature</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Clear 3-Step Workflow ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Your journey from resume to career clarity
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              No complex forms. No guesswork. Three straightforward steps designed for busy students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {workflowSteps.map((step) => (
              <div
                key={step.step}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-start relative group hover:border-blue-300 transition-all"
              >
                <div className="text-3xl font-extrabold text-blue-600/30 group-hover:text-blue-600/60 transition-colors mb-3">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
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
              href="/sign-up"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 self-start sm:self-auto"
            >
              <span>View all categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Consistent responsive grid with Lucide icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {careerCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.id}
                  href="/sign-up"
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

      {/* ── Call To Action Banner ─────────────────────────────────── */}
      <section className="py-14 sm:py-16 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Ready to find the career that fits your skills?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Upload your resume, see your recommended job matches, and connect with experienced mentors today.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-800/60 hover:bg-blue-800 border border-blue-400/40 text-white font-semibold text-sm transition-all"
            >
              Sign In to Your Account
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
            <span className="text-slate-500">— Career guidance for college students</span>
          </div>

          <div className="text-slate-500 text-center sm:text-right">
            &copy; 2026 PathPilot AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
