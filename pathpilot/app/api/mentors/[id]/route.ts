import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { DEMO_MENTORS } from '@/lib/demo-data'
import { Mentor } from '@/lib/api-client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const adminClient = await createAdminClient()
    const supabase = await createClient()
    const client = adminClient || supabase

    if (client) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        let query = client.from('mentor_profiles').select('*')
        if (isUUID) {
          query = query.or(`id.eq.${id},user_id.eq.${id}`)
        } else {
          query = query.eq('id', id)
        }
        const { data: r, error } = await query.maybeSingle()

        if (r) {
          const mentor: Mentor = {
            id: r.id,
            user_id: r.user_id,
            full_name: r.full_name || 'Industry Mentor',
            title: r.title || 'Professional Practitioner',
            organisation: r.organisation || 'Tech Enterprise',
            bio: r.bio || '',
            avatar_url: r.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            years_experience: Number(r.years_experience) || 1,
            domains: Array.isArray(r.domains) && r.domains.length > 0 ? r.domains : ['Software Engineering'],
            skills: Array.isArray(r.skills) ? r.skills : [],
            mentoring_topics: Array.isArray(r.mentoring_topics) && r.mentoring_topics.length > 0
              ? r.mentoring_topics
              : ['Resume Review & Project Critique', 'Career Navigation Strategy'],
            session_price_inr: Number(r.session_price_inr) || 499,
            session_duration_mins: Array.isArray(r.session_duration_mins) && r.session_duration_mins.length > 0
              ? r.session_duration_mins
              : [30, 60],
            rating: r.rating ? Number(r.rating) : 5.0,
            review_count: r.review_count ? Number(r.review_count) : 12,
            is_verified: true,
            is_demo_profile: false,
            is_available: true,
            linkedin_url: r.linkedin_url || null,
            created_at: r.created_at || new Date().toISOString(),
          }

          return NextResponse.json(mentor)
        }
      } catch (dbErr) {
        console.warn('[API /api/mentors/[id]] DB query warning:', dbErr)
      }
    }

    // Check DEMO_MENTORS
    const demoMentor = DEMO_MENTORS.find((m) => m.id === id) || null
    if (demoMentor) {
      return NextResponse.json(demoMentor)
    }

    return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
  } catch (err: any) {
    console.error('[API /api/mentors/[id] GET] Error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch mentor' }, { status: 500 })
  }
}
