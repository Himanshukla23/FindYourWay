import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as Indian Rupees */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format a date string to a readable format */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Format a time string (HH:MM) to 12-hour format */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
}

/** Get initials from a full name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Truncate text to a given length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/** Format experience requirements accurately (e.g. Internship, Fresher 0-1 yr, 1-2 yrs) */
export function formatExperience(job: { title?: string; exp_min?: number; exp_max?: number }): string {
  const t = (job.title || '').toLowerCase()
  if (t.includes('intern') || t.includes('internship') || t.includes('fellow')) {
    return 'Internship'
  }
  const min = job.exp_min ?? 0
  const max = job.exp_max ?? 0
  if (min === 0 && max <= 1) {
    return 'Fresher (0–1 yr)'
  }
  if (min === 0 && max === 2) {
    return 'Fresher / 0–2 yrs'
  }
  if (min === 0 && max > 2) {
    return '0–2 yrs'
  }
  if (min === max) {
    return `${min}+ yrs`
  }
  return `${min}–${max} yrs`
}

/** Check whether Supabase is configured */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/** Check whether AI is configured */
export function isAIConfigured(): boolean {
  const provider = process.env.AI_PROVIDER
  if (!provider || provider === 'demo') return false
  if (provider === 'gemini') return Boolean(process.env.GOOGLE_GEMINI_API_KEY)
  if (provider === 'openai') return Boolean(process.env.OPENAI_API_KEY)
  return false
}

/** Sleep for a given number of milliseconds (for demo loading states) */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
