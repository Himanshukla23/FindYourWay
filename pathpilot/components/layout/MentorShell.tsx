'use client'

import { useState, useEffect } from 'react'
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
    <div className="app-layout" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <MentorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mentorName={profile.name}
        mentorEmail={profile.email}
        mentorTitle={profile.title}
        isApproved={profile.isApproved}
      />

      <div className="main-content">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle="Mentor Portal"
        />

        <main className="content-area" style={{ padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
