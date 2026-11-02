'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Briefcase, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'

export default function MentorSignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const err = params.get('error')
      if (err) {
        if (err === 'oauth_missing_code') {
          setError('Google authentication was interrupted. Please try again.')
        } else {
          setError(decodeURIComponent(err))
        }
      }
      if (params.get('notice') === 'student_blocked') {
        setError('Access denied: That area is reserved exclusively for industry mentors. Please sign in with your mentor account.')
      }
    }
  }, [])

  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError('')
    try {
      if (isDemoMode) {
        document.cookie = 'pathpilot_demo_session=true; path=/; max-age=86400'
        document.cookie = 'pathpilot_user_role=mentor; path=/; max-age=2592000'
        localStorage.setItem('pathpilot_user_role', 'mentor')
        window.location.href = '/mentor/dashboard'
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase not configured')

      const origin = window.location.origin
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback?next=/mentor/dashboard&role=mentor`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (oauthErr) throw oauthErr
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed. Please try password login.')
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!form.email || !form.password) {
      setError('Please enter your work or personal email and password.')
      return
    }

    setLoading(true)

    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 600))
        document.cookie = 'pathpilot_demo_session=true; path=/; max-age=86400'
        document.cookie = 'pathpilot_user_role=mentor; path=/; max-age=2592000'
        localStorage.setItem('pathpilot_user_role', 'mentor')
        window.location.href = '/mentor/dashboard'
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase not configured')

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      const user = signInData.user
      const role = user?.user_metadata?.role

      // Strict role verification: student accounts cannot bypass mentor authorization
      if (role === 'student') {
        setError('This account is registered as a Student. Access to the Mentor Portal requires an approved Mentor account.')
        setInfo('Redirecting you to the Student Portal...')
        document.cookie = 'pathpilot_user_role=student; path=/; max-age=2592000'
        localStorage.setItem('pathpilot_user_role', 'student')
        setTimeout(() => {
          window.location.href = '/student/dashboard'
        }, 1800)
        return
      }

      // Valid mentor login
      document.cookie = 'pathpilot_user_role=mentor; path=/; max-age=2592000'
      localStorage.setItem('pathpilot_user_role', 'mentor')

      // Check mentor approval status
      const mentorStatus = user?.user_metadata?.mentor_status || 'approved'
      if (mentorStatus === 'pending_approval') {
        window.location.href = '/mentor/profile'
      } else {
        window.location.href = '/mentor/dashboard'
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 12px rgba(79,70,229,0.25)',
          }}
        >
          <Briefcase size={24} color="white" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
          <span>Mentor Portal</span>
        </div>
        <h1 style={{ color: '#0F172A', fontSize: '1.625rem', marginBottom: 4, fontWeight: 800 }}>
          Mentor Sign In
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Manage your availability schedule, student consultations &amp; bookings
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          padding: 32,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 20,
          boxShadow: '0 1px 3px rgba(60,64,67,0.12), 0 4px 8px rgba(60,64,67,0.06)',
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          {/* Info banner */}
          {info && (
            <div
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#1D4ED8',
                fontSize: '0.8125rem',
                marginBottom: 18,
                fontWeight: 500,
              }}
            >
              {info}
            </div>
          )}

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
            <label htmlFor="email" className="label" style={{ color: '#0F172A', fontSize: '0.8125rem', fontWeight: 600 }}>
              Work or Personal Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="mentor@company.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label htmlFor="password" className="label" style={{ color: '#0F172A', fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
                required
                style={{ paddingRight: 40 }}
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
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginBottom: 16, background: '#4F46E5', borderColor: '#4F46E5' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating mentor...</span>
              </>
            ) : (
              <>
                <span>Sign in to Mentor Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="btn btn-outline btn-full"
            style={{ borderColor: '#CBD5E1', color: '#1E293B', fontWeight: 600 }}
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.039l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          {/* Quick Demo Launch */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
            <button
              type="button"
              onClick={() => {
                document.cookie = 'pathpilot_demo_session=true; path=/; max-age=86400'
                document.cookie = 'pathpilot_user_role=mentor; path=/; max-age=2592000'
                localStorage.setItem('pathpilot_user_role', 'mentor')
                window.location.href = '/mentor/onboarding'
              }}
              className="btn btn-outline btn-full"
              style={{
                borderColor: '#E0E7FF',
                background: '#EEF2FF',
                color: '#4338CA',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Briefcase size={15} className="text-indigo-600" />
              <span>Launch Mentor Onboarding Wizard</span>
            </button>
          </div>
        </form>

        {/* Links */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.8125rem', color: '#64748B' }}>
          <span>Want to join as an industry mentor? </span>
          <Link href="/mentor/sign-up" style={{ color: '#4F46E5', fontWeight: 600 }}>
            Apply to become a mentor
          </Link>
        </div>

        {/* Portal Switcher Footnote */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid #F1F5F9',
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: '#64748B',
          }}
        >
          <span>Looking for student guidance? </span>
          <Link href="/student/sign-in" style={{ color: '#2563EB', fontWeight: 600 }}>
            Student Portal &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
