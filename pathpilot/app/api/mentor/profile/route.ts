import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If Supabase is configured, fetch authenticated mentor's profile
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      })

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('mentor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profile) {
          return NextResponse.json({
            success: true,
            profile,
            isDemo: false,
          })
        }

        // If authenticated but no DB row exists yet, synthesize directly from registered user metadata
        const meta = user.user_metadata || {}
        const synthesizedProfile = {
          id: user.id,
          user_id: user.id,
          full_name: meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : 'Mentor'),
          email: user.email,
          title: meta.initial_job_title || 'Software Engineer',
          organisation: meta.initial_company || 'Tech Enterprise',
          avatar_url: meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          years_experience: 4,
          primary_domain: 'Software Engineering',
          skills: ['System Design', 'React / Next.js', 'Python', 'PostgreSQL'],
          mentoring_topics: ['Resume Review & Project Critique', 'Mock Technical Interview'],
          languages: ['English', 'Hindi'],
          bio: 'Passionate engineering leader dedicated to mentoring computer science students on real-world systems, clean architecture, and technical interview excellence.',
          session_price_inr: 499,
          session_duration_mins: [30, 60],
          country: 'India',
          timezone: 'Asia/Kolkata',
          verification_status: meta.mentor_status || 'draft',
          linkedin_url: meta.linkedin_url || 'https://linkedin.com',
          created_at: user.created_at,
          updated_at: user.updated_at || new Date().toISOString(),
        }

        return NextResponse.json({
          success: true,
          profile: synthesizedProfile,
          isDemo: false,
        })
      }
    }

    // Fallback demo/cookie profile only if completely unauthenticated
    const demoProfileCookie = cookieStore.get('pathpilot_mentor_profile')?.value
    if (demoProfileCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(demoProfileCookie))
        return NextResponse.json({ success: true, profile: parsed, isDemo: true })
      } catch {
        // Fall through to default demo profile
      }
    }

    return NextResponse.json({
      success: true,
      profile: null,
      isDemo: true,
    })
  } catch (err: any) {
    console.error('[API /mentor/profile GET] Error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch mentor profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const body = await request.json()
    const { profile, isDraft } = body

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Mentor profile payload missing' },
        { status: 400 }
      )
    }

    const verificationStatus = isDraft ? 'draft' : 'pending_approval'
    const profileToSave = {
      ...profile,
      verification_status: verificationStatus,
      updated_at: new Date().toISOString(),
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      })

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Upsert into public.mentor_profiles
        const { data: upserted, error: upsertError } = await supabase
          .from('mentor_profiles')
          .upsert(
            {
              user_id: user.id,
              full_name: profile.full_name || user.user_metadata?.full_name || 'Mentor',
              title: profile.title || 'Industry Professional',
              organisation: profile.organisation || '',
              bio: profile.bio || '',
              avatar_url: profile.avatar_url || null,
              years_experience: profile.years_experience || 1,
              domains: profile.domains || (profile.primary_domain ? [profile.primary_domain] : []),
              skills: profile.skills || [],
              mentoring_topics: profile.mentoring_topics || [],
              session_price_inr: profile.session_price_inr || 500,
              session_duration_mins: profile.session_duration_mins || [30, 60],
              linkedin_url: profile.linkedin_url || null,
              phone: profile.phone || null,
              country: profile.country || 'India',
              timezone: profile.timezone || 'Asia/Kolkata',
              previous_experience: profile.previous_experience || null,
              education: profile.education || null,
              portfolio_url: profile.portfolio_url || null,
              primary_domain: profile.primary_domain || null,
              target_roles: profile.target_roles || [],
              languages: profile.languages || ['English'],
              consultation_types: profile.consultation_types || ['1-on-1 Mentorship'],
              consultation_format: profile.consultation_format || 'Google Meet',
              target_audience: profile.target_audience || ['College Students'],
              weekly_capacity: profile.weekly_capacity || 4,
              terms_accepted: Boolean(profile.terms_accepted),
              draft_step: profile.draft_step || 1,
              verification_status: verificationStatus,
              is_verified: false,
              is_demo_profile: false,
              is_available: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
          .select()
          .maybeSingle()

        if (upsertError) {
          console.error('[API /mentor/profile POST] Upsert error:', upsertError)
        }

        // Update user metadata status
        await supabase.auth.updateUser({
          data: {
            full_name: profile.full_name || user.user_metadata?.full_name,
            mentor_status: verificationStatus,
            initial_job_title: profile.title || user.user_metadata?.initial_job_title,
            initial_company: profile.organisation || user.user_metadata?.initial_company,
          },
        })

        return NextResponse.json({
          success: true,
          profile: upserted || profileToSave,
          verification_status: verificationStatus,
        })
      }
    }

    // Standalone / Demo mode persistence
    return NextResponse.json({
      success: true,
      profile: profileToSave,
      verification_status: verificationStatus,
      isDemo: true,
    })
  } catch (err: any) {
    console.error('[API /mentor/profile POST] Error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save mentor profile' },
      { status: 500 }
    )
  }
}
