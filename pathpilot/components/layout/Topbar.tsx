'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, Bell, Briefcase, Users, Sparkles } from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
  pageTitle?: string
}

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Student Dashboard',
  '/jobs': '143+ Indian Tech & Fresher Roles',
  '/careers': 'Career Explorer & Tracks',
  '/roadmap': 'Preparation Roadmap & Milestones',
  '/resume': 'AI Resume Audit & Fit Diagnostic',
  '/mentors': 'Verified Industry Mentors',
  '/consultations': 'My 1-on-1 Sessions',
  '/profile': 'Student Profile & Telemetry',
  '/onboarding': 'Candidate Onboarding',
}

export function Topbar({ onMenuClick, pageTitle }: TopbarProps) {
  const pathname = usePathname()

  // Dynamically resolve title if not explicitly passed
  const resolvedTitle = pageTitle || ROUTE_TITLES[pathname] || ''

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        background: 'rgba(250, 249, 246, 0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E5E3DC',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        className="btn btn-ghost btn-icon"
        style={{ display: 'none' }}
        id="mobile-menu-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title with Monospace Eyebrow */}
      {resolvedTitle && (
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="hidden sm:inline font-tech-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0">
            // CONSOLE
          </span>
          <span className="hidden sm:inline text-neutral-300">/</span>
          <h1 className="font-display text-base sm:text-lg tracking-tight text-[#0C0D0E] uppercase truncate m-0">
            {resolvedTitle}
          </h1>
        </div>
      )}
      {!resolvedTitle && <div style={{ flex: 1 }} />}

      {/* Quick Access Action Pills (Koyeb Style) */}
      <div className="hidden md:flex items-center gap-2.5">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-tech-mono font-bold bg-[#0C0D0E] text-[#00F090] border border-black/10 hover:bg-black transition-all"
        >
          <Briefcase size={12} className="text-[#00F090]" />
          <span>143+ JOBS</span>
        </Link>
        <Link
          href="/mentors"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-tech-mono font-semibold bg-white text-neutral-800 border border-[#E5E3DC] hover:bg-[#FAF9F6] transition-all"
        >
          <Users size={12} className="text-neutral-500" />
          <span>MENTORS</span>
        </Link>
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00F090]/10 border border-[#00F090]/30 text-[#064E3B] font-tech-mono text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F090] animate-pulse" />
          <span>SYSTEM READY</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="p-2 rounded-lg hover:bg-[#EFECE6] text-neutral-500 hover:text-black transition-colors"
          aria-label="Notifications"
          title="Notifications & Updates"
          style={{ position: 'relative' }}
        >
          <Bell size={17} />
          <span
            style={{
              position: 'absolute',
              top: 7,
              right: 7,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#00F090',
            }}
          />
        </button>
      </div>

      {/* Mobile: show hamburger via CSS */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
