import { NextRequest, NextResponse } from 'next/server'
import { FALLBACK_PM_JOBS } from '@/lib/jobs-fallback'
import { JobListing, WorkMode, JobCategory } from '@/types'

// In-memory cache for fast sub-millisecond responses on serverless instances
let cachedJobs: JobListing[] = []
let lastFetchedTime = 0
const CACHE_TTL_MS = 3 * 60 * 60 * 1000 // 3 hours

/**
 * Normalizes an external job from Remotive API into PathPilot's JobListing contract
 */
function normalizeRemotiveJob(item: any): JobListing | null {
  try {
    const title = item.title || ''
    const company = item.company_name || 'Tech Company'
    const lowerTitle = title.toLowerCase()

    // Determine category
    let role_category: JobCategory = 'Product'
    if (lowerTitle.includes('engineer') || lowerTitle.includes('developer') || lowerTitle.includes('fullstack') || lowerTitle.includes('backend') || lowerTitle.includes('frontend')) {
      role_category = 'Software Engineering'
    } else if (lowerTitle.includes('ai') || lowerTitle.includes('machine learning') || lowerTitle.includes('ml')) {
      role_category = 'AI & Machine Learning'
    } else if (lowerTitle.includes('data') || lowerTitle.includes('analytics')) {
      role_category = 'Data & Analytics'
    } else if (lowerTitle.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) {
      role_category = 'Design'
    } else if (lowerTitle.includes('devops') || lowerTitle.includes('cloud') || lowerTitle.includes('sre')) {
      role_category = 'Cloud & DevOps'
    }

    // Determine experience levels
    let exp_min = 1
    let exp_max = 3
    if (lowerTitle.includes('intern') || lowerTitle.includes('internship') || lowerTitle.includes('fellow')) {
      exp_min = 0
      exp_max = 1
    } else if (lowerTitle.includes('junior') || lowerTitle.includes('associate') || lowerTitle.includes('apm') || lowerTitle.includes('entry') || lowerTitle.includes('graduate')) {
      exp_min = 0
      exp_max = 2
    } else if (lowerTitle.includes('senior') || lowerTitle.includes('sr.') || lowerTitle.includes('lead') || lowerTitle.includes('principal') || lowerTitle.includes('staff')) {
      exp_min = 3
      exp_max = 6
    }

    // Determine location and country
    const location = item.candidate_required_location || 'Remote (Global)'
    const lowerLoc = location.toLowerCase()
    let country = 'Global'
    if (lowerLoc.includes('india') || lowerLoc.includes('bangalore') || lowerLoc.includes('bengaluru') || lowerLoc.includes('delhi') || lowerLoc.includes('mumbai') || lowerLoc.includes('hyderabad')) {
      country = 'India'
    }

    const cleanId = `remotive-${item.id}`
    const rawSkills = Array.isArray(item.tags) ? item.tags : ['Product Management', 'Agile']

    // Remove HTML tags from description summary
    const cleanSummary = (item.description || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 240)

    return {
      id: cleanId,
      hash_id: cleanId,
      title: title.trim(),
      company: company.trim(),
      company_logo: item.company_logo || undefined,
      location: location.trim(),
      country,
      work_mode: 'Remote' as WorkMode,
      exp_min,
      exp_max,
      salary_display: item.salary ? item.salary : 'Disclosed on Application',
      skills: rawSkills.slice(0, 6),
      role_category,
      tier: 2,
      apply_url: item.url,
      source: 'Remotive Live',
      status: 'new',
      jd_summary: cleanSummary ? `${cleanSummary}...` : `Live remote position at ${company}. Open for application.`,
      verified_at: new Date().toISOString(),
      posted_at: item.publication_date ? new Date(item.publication_date).toISOString() : new Date().toISOString()
    }
  } catch {
    return null
  }
}

/**
 * Fetches fresh live jobs from open public tech & product feeds
 */
async function fetchLiveFeedJobs(): Promise<JobListing[]> {
  const liveJobs: JobListing[] = []

  // 1. Fetch from Remotive API (Product & Tech roles)
  const categories = ['product', 'software-development', 'artificial-intelligence']
  
  await Promise.allSettled(
    categories.map(async (cat) => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 4000)

        const res = await fetch(`https://remotive.com/api/remote-jobs?category=${cat}&limit=20`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'PathPilot-Career-Platform/2.0' },
          next: { revalidate: 3600 }
        })
        clearTimeout(timeoutId)

        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.jobs)) {
            for (const raw of data.jobs) {
              const normalized = normalizeRemotiveJob(raw)
              if (normalized) {
                liveJobs.push(normalized)
              }
            }
          }
        }
      } catch (err: any) {
        console.warn(`[LiveJobs] Failed to fetch category ${cat}:`, err?.message)
      }
    })
  )

  return liveJobs
}

