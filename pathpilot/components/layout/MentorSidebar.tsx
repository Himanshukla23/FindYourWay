'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  Clock,
  Calendar,
  Settings,
  Briefcase,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

const mentorNavItems = [
  { href: '/mentor/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/mentor/profile',      label: 'My Profile',   icon: User },
  { href: '/mentor/availability', label: 'Availability', icon: Clock },
  { href: '/mentor/bookings',     label: 'Bookings',     icon: Calendar },
  { href: '/mentor/settings',     label: 'Settings',     icon: Settings },
]

interface MentorSidebarProps {
  isOpen: boolean
  onClose: () => void
  mentorName?: string
  mentorEmail?: string
  mentorTitle?: string
  mentorAvatar?: string
  isApproved?: boolean
}

export function MentorSidebar({
  isOpen,
  onClose,
  mentorName = 'Industry Mentor',
  mentorEmail = '',
  mentorTitle = 'Software Engineer',
  mentorAvatar,
  isApproved = true,
}: MentorSidebarProps) {
  const pathname = usePathname()

  async function handleSignOut() {
    try {
      await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {})
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (supabase) await supabase.auth.signOut().catch(() => {})
    } catch (e) {
      console.error('Error signing out:', e)
    } finally {
      document.cookie = 'pathpilot_demo_session=; path=/; max-age=0'
      document.cookie = 'pathpilot_user_role=; path=/; max-age=0'
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pathpilot_user_role')
      }
      window.location.href = '/'
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
      <aside className={cn('sidebar', isOpen && 'open')} aria-label="Mentor portal navigation">
        {/* Header / Brand */}
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/mentor/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Briefcase size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                  PathPilot
                </span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    letterSpacing: '0.05em',
                  }}
                >
                  MENTOR
                </span>
              </div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="md:hidden"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: 4,
            }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Verification Status Pill */}
        <div style={{ padding: '12px 16px 8px' }}>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              background: isApproved ? '#F0FDF4' : '#FFFBEB',
              border: `1px solid ${isApproved ? '#BBF7D0' : '#FDE68A'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isApproved ? '#16A34A' : '#D97706',
                }}
              />
              <span style={{ fontWeight: 700, color: isApproved ? '#166534' : '#92400E' }}>
                {isApproved ? 'Verified Mentor' : 'Review Pending'}
              </span>
            </div>
            <Link
              href="/mentor/profile"
              style={{
                fontSize: '0.6875rem',
                color: isApproved ? '#15803D' : '#B45309',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Status &rarr;
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '8px 12px', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {mentorNavItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#4F46E5' : '#475569',
                    background: active ? '#EEF2FF' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={18} color={active ? '#4F46E5' : '#64748B'} />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Card & Sign Out */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: '#4F46E5',
                  flexShrink: 0,
                }}
              >
                {getInitials(mentorName)}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mentorName}
                </p>
                <p
                  style={{
                    fontSize: '0.6875rem',
                    color: '#64748B',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mentorTitle}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                padding: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
