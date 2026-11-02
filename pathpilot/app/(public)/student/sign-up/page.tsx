'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, GraduationCap, ArrowRight, Loader2, Check } from 'lucide-react'

export default function StudentSignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  })

  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

  function validateForm() {
    if (!form.fullName.trim()) return 'Please enter your full name.'
    if (!form.email.trim()) return 'Please enter your email address.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    return null
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true)
    setError('')
    try {
      if (isDemoMode) {
        document.cookie = 'pathpilot_demo_session=true; path=/; max-age=86400'
        document.cookie = 'pathpilot_user_role=student; path=/; max-age=2592000'
        localStorage.setItem('pathpilot_user_role', 'student')
        window.location.href = '/onboarding'
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase not configured')

      const origin = window.location.origin
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback?next=/onboarding&role=student`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (oauthErr) throw oauthErr
    } catch (err: any) {
      setError(err?.message || 'Google registration failed. Please try password registration.')
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 600))
        document.cookie = 'pathpilot_demo_session=true; path=/; max-age=86400'
        document.cookie = 'pathpilot_user_role=student; path=/; max-age=2592000'
        localStorage.setItem('pathpilot_user_role', 'student')
        window.location.href = '/onboarding'
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase not configured')

      // Assign student role explicitly in metadata
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            role: 'student',
          },
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      document.cookie = 'pathpilot_user_role=student; path=/; max-age=2592000'
      localStorage.setItem('pathpilot_user_role', 'student')
      setSuccess(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: 440, margin: '0 auto' }}>
        <div
          style={{
            width: 64,
            height: 64,
            background: '#ECFDF5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '2px solid #A7F3D0',
          }}
        >
          <Check size={28} color="#059669" strokeWidth={3} />
        </div>
        <h2 style={{ color: '#0F172A', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Check your email</h2>
        <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.6 }}>
          We sent a verification link to <strong style={{ color: '#0F172A' }}>{form.email}</strong>.
          Click the link to activate your student profile.
        </p>
        <Link href="/student/sign-in" className="btn btn-primary" style={{ display: 'inline-flex', background: '#2563EB', borderColor: '#2563EB' }}>
          Back to Student Sign In
        </Link>
      </div>
    )
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
          <span>Student Registration</span>
        </div>
        <h1 style={{ color: '#0F172A', fontSize: '1.625rem', marginBottom: 4, fontWeight: 800 }}>
          Create your student account
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Explore career options, resume audits, and 1-on-1 mentor sessions
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

          {/* Full Name */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="fullName" className="label" style={{ color: '#0F172A', fontSize: '0.8125rem', fontWeight: 600 }}>
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="input"
              placeholder="e.g. Priyanshu Sharma"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              autoComplete="name"
              required
            />
          </div>

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
            <label htmlFor="password" className="label" style={{ color: '#0F172A', fontSize: '0.8125rem', fontWeight: 600 }}>
              Create Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
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
                <span>Creating student account...</span>
              </>
            ) : (
              <>
                <span>Get Started Free</span>
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

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
            <span>Sign up with Google</span>
          </button>
        </form>

        {/* Links */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.8125rem', color: '#64748B' }}>
          <span>Already have an account? </span>
          <Link href="/student/sign-in" style={{ color: '#2563EB', fontWeight: 600 }}>
            Sign in
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
          <Link href="/mentor/sign-up" style={{ color: '#4F46E5', fontWeight: 600 }}>
            Become a Mentor &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
