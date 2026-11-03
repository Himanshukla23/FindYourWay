'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowUpRight, Sparkles, Building2, ShieldCheck, Zap } from 'lucide-react'

interface CompanyItem {
  name: string
  code: string
  subtext: string
  bg: string
  textColor: string
  searchQuery: string
  rolesCount?: number
}

// ── 4 Rows of Monitored Companies (36+ Real Indian & Global Employers) ─────
const ROW_1: CompanyItem[] = [
  { name: 'Infosys Careers', code: 'Info', subtext: 'Monitored every 12h', bg: '#007CC3', textColor: '#FFFFFF', searchQuery: 'Infosys' },
  { name: 'Wipro Careers', code: 'Wipro', subtext: 'Monitored every 12h', bg: '#5C2D91', textColor: '#FFFFFF', searchQuery: 'Wipro' },
  { name: 'HCLTech Careers', code: 'HC', subtext: 'Monitored every 12h', bg: '#E60000', textColor: '#FFFFFF', searchQuery: 'HCLTech' },
  { name: 'Tech Mahindra', code: 'TM', subtext: 'Monitored every 12h', bg: '#D9222A', textColor: '#FFFFFF', searchQuery: 'Tech Mahindra' },
  { name: 'Mindtickle Careers', code: 'm', subtext: 'Monitored every 12h', bg: '#FF5722', textColor: '#FFFFFF', searchQuery: 'Mindtickle' },
  { name: 'Nykaa Careers', code: 'N', subtext: 'Monitored every 12h', bg: '#FC2779', textColor: '#FFFFFF', searchQuery: 'Nykaa' },
  { name: 'Weekday', code: 'W', subtext: '1 role on board', bg: '#0F172A', textColor: '#FFFFFF', searchQuery: 'Weekday' },
  { name: 'Dream Sports', code: 'DS', subtext: 'Monitored every 12h', bg: '#E11D48', textColor: '#FFFFFF', searchQuery: 'Dream Sports' },
  { name: 'Swiggy Careers', code: 'Swiggy', subtext: 'Direct ATS Feed', bg: '#FC8019', textColor: '#FFFFFF', searchQuery: 'Swiggy' },
  { name: 'CRED Careers', code: 'CRED', subtext: 'Direct ATS Feed', bg: '#111827', textColor: '#FFFFFF', searchQuery: 'CRED' },
]

const ROW_2: CompanyItem[] = [
  { name: 'Hero MotoCorp Careers', code: 'Hero', subtext: 'Monitored every 12h', bg: '#DC2626', textColor: '#FFFFFF', searchQuery: 'Hero MotoCorp' },
  { name: 'Ashok Leyland Careers', code: 'AL', subtext: 'Monitored every 12h', bg: '#0284C7', textColor: '#FFFFFF', searchQuery: 'Ashok Leyland' },
  { name: 'Larsen & Toubro Careers', code: 'L&T', subtext: 'Monitored every 12h', bg: '#334155', textColor: '#FFFFFF', searchQuery: 'Larsen & Toubro' },
  { name: 'Tata Steel Careers', code: 'Tata', subtext: 'Monitored every 12h', bg: '#004890', textColor: '#FFFFFF', searchQuery: 'Tata Steel' },
  { name: 'Razorpay Careers', code: 'Razor', subtext: 'Direct ATS Feed', bg: '#0C2340', textColor: '#FFFFFF', searchQuery: 'Razorpay' },
  { name: 'PhonePe Careers', code: 'PhonePe', subtext: 'Direct ATS Feed', bg: '#5F259F', textColor: '#FFFFFF', searchQuery: 'PhonePe' },
  { name: 'Google India', code: 'Google', subtext: 'Global APM Cohort', bg: '#4285F4', textColor: '#FFFFFF', searchQuery: 'Google' },
  { name: 'Postman Careers', code: 'Postman', subtext: 'Direct ATS Feed', bg: '#FF6C37', textColor: '#FFFFFF', searchQuery: 'Postman' },
  { name: 'Zepto Careers', code: 'Zepto', subtext: 'Direct ATS Feed', bg: '#7C3AED', textColor: '#FFFFFF', searchQuery: 'Zepto' },
  { name: 'Meesho Careers', code: 'Meesho', subtext: 'Monitored every 12h', bg: '#DB2777', textColor: '#FFFFFF', searchQuery: 'Meesho' },
]

const ROW_3: CompanyItem[] = [
  { name: 'Teachmint Careers', code: 'TC', subtext: 'Monitored every 12h', bg: '#0D9488', textColor: '#FFFFFF', searchQuery: 'Teachmint' },
  { name: 'BookMyShow Careers', code: 'BMS', subtext: 'Monitored every 12h', bg: '#E11D48', textColor: '#FFFFFF', searchQuery: 'BookMyShow' },
  { name: 'Electronic Arts Careers', code: 'EA', subtext: 'Monitored every 12h', bg: '#1D4ED8', textColor: '#FFFFFF', searchQuery: 'Electronic Arts' },
  { name: 'Warner Bros. Discovery', code: 'WBD', subtext: 'Monitored every 12h', bg: '#B45309', textColor: '#FFFFFF', searchQuery: 'Warner Bros' },
  { name: 'Zerodha Careers', code: 'Zerodha', subtext: 'Direct ATS Feed', bg: '#387ED1', textColor: '#FFFFFF', searchQuery: 'Zerodha' },
  { name: 'Juspay Careers', code: 'Juspay', subtext: 'Direct ATS Feed', bg: '#0284C7', textColor: '#FFFFFF', searchQuery: 'Juspay' },
  { name: 'Urban Company', code: 'UC', subtext: 'Monitored every 12h', bg: '#18181B', textColor: '#FFFFFF', searchQuery: 'Urban Company' },
  { name: 'Jar Careers', code: 'Jar', subtext: '1 role on board', bg: '#4F46E5', textColor: '#FFFFFF', searchQuery: 'Jar' },
  { name: 'Zomato Careers', code: 'Zomato', subtext: 'Direct ATS Feed', bg: '#CB202D', textColor: '#FFFFFF', searchQuery: 'Zomato' },
  { name: 'Flipkart Careers', code: 'FK', subtext: 'Monitored every 6h', bg: '#2874F0', textColor: '#FFFFFF', searchQuery: 'Flipkart' },
]

