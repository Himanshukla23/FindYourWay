import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Valid columns in PostgreSQL public.mentor_profiles table:
// id, user_id, full_name, title, organisation, bio, avatar_url,
// years_experience, domains, skills, mentoring_topics, session_price_inr,
// session_duration_mins, rating, review_count, is_verified, is_demo_profile,
// linkedin_url, is_available, created_at

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient()
    const adminClient = await createAdminClient()

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const client = adminClient || supabase

        // 1. Fetch DB row from public.mentor_profiles
        const { data: dbProfile, error: dbError } = await client
          .from('mentor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (dbError) {
          console.warn('[API /mentor/profile GET] DB query warning:', dbError.message)
        }

        const meta = user.user_metadata || {}
        const extra = (meta.mentor_profile_data as Record<string, any>) || {}

        // Determine verification status:
        // If DB row exists and is_verified is explicitly false, respect it.
        // Otherwise default to approved (mentors are self-service, no admin gate).
        const isApproved = dbProfile
          ? Boolean(dbProfile.is_verified !== false)  // true unless explicitly set false
          : true  // new mentors without DB row are auto-approved
        const verificationStatus = isApproved ? 'approved' : 'pending_approval'

        if (dbProfile) {
          // Merge DB profile with user metadata for extended attributes
          const mergedProfile = {
            ...dbProfile,
            email: user.email,
            phone: extra.phone || meta.phone || null,
            country: extra.country || meta.country || 'India',
            timezone: extra.timezone || meta.timezone || 'Asia/Kolkata',
            primary_domain: dbProfile.domains?.[0] || extra.primary_domain || 'Software Engineering',
            target_roles: extra.target_roles || ['Full-Stack Engineer', 'Backend Engineer'],
            languages: extra.languages || ['English', 'Hindi'],
            consultation_types: extra.consultation_types || ['1-on-1 Mentorship', 'Resume Review'],
            consultation_format: extra.consultation_format || 'Google Meet',
            target_audience: extra.target_audience || ['College Students', 'Junior Engineers'],
            weekly_capacity: extra.weekly_capacity || 4,
            terms_accepted: extra.terms_accepted ?? true,
            verification_status: verificationStatus,
            draft_step: extra.draft_step || 5,
            is_verified: isApproved,
            is_demo_profile: false,
          }

          return NextResponse.json({
            success: true,
            profile: mergedProfile,
            isDemo: false,
          })
        }

        // If authenticated but no DB row exists yet, synthesize and auto-provision DB row
        const synthesizedProfile = {
          id: user.id,
          user_id: user.id,
          full_name: meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : 'Mentor'),
          email: user.email,
          title: meta.initial_job_title || 'Software Practitioner',
          organisation: meta.initial_company || 'Tech Enterprise',
          avatar_url: meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          years_experience: 4,
          primary_domain: 'Software Engineering',
          domains: ['Software Engineering'],
          skills: ['System Design', 'React / Next.js', 'Python', 'PostgreSQL'],
          mentoring_topics: ['Resume Review & Project Critique', 'Mock Technical Interview'],
          languages: ['English', 'Hindi'],
          bio: 'Passionate engineering leader dedicated to mentoring computer science students on real-world systems, clean architecture, and technical interview excellence.',
          session_price_inr: 499,
          session_duration_mins: [30, 60],
          country: 'India',
          timezone: 'Asia/Kolkata',
          verification_status: 'approved',
          is_verified: true,
          is_demo_profile: false,
          is_available: true,
          linkedin_url: meta.linkedin_url || 'https://linkedin.com',
          created_at: user.created_at,
          updated_at: user.updated_at || new Date().toISOString(),
        }

        // Auto-provision initial DB record via adminClient
        if (adminClient) {
          try {
            await adminClient.from('mentor_profiles').insert({
              user_id: user.id,
              full_name: synthesizedProfile.full_name,
              title: synthesizedProfile.title,
              organisation: synthesizedProfile.organisation,
              bio: synthesizedProfile.bio,
              avatar_url: synthesizedProfile.avatar_url,
              years_experience: synthesizedProfile.years_experience,
              domains: synthesizedProfile.domains,
              skills: synthesizedProfile.skills,
              mentoring_topics: synthesizedProfile.mentoring_topics,
              session_price_inr: synthesizedProfile.session_price_inr,
              session_duration_mins: synthesizedProfile.session_duration_mins,
              linkedin_url: synthesizedProfile.linkedin_url,
              is_verified: true,
              is_demo_profile: false,
              is_available: true,
            })
          } catch (initErr) {
            console.warn('[API /mentor/profile GET] Auto-provision warning:', initErr)
          }
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
        // Fall through to default
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
    const supabase = await createClient()
    const adminClient = await createAdminClient()
    const body = await request.json()
    const { profile, isDraft, action } = body

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Mentor profile payload missing' },
        { status: 400 }
      )
    }

    // The mentor has full authority to activate/approve/publish their profile!
    // If action is approve/publish or not a draft or explicitly approved, mark approved & verified.
    const shouldApprove =
      action === 'approve' ||
      action === 'publish' ||
      (!isDraft && profile.verification_status !== 'draft') ||
      profile.verification_status === 'approved'

    const verificationStatus = shouldApprove ? 'approved' : (isDraft ? 'draft' : 'pending_approval')
    const isVerified = verificationStatus === 'approved'

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const client = adminClient || supabase

        // Construct clean DB record matching ONLY existing columns of public.mentor_profiles
        const dbPayload = {
          user_id: user.id,
          full_name: profile.full_name || user.user_metadata?.full_name || 'Mentor',
          title: profile.title || 'Industry Professional',
          organisation: profile.organisation || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || null,
          years_experience: Number(profile.years_experience) || 1,
          domains: Array.isArray(profile.domains) && profile.domains.length > 0
            ? profile.domains
            : (profile.primary_domain ? [profile.primary_domain] : ['Software Engineering']),
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          mentoring_topics: Array.isArray(profile.mentoring_topics) ? profile.mentoring_topics : [],
          session_price_inr: Number(profile.session_price_inr) || 499,
          session_duration_mins: Array.isArray(profile.session_duration_mins) && profile.session_duration_mins.length > 0
            ? profile.session_duration_mins
            : [30, 60],
          linkedin_url: profile.linkedin_url || null,
          is_verified: isVerified,
          is_demo_profile: false,
          is_available: profile.is_available ?? true,
        }

        // Check if DB record exists (avoid onConflict constraint issue)
        const { data: existingRecord } = await client
          .from('mentor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        let savedDbRecord = null

        if (existingRecord) {
          const { data: updated, error: updateError } = await client
            .from('mentor_profiles')
            .update(dbPayload)
            .eq('id', existingRecord.id)
            .select()
            .single()

          if (updateError) {
            console.error('[API /mentor/profile POST] DB Update error:', updateError)
            throw new Error(`Failed to update database profile: ${updateError.message}`)
          }
          savedDbRecord = updated
        } else {
          const { data: inserted, error: insertError } = await client
            .from('mentor_profiles')
            .insert(dbPayload)
            .select()
            .single()

          if (insertError) {
            console.error('[API /mentor/profile POST] DB Insert error:', insertError)
            throw new Error(`Failed to insert database profile: ${insertError.message}`)
          }
          savedDbRecord = inserted
        }

        // Sync user metadata via adminClient and session
        const updatedMeta = {
          full_name: dbPayload.full_name,
          name: dbPayload.full_name,
          initial_job_title: dbPayload.title,
          initial_company: dbPayload.organisation,
          mentor_status: verificationStatus,
          mentor_profile_data: {
            ...profile,
            verification_status: verificationStatus,
            is_verified: isVerified,
          },
        }

        if (adminClient) {
          await adminClient.auth.admin.updateUserById(user.id, {
            user_metadata: updatedMeta,
          })
        }

        await supabase.auth.updateUser({
          data: updatedMeta,
        })

        const finalProfile = {
          ...savedDbRecord,
          ...profile,
          verification_status: verificationStatus,
          is_verified: isVerified,
        }

        return NextResponse.json({
          success: true,
          profile: finalProfile,
          verification_status: verificationStatus,
          is_verified: isVerified,
        })
      }
    }

    // Standalone / Demo mode fallback
    const profileToSave = {
      ...profile,
      verification_status: verificationStatus,
      is_verified: isVerified,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      profile: profileToSave,
      verification_status: verificationStatus,
      is_verified: isVerified,
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
