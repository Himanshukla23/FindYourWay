/**
 * Utility to completely wipe client-side session state, demo caches,
 * drafts, and cookies across portal transitions, sign-outs, and new account logins.
 */
export function clearClientSessionData() {
  if (typeof window === 'undefined') return
  try {
    // 1. Clear all localStorage keys starting with pathpilot_ or sb- or supabase.
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (k.startsWith('pathpilot_') || k.startsWith('sb-') || k.startsWith('supabase.'))) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))

    // 2. Clear sessionStorage completely
    try {
      sessionStorage.clear()
    } catch {}

    // 3. Clear all pathpilot and auth cookies client-side across root path
    const cookiesToClear = [
      'pathpilot_demo_session',
      'pathpilot_user_role',
      'pathpilot_user_bookings',
      'pathpilot_mentor_profile',
      'pathpilot_mentor_availability',
      'pathpilot_mentor_draft',
      'pathpilot_student_profile',
      'pathpilot_onboarded',
      'pathpilot_onboarding_completed',
      'pathpilot_onboarding_draft',
    ]

    // Also scan all document cookies to catch chunked auth cookies
    const docCookies = document.cookie.split(';')
    for (const c of docCookies) {
      const name = c.split('=')[0].trim()
      if (name.startsWith('pathpilot_') || name.startsWith('sb-')) {
        cookiesToClear.push(name)
      }
    }

    const uniqueCookies = Array.from(new Set(cookiesToClear))
    uniqueCookies.forEach((name) => {
      document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      if (window.location.hostname) {
        document.cookie = `${name}=; path=/; domain=${window.location.hostname}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      }
    })
  } catch (err) {
    console.error('Failed to clear client session data:', err)
  }
}