/**
 * Combines live ingested feed jobs with the verified seed dataset, deduplicating by company + title
 */
export async function getConsolidatedJobs(forceRefresh: boolean = false): Promise<JobListing[]> {
  const now = Date.now()
  const isCacheValid = cachedJobs.length > 0 && (now - lastFetchedTime < CACHE_TTL_MS)

  if (isCacheValid && !forceRefresh) {
    return cachedJobs
  }

  try {
    // 1. Fetch live jobs from feeds
    const liveJobs = await fetchLiveFeedJobs()

    // 2. Index existing seed jobs to prevent duplicate listings
    const seenMap = new Set<string>()
    const mergedList: JobListing[] = []

    // Add newly fetched live jobs first so they appear at the top
    for (const job of liveJobs) {
      const key = `${job.company.toLowerCase().trim()}|${job.title.toLowerCase().trim()}`
      if (!seenMap.has(key)) {
        seenMap.add(key)
        mergedList.push(job)
      }
    }

    // Add our verified high-quality benchmark seed catalog
    for (const job of FALLBACK_PM_JOBS) {
      const key = `${job.company.toLowerCase().trim()}|${job.title.toLowerCase().trim()}`
      if (!seenMap.has(key)) {
        seenMap.add(key)
        mergedList.push(job)
      }
    }

    cachedJobs = mergedList
    lastFetchedTime = now
    return cachedJobs
  } catch (err: any) {
    console.warn('[LiveJobs] Failed to refresh catalog, serving seed jobs:', err?.message)
    cachedJobs = [...FALLBACK_PM_JOBS]
    return cachedJobs
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.toLowerCase().trim()
  const country = searchParams.get('country')
  const workMode = searchParams.get('work_mode')
  const roleCategory = searchParams.get('role_category')
  const expRange = searchParams.get('exp_range')
  const refresh = searchParams.get('refresh') === 'true'
  const limit = parseInt(searchParams.get('limit') || '250', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  const allJobs = await getConsolidatedJobs(refresh)

  // Apply filters
  let filtered = allJobs.filter(j => j.status !== 'closed')

  if (country && country !== 'All') {
    if (country === 'India') {
      filtered = filtered.filter(j => j.country.toLowerCase() === 'india')
    } else if (country === 'Global') {
      filtered = filtered.filter(j => j.country.toLowerCase() !== 'india' || j.work_mode.toLowerCase() === 'remote')
    }
  }

  if (workMode && workMode !== 'All') {
    filtered = filtered.filter(j => j.work_mode.toLowerCase() === workMode.toLowerCase())
  }

  if (roleCategory && roleCategory !== 'All') {
    filtered = filtered.filter(j => j.role_category.toLowerCase().includes(roleCategory.toLowerCase()))
  }

  if (expRange && expRange !== 'All') {
    if (expRange === '0-1' || expRange === 'fresher') {
      filtered = filtered.filter(j => {
        const t = j.title.toLowerCase()
        if (t.includes('intern') || t.includes('internship') || t.includes('fellow')) return true
        return j.exp_min <= 1 && j.exp_max <= 2
      })
    } else if (expRange === '1-3' || expRange === 'early') {
      filtered = filtered.filter(j => (j.exp_min >= 1 && j.exp_min <= 3) || (j.exp_min === 0 && j.exp_max >= 3))
    } else if (expRange === '3+' || expRange === 'senior') {
      filtered = filtered.filter(j => j.exp_max >= 3 || j.exp_min >= 3)
    }
  }

  if (search) {
    filtered = filtered.filter(j =>
      j.title.toLowerCase().includes(search) ||
      j.company.toLowerCase().includes(search) ||
      (j.skills && j.skills.some(sk => sk.toLowerCase().includes(search))) ||
      (j.location && j.location.toLowerCase().includes(search))
    )
  }

  const paginated = filtered.slice(offset, offset + limit)

  return NextResponse.json({
    total: filtered.length,
    limit,
    offset,
    has_more: offset + limit < filtered.length,
    jobs: paginated,
    last_verified: new Date().toISOString()
  })
}
