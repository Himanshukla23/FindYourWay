import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'PathPilot AI — Career Guidance for College Students',
  description:
    'Discover your ideal career path, build a personalised preparation roadmap, and book one-to-one guidance from industry professionals.',
  keywords: ['career guidance', 'college students', 'AI career', 'mentor booking', 'PathPilot'],
  openGraph: {
    title: 'PathPilot AI',
    description: 'AI-powered career guidance and mentor booking for college students',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}

