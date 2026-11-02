'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserCheck } from 'lucide-react'
import { MentorProfileWizard } from '@/components/mentor/MentorProfileWizard'
import { MentorOnboardingFormData } from '@/types'

export default function MentorProfileEditPage() {
  const [profileData, setProfileData] = useState<Partial<MentorOnboardingFormData> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/mentor/profile')
        const data = await res.json()
        if (data.success && data.profile) {
          setProfileData(data.profile)
        }
      } catch (err) {
        console.error('Failed to load profile for edit:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/mentor/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>&larr; Back to Profile Overview</span>
        </Link>
      </div>

      <MentorProfileWizard initialData={profileData || undefined} mode="edit" />
    </div>
  )
}
