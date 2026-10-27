'use client'

import { Menu, Bell } from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
  pageTitle?: string
}

export function Topbar({ onMenuClick, pageTitle }: TopbarProps) {
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

      {/* Page title */}
      {pageTitle && (
        <h1
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--navy)',
            margin: 0,
            flex: 1,
          }}
        >
          {pageTitle}
        </h1>
      )}
      {!pageTitle && <div style={{ flex: 1 }} />}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="btn btn-ghost btn-icon"
          aria-label="Notifications (coming soon)"
          title="Notifications — coming soon"
          style={{ position: 'relative', color: 'var(--text-muted)' }}
        >
          <Bell size={18} />
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
