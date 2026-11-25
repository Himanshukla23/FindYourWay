import { NextRequest, NextResponse } from 'next/server'
import { getConsolidatedJobs } from '../route'

export async function GET(req: NextRequest) {
  try {
    const jobs = await getConsolidatedJobs(true)
    return NextResponse.json({
      success: true,
      message: 'Jobs catalog synchronized successfully',
      total_active_jobs: jobs.length,
      synced_at: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Sync failed' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
