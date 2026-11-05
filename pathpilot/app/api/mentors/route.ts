import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { DEMO_MENTORS } from '@/lib/demo-data'
import { Mentor } from '@/lib/api-client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase() || ''
    const domain = searchParams.get('domain')?.toLowerCase() || ''
    const topic = searchParams.get('topic')?.toLowerCase() || ''
    const sortBy = searchParams.get('sort_by') || 'rating'

    const adminClient = await createAdminClient()
    const supabase = await createClient()
    const client = adminClient || supabase

    let dbMentors: Mentor[] = []

    if (client) {
      try {
        const { data: rows, error } = await client
          .from('mentor_profiles')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('[API /api/mentors] Database fetch warning:', error.message)
        } else if (rows && rows.length > 0) {
          dbMentors = rows.map((r: any) => ({
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
          }))
        }
      } catch (dbErr) {
        console.warn('[API /api/mentors] Exception reading DB mentors:', dbErr)
      }
    }

    // Deduplicate DB mentors by name/user (in case developer registered multiple test accounts)
    const seenNames = new Set<string>()
    const dedupedDbMentors: Mentor[] = []
    for (const m of dbMentors) {
      const normalized = m.full_name.toLowerCase().trim()
      if (!seenNames.has(normalized)) {
        seenNames.add(normalized)
        dedupedDbMentors.push(m)
      }
    }

    // Merge: Put real database mentors at the top, followed by curated demo mentors
    // Deduplicate so demo mentors don't duplicate real user names or IDs
    const realNames = new Set(dedupedDbMentors.map((m) => m.full_name.toLowerCase().trim()))
    const realIds = new Set(dedupedDbMentors.map((m) => m.id))

    const filteredDemo = DEMO_MENTORS.filter(
      (demo) =>
        !realIds.has(demo.id) &&
        !realNames.has(demo.full_name.toLowerCase().trim())
    )

    let allMentors: Mentor[] = [...dedupedDbMentors, ...filteredDemo]

    // Apply search filter
    if (search) {
      allMentors = allMentors.filter((m) => {
        const nameMatch = m.full_name.toLowerCase().includes(search)
        const titleMatch = m.title.toLowerCase().includes(search)
        const orgMatch = m.organisation.toLowerCase().includes(search)
        const bioMatch = m.bio.toLowerCase().includes(search)
        const skillMatch = (m.skills || []).some((s) => s.toLowerCase().includes(search))
        const topicMatch = (m.mentoring_topics || []).some((t) => t.toLowerCase().includes(search))
        const domainMatch = (m.domains || []).some((d) => d.toLowerCase().includes(search))
        return nameMatch || titleMatch || orgMatch || bioMatch || skillMatch || topicMatch || domainMatch
      })
    }

    // Apply domain filter
    if (domain && domain !== 'all') {
      allMentors = allMentors.filter((m) =>
        (m.domains || []).some((d) => d.toLowerCase().includes(domain) || domain.includes(d.toLowerCase()))
      )
    }

    // Apply topic filter
    if (topic && topic !== 'all') {
      allMentors = allMentors.filter((m) =>
        (m.mentoring_topics || []).some((t) => t.toLowerCase().includes(topic) || topic.includes(t.toLowerCase()))
      )
    }

    // Apply sorting
    if (sortBy === 'price_asc') {
      allMentors.sort((a, b) => a.session_price_inr - b.session_price_inr)
    } else if (sortBy === 'price_desc') {
      allMentors.sort((a, b) => b.session_price_inr - a.session_price_inr)
    } else if (sortBy === 'experience') {
      allMentors.sort((a, b) => b.years_experience - a.years_experience)
    } else if (sortBy === 'rating') {
      allMentors.sort((a, b) => {
        // Prioritize real database mentors with high ratings
        if (!a.is_demo_profile && b.is_demo_profile) return -1
        if (a.is_demo_profile && !b.is_demo_profile) return 1
        return (b.rating || 5) - (a.rating || 5)
      })
    }

    return NextResponse.json({
      success: true,
      total: allMentors.length,
      mentors: allMentors,
    })
  } catch (err: any) {
    console.error('[API /api/mentors GET] Error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch mentors', mentors: DEMO_MENTORS },
      { status: 500 }
    )
  }
}
