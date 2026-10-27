'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react'

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    // Check if redirected back with error query parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const err = params.get('error')
      if (err) {
        if (err === 'oauth_missing_code') {
          setError('Google authentication was interrupted. Please click "Sign in with Google" below.')
        } else {
          setError(decodeURIComponent(err))
        }
      }

      // If switching accounts or logging out, clear previous session
      if (params.get('switch') === 'true') {
        import('@/lib/supabase/client').then(({ createClient }) => {
          const supabase = createClient()
          if (supabase) supabase.auth.signOut().catch(() => {})
        })
        document.cookie = 'pathpilot_demo_session=; path=/; max-age=0'
      }

      // Check if redirected with hash tokens (#access_token=...)
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        const hashParams = new URLSearchParams(hash.substring(1))
        const access_token = hashParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token')
        if (access_token) {
          import('@/lib/supabase/client').then(({ createClient }) => {
            const supabase = createClient()
            if (supabase) {
              supabase.auth.setSession({
                access_token,
                refresh_token: refresh_token || '',
              }).then(async ({ error: sessErr }) => {
                if (!sessErr) {
                  document.cookie = 'pathpilot_demo_session=; path=/; max-age=0'
                  const { data: { user } } = await supabase.auth.getUser()
                  const isCompleted = user?.user_metadata?.onboarding_completed === true ||
                    document.cookie.includes('pathpilot_onboarded=true') ||
                    localStorage.getItem('pathpilot_onboarding_completed') === 'true'
                  window.location.href = isCompleted ? '/dashboard' : '/onboarding'
                }
              })
            }
          })
        }
      }
    }
  }, [])

  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      if (isDemoMode) {
        // Demo mode: simulate a successful sign-in
        await new Promise((r) => setTimeout(r, 1000))
        const isCompleted = document.cookie.includes('pathpilot_onboarded=true') ||
          localStorage.getItem('pathpilot_onboarding_completed') === 'true'
        window.location.href = isCompleted ? '/dashboard' : '/onboarding'
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase not configured')

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      const isCompleted = user?.user_metadata?.onboarding_completed === true ||
        document.cookie.includes('pathpilot_onboarded=true') ||
        localStorage.getItem('pathpilot_onboarding_completed') === 'true'
      window.location.href = isCompleted ? '/dashboard' : '/onboarding'
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 12px rgba(26,115,232,0.25)',
          }}
        >
          <Zap size={24} color="white" fill="white" />
        </div>
        <h1 style={{ color: '#1F1F1F', fontSize: '1.625rem', marginBottom: 4, fontWeight: 800 }}>
          Welcome back
        </h1>
        <p style={{ color: '#444746', fontSize: '0.875rem' }}>
          Sign in to PathPilot AI career guidance
        </p>
      </div>

      {/* Card */}
      <div
        className="card"
        style={{ 
          padding: 32, 
          background: '#FFFFFF', 
          border: '1px solid #E2E8F0', 
          borderRadius: 20, 
          boxShadow: '0 1px 3px rgba(60,64,67,0.12), 0 4px 8px rgba(60,64,67,0.06)' 
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          {/* Error */}
          {error && (
            <div
              style={{
                background: '#FCE8E6',
                border: '1px solid #FAD2CF',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#C5221F',
                fontSize: '0.8125rem',
                marginBottom: 18,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" className="label" style={{ color: '#1F1F1F', fontSize: '0.8125rem', fontWeight: 600 }}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@college.edu"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label htmlFor="password" className="label" style={{ color: '#1F1F1F', fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>
                Password
              </label>
              <Link
                href="#"
                style={{ fontSize: '0.8125rem', color: '#1A73E8', fontWeight: 500 }}
                onClick={(e) => { e.preventDefault(); alert('Password reset coming soon.') }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#5F6368',
                  padding: 4,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              background: '#1A73E8', 
              borderRadius: 9999, 
              padding: '12px 20px',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Google Sign In & Divider */}
        <div style={{ margin: '18px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
        </div>

        <button
          type="button"
          disabled={googleLoading}
          onClick={async () => {
            try {
              setGoogleLoading(true)
              setError('')
              document.cookie = 'pathpilot_demo_session=; path=/; max-age=0'

              const { createClient } = await import('@/lib/supabase/client')
              const supabase = createClient()
              if (!supabase) {
                // Direct fallback
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gmoeqwelvndvbmdqupdl.supabase.co'
                const redirectUri = `${window.location.origin}/api/auth/callback`
                window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`
                return
              }

              const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/api/auth/callback`,
                },
              })

              if (oauthError) {
                setError(oauthError.message)
                setGoogleLoading(false)
              }
            } catch (err: any) {
              console.error('Google Sign In error:', err)
              setError(err?.message || 'Failed to start Google sign-in')
              setGoogleLoading(false)
            }
          }}
          style={{
            width: '100%',
            padding: '11px 16px',
            borderRadius: 9999,
            background: '#FFFFFF',
            border: '1px solid #DADCE0',
            color: '#3C4043',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: googleLoading ? 'wait' : 'pointer',
            opacity: googleLoading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'background 150ms ease, box-shadow 150ms ease',
            boxShadow: '0 1px 2px rgba(60,64,67,0.08)'
          }}
          onMouseOver={(e) => { if (!googleLoading) e.currentTarget.style.background = '#F8F9FA' }}
          onMouseOut={(e) => { if (!googleLoading) e.currentTarget.style.background = '#FFFFFF' }}
        >
          {googleLoading ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: '#1A73E8' }} /> Connecting to Google…</>
          ) : (
            <>
              <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* Explicit Demo Account Action */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
          <button
            type="button"
            onClick={() => {
              document.cookie = 'pathpilot_demo_session=true; path=/; max-age=86400'
              const isOnboarded = localStorage.getItem('pathpilot_onboarding_completed') === 'true'
              window.location.href = isOnboarded ? '/dashboard' : '/onboarding'
            }}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 9999,
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 150ms ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#E2E8F0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#F1F5F9')}
          >
            <Zap size={15} className="text-amber-500 fill-amber-500" />
            <span>Continue with Demo Account</span>
          </button>
        </div>

        {/* Sign up link */}
        <p style={{ textAlign: 'center', marginTop: 18, color: '#5F6368', fontSize: '0.8125rem' }}>
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" style={{ color: '#1A73E8', fontWeight: 600 }}>
            Create one free
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
