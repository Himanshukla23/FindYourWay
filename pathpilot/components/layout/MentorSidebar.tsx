'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  Clock,
  Calendar,
  Settings,
  X,
  LogOut,
  Sparkles,
  Globe,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { clearClientSessionData } from '@/lib/auth-session'

const mentorNavItems = [
  { href: '/mentor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mentor/profile', label: 'My Profile', icon: User },
  { href: '/mentor/availability', label: 'Availability', icon: Clock },
  { href: '/mentor/bookings', label: 'Bookings', icon: Calendar },
  { href: '/mentor/settings', label: 'Settings', icon: Settings },
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
      await fetch('/api/auth/signout', { method: 'POST' }).catch(() => { })
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (supabase) await supabase.auth.signOut().catch(() => { })
    } catch (e) {
      console.error('Error signing out:', e)
    } finally {
      clearClientSessionData()
      window.location.href = '/'
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

      {/* Sidebar */}
      <aside className={cn('sidebar', isOpen && 'open')} aria-label="Mentor portal navigation">
        {/* Header / Brand */}
        <div
          style={{
            padding: '20px 18px 16px',
            borderBottom: '1px solid #E5E3DC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/mentor/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div className="w-8 h-8 rounded-lg bg-[#0C0D0E] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-[#00F090]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-xl tracking-tighter text-[#0C0D0E]">
                PATHPILOT
              </span>
              <span className="font-tech-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00F090] text-black uppercase tracking-wider">
                MENTOR
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon md:hidden text-neutral-500 hover:text-black"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Verification Status Pill (Koyeb Dark Card) */}
        <div style={{ padding: '12px 14px 6px' }}>
          <div className="rounded-lg bg-[#0C0D0E] border border-neutral-800 p-3 shadow-xs font-tech-mono">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-[#00F090] font-bold tracking-wider">// STATUS</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-[#00F090] animate-pulse' : 'bg-amber-400'}`} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase truncate">
                {isApproved ? 'VERIFIED MENTOR' : 'REVIEW PENDING'}
              </span>
              <Link href="/mentor/profile" className="text-[10px] text-[#00F090] hover:underline font-bold">
                VIEW →
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '10px 0', flex: 1 }}>
          <div className="flex flex-col gap-1">
            {mentorNavItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn('nav-item', active && 'active')}
                >
                  <Icon size={16} className={active ? 'text-[#00F090]' : 'text-neutral-500'} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {active && <span className="font-tech-mono text-[10px] text-[#00F090] font-bold">◂</span>}
                </Link>
              )
            })}

            {/* Platform links */}
            <div style={{ margin: '12px 14px 4px', paddingTop: 10, borderTop: '1px solid #E5E3DC' }}>
              <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-2">
                // PLATFORM
              </span>
            </div>

            <Link
              href="/"
              onClick={onClose}
              className="nav-item"
            >
              <Globe size={16} className="text-neutral-500" />
              <span>Landing Page</span>
            </Link>
          </div>
        </nav>

        {/* User Info Footer */}
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
          {mentorAvatar ? (
            <img
              src={mentorAvatar}
              alt={mentorName}
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
              {getInitials(mentorName)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#0C0D0E', fontWeight: 700, fontSize: '0.8125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {mentorName}
            </div>
            <div className="font-tech-mono text-[10px] text-neutral-500 truncate mt-0.5">
              {mentorTitle}
            </div>
          </div>

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
