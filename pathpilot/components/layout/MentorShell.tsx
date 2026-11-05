'use client'

import { useState, useEffect, Suspense } from 'react'
import { MentorSidebar } from './MentorSidebar'
import { Topbar } from './Topbar'

interface MentorShellProps {
  children: React.ReactNode
  pageTitle?: string
}

export function MentorShell({ children, pageTitle }: MentorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Industry Mentor',
    email: '',
    title: 'Senior Software Practitioner',
    isApproved: true,
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
              (user.email ? user.email.split('@')[0] : 'Industry Mentor')
            const title = user.user_metadata?.initial_job_title || 'Software Practitioner'
            const company = user.user_metadata?.initial_company ? ` at ${user.user_metadata.initial_company}` : ''
            const status = user.user_metadata?.mentor_status || 'approved'
            setProfile({
              name: fullName,
              email: user.email || '',
              title: `${title}${company}`,
              isApproved: status === 'approved',
            })
          }
        })
      }
    })
  }, [])

  return (
    <div className="app-layout" style={{ background: '#FAF9F6', minHeight: '100vh' }}>
      <Suspense fallback={<aside className="sidebar" />}>
        <MentorSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          mentorName={profile.name}
          mentorEmail={profile.email}
          mentorTitle={profile.title}
          isApproved={profile.isApproved}
        />
      </Suspense>

      <div className="main-content">
        <Suspense fallback={<div style={{ height: 'var(--topbar-height)', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }} />}>
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
            pageTitle={pageTitle || "Mentor Portal"}
            isMentor={true}
          />
        </Suspense>

        <main className="content-area" style={{ padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
