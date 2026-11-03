'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Compass,
  Map,
  Users,
  Calendar,
  Briefcase,
  User,
  Zap,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/jobs',          label: 'Job Board',       icon: Briefcase },
  { href: '/resume',        label: 'Resume Analysis', icon: FileText },
  { href: '/careers',       label: 'Explore Careers', icon: Compass },
  { href: '/roadmap',       label: 'Career Roadmap',  icon: Map },
  { href: '/mentors',       label: 'Find Mentors',    icon: Users },
  { href: '/consultations', label: 'My Sessions',     icon: Calendar },
  { href: '/profile',       label: 'My Profile',      icon: User },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  userEmail?: string
  userAvatar?: string
  targetRole?: string | null
}

export function Sidebar({
  isOpen,
  onClose,
  userName = 'Student',
  userEmail = '',
  userAvatar,
  targetRole,
}: SidebarProps) {
  const pathname = usePathname()

  async function handleSignOut() {
    try {
      // 1. Trigger server-side cookie deletion
      await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {})

      // 2. Clear client Supabase session if present
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (supabase) {
        await supabase.auth.signOut().catch(() => {})
      }
    } catch (e) {
      console.error('Error signing out:', e)
    } finally {
      // 3. Clear client-side demo cookies and storage
      document.cookie = 'pathpilot_demo_session=; path=/; max-age=0'
      document.cookie = 'pathpilot_onboarded=; path=/; max-age=0'
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pathpilot_demo_session')
        localStorage.removeItem('pathpilot_onboarding_draft')
      }
      window.location.href = '/sign-in'
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={cn('sidebar', isOpen && 'open')} aria-label="Main navigation">
        {/* Logo */}
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(26,115,232,0.25)',
              }}
            >
              <Zap size={18} color="white" fill="white" />
            </div>
            <div>
              <div style={{ color: '#0F172A', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                PathPilot
              </div>
              <div style={{ color: '#1A73E8', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                AI GUIDANCE
              </div>
            </div>
          </Link>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon md:hidden"
            style={{ color: '#64748B' }}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Target role pill */}
        {targetRole && (
          <div style={{ padding: '12px 16px' }}>
            <div
              style={{
                background: '#E8F0FE',
                border: '1px solid #D2E3FC',
                borderRadius: 10,
                padding: '8px 12px',
              }}
            >
              <div style={{ color: '#1A73E8', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>
                TARGET ROLE
              </div>
              <div style={{ color: '#0F172A', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>
                {targetRole}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href)) ||
              (href === '/dashboard' && pathname === '/student/dashboard') ||
              (href === '/resume' && pathname.startsWith('/student/resume')) ||
              (href === '/careers' && pathname.startsWith('/student/career')) ||
              (href === '/mentors' && pathname.startsWith('/student/mentor')) ||
              (href === '/consultations' && pathname.startsWith('/student/booking')) ||
              (href === '/profile' && pathname.startsWith('/student/profile'))
            return (
              <Link
                key={href}
                href={href}
                className={cn('nav-item', isActive && 'active')}
                onClick={onClose}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
              </Link>
            )
          })}
        </nav>

        {/* User info at bottom */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                border: '1.5px solid #D2E3FC',
              }}
            />
          ) : (
            <div className="avatar avatar-md" style={{ flexShrink: 0, background: '#E8F0FE', color: '#1A73E8', fontWeight: 700 }}>
              {getInitials(userName)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
            {userEmail && (
              <div style={{ color: '#64748B', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userEmail}
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            title="Sign out / Switch account"
            aria-label="Sign out"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: 8,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#DC2626'
              e.currentTarget.style.background = '#FEE2E2'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#94A3B8'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  )
}
