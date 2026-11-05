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
  Sparkles,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { clearClientSessionData } from '@/lib/auth-session'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Job Board (143+)', icon: Briefcase },
  { href: '/resume', label: 'Resume Audit', icon: FileText },
  { href: '/careers', label: 'Career Tracks', icon: Compass },
  { href: '/roadmap', label: 'Preparation Map', icon: Map },
  { href: '/mentors', label: 'Find Mentors', icon: Users },
  { href: '/consultations', label: 'My Sessions', icon: Calendar },
  { href: '/profile', label: 'My Profile', icon: User },
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
      await fetch('/api/auth/signout', { method: 'POST' }).catch(() => { })
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (supabase) {
        await supabase.auth.signOut().catch(() => { })
      }
    } catch (e) {
      console.error('Error signing out:', e)
    } finally {
      clearClientSessionData()
      window.location.href = '/sign-in'
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with Koyeb Design */}
      <aside className={cn('sidebar', isOpen && 'open')} aria-label="Main navigation">
        {/* Logo Header */}
        <div
          style={{
            padding: '20px 18px 16px',
            borderBottom: '1px solid #E5E3DC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div className="w-8 h-8 rounded-lg bg-[#0C0D0E] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-[#00F090]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-xl tracking-tighter text-[#0C0D0E]">
                PATHPILOT
              </span>
              <span className="font-tech-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-black text-[#00F090] uppercase tracking-wider">
                v2.4
              </span>
            </div>
          </Link>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon md:hidden text-neutral-500 hover:text-black"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Target role box (Koyeb Dark Developer Pill) */}
        {targetRole && (
          <div style={{ padding: '12px 14px 6px' }}>
            <div className="rounded-lg bg-[#0C0D0E] border border-neutral-800 p-3 shadow-xs font-tech-mono">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-[#00F090] font-bold tracking-wider">// TARGET ROLE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F090] animate-pulse" />
              </div>
              <div className="text-xs font-bold text-white uppercase tracking-tight truncate">
                {targetRole}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
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
                <Icon size={16} className={isActive ? 'text-[#00F090]' : 'text-neutral-500'} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive ? (
                  <span className="font-tech-mono text-[10px] text-[#00F090] font-bold">◂</span>
                ) : (
                  <ChevronRight size={12} className="opacity-40" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info at bottom */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid #E5E3DC',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: '#FAF9F6',
          }}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              style={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                objectFit: 'cover',
                flexShrink: 0,
                border: '1.5px solid #0C0D0E',
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#0C0D0E] text-[#00F090] font-display flex items-center justify-center text-xs font-black shrink-0">
              {getInitials(userName)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#0C0D0E', fontWeight: 700, fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
            {userEmail && (
              <div className="font-tech-mono text-[10px] text-neutral-500 truncate mt-0.5">
                {userEmail}
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 rounded-md hover:bg-neutral-200 text-neutral-400 hover:text-black transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
    </>
  )
}
