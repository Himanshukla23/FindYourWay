'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, Bell, Sparkles, Compass, Briefcase, Users, FileText, Map } from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
  pageTitle?: string
}

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Student Dashboard',
  '/jobs': 'Tech & APM Launchpad (Verified)',
  '/careers': 'Career Explorer & Tracks',
  '/roadmap': 'Career Roadmap & Milestones',
  '/resume': 'AI Resume Audit & Fit Diagnostic',
  '/mentors': 'Find Industry Mentors',
  '/consultations': 'My Mentorship Sessions',
  '/profile': 'My Student Profile',
  '/onboarding': 'Student Onboarding',
}

export function Topbar({ onMenuClick, pageTitle }: TopbarProps) {
  const pathname = usePathname()

  // Dynamically resolve title if not explicitly passed
  const resolvedTitle = pageTitle || ROUTE_TITLES[pathname] || ''

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
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

      {/* Page title / breadcrumb */}
      {resolvedTitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <h1
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--navy)',
              margin: 0,
            }}
          >
            {resolvedTitle}
          </h1>
        </div>
      )}
      {!resolvedTitle && <div style={{ flex: 1 }} />}

      {/* Quick Access Action Pills (Desktop) */}
      <div className="hidden lg:flex items-center gap-2">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all"
        >
          <Briefcase size={13} className="text-emerald-600" />
          <span>140+ Jobs</span>
        </Link>
        <Link
          href="/mentors"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-all"
        >
          <Users size={13} className="text-blue-600" />
          <span>Mentors</span>
        </Link>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="btn btn-ghost btn-icon"
          aria-label="Notifications"
          title="Notifications & Updates"
          style={{ position: 'relative', color: 'var(--text-muted)' }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#10B981',
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
