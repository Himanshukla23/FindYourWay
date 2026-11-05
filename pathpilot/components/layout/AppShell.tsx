'use client'

import { useState, useEffect, Suspense } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AppShellProps {
  children: React.ReactNode
  pageTitle?: string
  userName?: string
  userEmail?: string
  userAvatar?: string
  targetRole?: string | null
}

export function AppShell({
  children,
  pageTitle,
  userName = 'Student',
  userEmail = '',
  userAvatar,
  targetRole,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState({
    name: userName,
    email: userEmail,
    avatar: userAvatar,
    targetRole: targetRole || null,
  })

  useEffect(() => {
    // Sync client-side with Supabase auth
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            const fullName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              (user.email ? user.email.split('@')[0] : 'Student')
            const email = user.email || ''
            const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
            setProfile((prev) => ({
              ...prev,
              name: fullName,
              email: email,
              avatar: avatar || prev.avatar,
            }))
          }
        })
      }
    })

    // Sync target role or custom student profile from localStorage
    try {
      const storedTarget = localStorage.getItem('pathpilot_target_role')
      const storedProfile = localStorage.getItem('pathpilot_student_profile')
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile)
        const role = parsed.targetRole || parsed.profile?.targetRole || parsed.target_job_role
        if (role) {
          setProfile((prev) => ({ ...prev, targetRole: role }))
        }
      } else if (storedTarget) {
        setProfile((prev) => ({ ...prev, targetRole: storedTarget }))
      }
    } catch { }
  }, [userName, userEmail, userAvatar])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Suspense fallback={<aside className="sidebar" />}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userName={profile.name}
          userEmail={profile.email}
          userAvatar={profile.avatar}
          targetRole={profile.targetRole}
        />
      </Suspense>
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<div style={{ height: 'var(--topbar-height)', background: '#FAF9F6', borderBottom: '1px solid #E5E3DC' }} />}>
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
            pageTitle={pageTitle}
          />
        </Suspense>
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