const ROW_4: CompanyItem[] = [
  { name: 'LetsTransport Careers', code: 'LC', subtext: 'Monitored every 12h', bg: '#EA580C', textColor: '#FFFFFF', searchQuery: 'LetsTransport' },
  { name: 'Mahindra Logistics', code: 'ML', subtext: 'Monitored every 12h', bg: '#BE123C', textColor: '#FFFFFF', searchQuery: 'Mahindra Logistics' },
  { name: 'Blue Dart Careers', code: 'BD', subtext: 'Monitored every 12h', bg: '#0369A1', textColor: '#FFFFFF', searchQuery: 'Blue Dart' },
  { name: 'DTDC Careers', code: 'DTDC', subtext: 'Monitored every 12h', bg: '#DC2626', textColor: '#FFFFFF', searchQuery: 'DTDC' },
  { name: 'Tata Consultancy (TCS)', code: 'TCS', subtext: 'Monitored every 12h', bg: '#1E3A8A', textColor: '#FFFFFF', searchQuery: 'TCS' },
  { name: 'Cognizant Careers', code: 'CTS', subtext: 'Monitored every 12h', bg: '#0033A0', textColor: '#FFFFFF', searchQuery: 'Cognizant' },
  { name: 'Reliance Jio', code: 'Jio', subtext: 'Monitored every 12h', bg: '#0A2540', textColor: '#FFFFFF', searchQuery: 'Jio' },
  { name: 'Paytm Careers', code: 'Paytm', subtext: 'Monitored every 12h', bg: '#00B9F5', textColor: '#FFFFFF', searchQuery: 'Paytm' },
  { name: 'Groww Careers', code: 'Groww', subtext: 'Monitored every 12h', bg: '#00D09C', textColor: '#FFFFFF', searchQuery: 'Groww' },
  { name: 'MakeMyTrip', code: 'MMT', subtext: 'Monitored every 12h', bg: '#E53935', textColor: '#FFFFFF', searchQuery: 'MakeMyTrip' },
]

function CompanyPill({ company }: { company: CompanyItem }) {
  return (
    <Link
      href={`/jobs?search=${encodeURIComponent(company.searchQuery)}`}
      className="group relative flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white dark:bg-card px-3.5 py-2.5 shadow-2xs hover:shadow-md hover:border-blue-400 hover:-translate-y-0.5 transition-all cursor-pointer shrink-0 min-w-[210px] sm:min-w-[230px]"
      title={`View open roles at ${company.name}`}
    >
      {/* Brand Icon Badge */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-xs tracking-tight"
        style={{ backgroundColor: company.bg, color: company.textColor }}
      >
        {company.code}
      </div>

      {/* Text Info */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
          {company.name}
        </h4>
        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
          {company.subtext}
        </p>
      </div>

      {/* Upward Slanted Arrow Indicator */}
      <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
    </Link>
  )
}

export function CompanyConnectionsMarquee() {
  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>LIVE ATS INGESTION & PIPELINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Our Connections
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Continuously monitoring career portals and direct ATS pipelines every 6 to 12 hours. Zero dead aggregator listings.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Live Sync Active</span>
          </div>
        </div>
      </div>

      {/* Centered Glowing Hero Badge (Exactly matching user reference image) */}
      <div className="flex justify-center mb-8 px-4">
        <div className="relative group">
          {/* Outer glow effect */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 opacity-40 blur-lg group-hover:opacity-60 transition duration-500" />

          {/* Main Card */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#0B63E5] to-[#0447A8] px-10 sm:px-14 py-4 sm:py-5 text-center shadow-xl border border-blue-400/30">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
              143
            </div>
            <div className="text-xs sm:text-sm font-semibold text-blue-100 tracking-wide mt-0.5">
              Indian Companies Total Connection
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Wrapper with Smooth Left & Right Gradient Masks */}
      <div className="relative w-full overflow-hidden space-y-3.5 marquee-row">
        {/* Left Gradient Fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />

        {/* Right Gradient Fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Row 1: Left */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-left flex gap-3.5">
            {[...ROW_1, ...ROW_1].map((comp, idx) => (
              <CompanyPill key={`r1-${comp.name}-${idx}`} company={comp} />
            ))}
          </div>
        </div>

        {/* Row 2: Right */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-right flex gap-3.5">
            {[...ROW_2, ...ROW_2].map((comp, idx) => (
              <CompanyPill key={`r2-${comp.name}-${idx}`} company={comp} />
            ))}
          </div>
        </div>

        {/* Row 3: Left (Faster) */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-left-fast flex gap-3.5">
            {[...ROW_3, ...ROW_3].map((comp, idx) => (
              <CompanyPill key={`r3-${comp.name}-${idx}`} company={comp} />
            ))}
          </div>
        </div>

        {/* Row 4: Right (Faster) */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-right-fast flex gap-3.5">
            {[...ROW_4, ...ROW_4].map((comp, idx) => (
              <CompanyPill key={`r4-${comp.name}-${idx}`} company={comp} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="mt-8 text-center px-4">
        <p className="text-xs text-slate-500 font-medium">
          💡 Click any company card above to view verified early-career & APM job openings directly from their careers portal.
        </p>
      </div>
    </section>
  )
}
