import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in browser (client components).
 * Uses NEXT_PUBLIC_ env vars which are safe to expose to the browser.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Demo mode: return a mock-compatible null. Pages handle this gracefully.
    console.warn(
      '[PathPilot] Supabase env vars not set. Running in demo mode — auth and DB are disabled.'
    )
    return null
  }

  return createBrowserClient(url, key)
}
