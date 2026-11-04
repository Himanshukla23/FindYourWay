'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, GraduationCap, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react'

export default function StudentSignInPage() {
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
      if (params.get('notice') === 'mentor_redirected') {
        setInfo('You attempted to access student routes with a mentor account. Redirecting...')
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
        document.cookie = 'pathpilot_user_role=student; path=/; max-age=2592000'
        localStorage.setItem('pathpilot_user_role', 'student')
        window.location.href = '/student/dashboard'
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase not configured')

      const origin = window.location.origin
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback?next=/student/dashboard&role=student`,
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
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 600))
        document.cookie = 'pathpilot_demo_session=true; path=/; max-age=86400'
        document.cookie = 'pathpilot_user_role=student; path=/; max-age=2592000'
        localStorage.setItem('pathpilot_user_role', 'student')
        const isCompleted = document.cookie.includes('pathpilot_onboarded=true') ||
          localStorage.getItem('pathpilot_onboarding_completed') === 'true'
        window.location.href = isCompleted ? '/student/dashboard' : '/onboarding'
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
      const role = user?.user_metadata?.role || 'student'

      // Check if user is actually a mentor trying to sign in at student portal
      if (role === 'mentor') {
        setInfo('Your account is registered as an Industry Mentor. Directing you to the Mentor Portal...')
        document.cookie = 'pathpilot_user_role=mentor; path=/; max-age=2592000'
        localStorage.setItem('pathpilot_user_role', 'mentor')
        setTimeout(() => {
          window.location.href = '/mentor/dashboard'
        }, 1200)
        return
      }

      // Valid student login
      document.cookie = 'pathpilot_user_role=student; path=/; max-age=2592000'
      localStorage.setItem('pathpilot_user_role', 'student')

      const isCompleted = user?.user_metadata?.onboarding_completed === true ||
        document.cookie.includes('pathpilot_onboarded=true') ||
        localStorage.getItem('pathpilot_onboarding_completed') === 'true'
      window.location.href = isCompleted ? '/student/dashboard' : '/onboarding'
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
            background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
          }}
        >
          <GraduationCap size={24} color="white" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          <span>Student Portal</span>
        </div>
        <h1 style={{ color: '#0F172A', fontSize: '1.625rem', marginBottom: 4, fontWeight: 800 }}>
          Welcome back, Student
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Sign in to access your career roadmaps &amp; mentor bookings
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
          {/* Info notice */}
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
              College or Personal Email
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
            style={{ marginBottom: 16, background: '#2563EB', borderColor: '#2563EB' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in to Student Portal</span>
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
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Links */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.8125rem', color: '#64748B' }}>
          <span>Don&apos;t have a student account? </span>
          <Link href="/student/sign-up" style={{ color: '#2563EB', fontWeight: 600 }}>
            Create one free
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
          <span>Are you an industry professional? </span>
          <Link href="/mentor/sign-in" style={{ color: '#4F46E5', fontWeight: 600 }}>
            Mentor Login →
          </Link>
        </div>
      </div>
    </div>
  )
}
