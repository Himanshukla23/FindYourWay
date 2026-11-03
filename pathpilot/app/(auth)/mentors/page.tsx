'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  Star,
  CheckCircle2,
  Calendar,
  Briefcase,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  ArrowUpDown,
  Building,
  GraduationCap
} from 'lucide-react'
import { getMentors, Mentor } from '@/lib/api-client'
import { DEMO_MENTORS } from '@/lib/demo-data'

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([])
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>('all')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'experience'>('rating')
  const [mentors, setMentors] = useState<Mentor[]>(DEMO_MENTORS)
  const [isLoading, setIsLoading] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Collapsible accordion state for filter sections
  const [openSections, setOpenSections] = useState({
    domain: true,
    experience: true,
    price: true,
    topic: true
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Read URL search params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('search')
      if (q) setSearchQuery(q)
      const domain = params.get('domain')
      if (domain) setSelectedDomains([domain])
    }
  }, [])

  // Fetch initial or updated mentors from server
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const timer = setTimeout(async () => {
      try {
        const data = await getMentors({
          search: searchQuery,
          sort_by: sortBy === 'price_asc' ? 'price_asc' : sortBy === 'price_desc' ? 'price_desc' : sortBy === 'experience' ? 'experience' : undefined,
        })
        if (isMounted) {
          if (sortBy === 'rating') {
            data.sort((a, b) => b.rating - a.rating)
          } else if (sortBy === 'experience') {
            data.sort((a, b) => b.years_experience - a.years_experience)
          }
          setMentors(data)
        }
      } catch (err) {
        console.error('Error fetching mentors:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }, 250)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [searchQuery, sortBy])

  // Extract all unique domains from mentors data
  const availableDomains = useMemo(() => {
    const set = new Set<string>()
    DEMO_MENTORS.forEach(m => m.domains.forEach(d => set.add(d)))
    return Array.from(set).sort()
  }, [])

  // Extract all unique mentoring topics
  const availableTopics = useMemo(() => {
    const set = new Set<string>()
    DEMO_MENTORS.forEach(m => (m.mentoring_topics || []).forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [])

  // Multi-facet filtering on the mentor list
  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      // 1. Domain Filter (Multi-select)
      if (selectedDomains.length > 0) {
        const matchesDomain = selectedDomains.some(sel =>
          mentor.domains.some(d => d.toLowerCase().includes(sel.toLowerCase()))
        )
        if (!matchesDomain) return false
      }

      // 2. Experience Filter
      if (selectedExperiences.length > 0) {
        const exp = mentor.years_experience
        const matchesExp = selectedExperiences.some(tier => {
          if (tier === '0-4') return exp <= 4
          if (tier === '5-7') return exp >= 5 && exp <= 7
          if (tier === '8+') return exp >= 8
          return true
        })
        if (!matchesExp) return false
      }

      // 3. Price Tier Filter
      if (selectedPriceTier !== 'all') {
        const p = mentor.session_price_inr
        if (selectedPriceTier === 'under-800' && p >= 800) return false
        if (selectedPriceTier === '800-1000' && (p < 800 || p > 1000)) return false
        if (selectedPriceTier === 'above-1000' && p <= 1000) return false
      }

      // 4. Mentoring Topic Filter
      if (selectedTopic !== 'all') {
        const hasTopic = (mentor.mentoring_topics || []).some(t =>
          t.toLowerCase().includes(selectedTopic.toLowerCase())
        )
        if (!hasTopic) return false
      }

      return true
    })
  }, [mentors, selectedDomains, selectedExperiences, selectedPriceTier, selectedTopic])

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    )
  }

  const handleExperienceToggle = (tier: string) => {
    setSelectedExperiences(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    )
  }

  const handleClearAll = () => {
    setSelectedDomains([])
    setSelectedExperiences([])
    setSelectedPriceTier('all')
    setSelectedTopic('all')
    setSearchQuery('')
  }

  const hasActiveFilters =
    selectedDomains.length > 0 ||
    selectedExperiences.length > 0 ||
    selectedPriceTier !== 'all' ||
    selectedTopic !== 'all' ||
    searchQuery.trim().length > 0

  return (
    <div className="page-container animate-fade-in space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          Industry Mentorship Network
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find the right mentor for your next career move.
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
          Connect with experienced professionals for career guidance, resume reviews, technical discussions, and mock interviews.
        </p>
      </div>

      {/* ── Search Bar & Mobile Trigger Row ────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by mentor name, company, or technical skill..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          {/* Mobile Filters Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters {hasActiveFilters && `(${selectedDomains.length + selectedExperiences.length + (selectedPriceTier !== 'all' ? 1 : 0) + (selectedTopic !== 'all' ? 1 : 0)})`}</span>
          </button>

          {/* Sort Control */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Active Filters Chip Row ─────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="text-xs font-semibold text-slate-500 mr-1">Active filters:</span>
          {selectedDomains.map(d => (
            <span
              key={d}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium"
            >
              {d}
              <button
                onClick={() => handleDomainToggle(d)}
                className="hover:text-blue-900 ml-0.5"
                aria-label={`Remove domain filter ${d}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {selectedExperiences.map(e => (
            <span
              key={e}
              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-xs font-medium"
            >
              {e === '0-4' ? '1-4 Yrs' : e === '5-7' ? '5-7 Yrs' : '8+ Yrs'} Exp
              <button
                onClick={() => handleExperienceToggle(e)}
                className="hover:text-slate-900 ml-0.5"
                aria-label="Remove experience filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {selectedPriceTier !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-xs font-medium">
              {selectedPriceTier === 'under-800' ? '< ₹800' : selectedPriceTier === '800-1000' ? '₹800 - ₹1000' : '> ₹1000'}
              <button
                onClick={() => setSelectedPriceTier('all')}
                className="hover:text-slate-900 ml-0.5"
                aria-label="Remove price filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedTopic !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-xs font-medium">
              Topic: {selectedTopic}
              <button
                onClick={() => setSelectedTopic('all')}
                className="hover:text-slate-900 ml-0.5"
                aria-label="Remove topic filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-xs font-medium">
              &quot;{searchQuery}&quot;
              <button
                onClick={() => setSearchQuery('')}
                className="hover:text-slate-900 ml-0.5"
                aria-label="Clear search text"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 ml-2 inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}

      {/* ── Main Layout: Sidebar Filters + Mentors Grid ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Vertical Filter Sidebar (260-280px / 3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs sticky top-20 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Filter Mentors</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Reset
              </button>
            )}
          </div>

          {/* Section 1: Career Domains */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('domain')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900"
            >
              <span>Career Domain</span>
              {openSections.domain ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {openSections.domain && (
              <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                {availableDomains.map(domain => {
                  const isChecked = selectedDomains.includes(domain)
                  return (
                    <label
                      key={domain}
                      className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleDomainToggle(domain)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="truncate">{domain}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section 2: Experience Level */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => toggleSection('experience')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900"
            >
              <span>Years of Experience</span>
              {openSections.experience ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {openSections.experience && (
              <div className="space-y-2 pt-1">
                {[
                  { id: '0-4', label: '1 to 4 Years' },
                  { id: '5-7', label: '5 to 7 Years' },
                  { id: '8+', label: '8+ Years (Staff / Principal)' }
                ].map(exp => (
                  <label
                    key={exp.id}
                    className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExperiences.includes(exp.id)}
                      onChange={() => handleExperienceToggle(exp.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{exp.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Session Price */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900"
            >
              <span>Session Fee (INR)</span>
              {openSections.price ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {openSections.price && (
              <div className="space-y-2 pt-1">
                {[
                  { id: 'all', label: 'All Price Ranges' },
                  { id: 'under-800', label: 'Under ₹800' },
                  { id: '800-1000', label: '₹800 to ₹1000' },
                  { id: 'above-1000', label: 'Above ₹1000' }
                ].map(p => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="price-filter"
                      value={p.id}
                      checked={selectedPriceTier === p.id}
                      onChange={() => setSelectedPriceTier(p.id)}
                      className="border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Mentoring Topic */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => toggleSection('topic')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900"
            >
              <span>Mentoring Topic</span>
              {openSections.topic ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {openSections.topic && (
              <div className="pt-1">
                <select
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Topics</option>
                  {availableTopics.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </aside>

        {/* Mentors Results Area (9 cols on desktop) */}
        <div className="col-span-1 lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900 font-bold">{filteredMentors.length}</strong> verified industry mentors
            </span>
            {isLoading && <span className="text-blue-600 animate-pulse font-medium">Updating list...</span>}
          </div>

          {filteredMentors.length === 0 ? (
            /* Helpful empty state */
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Mentors Match Your Selected Filters</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Try clearing some filter criteria, broadening your price range, or clearing the search text to see available mentors.
                </p>
              </div>
              <button
                onClick={handleClearAll}
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            /* Mentor Card Grid (1 col on mobile, 2 cols on tablet/desktop) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredMentors.map(mentor => (
                <div
                  key={mentor.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    {/* Mentor Profile Header */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={mentor.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={mentor.full_name}
                        className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-xs shrink-0 aspect-square"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                            {mentor.full_name}
                            {mentor.is_verified && (
                              <span title="Verified Industry Engineer">
                                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-amber-800 text-[11px] font-bold shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{mentor.rating}</span>
                            <span className="text-[10px] text-slate-500">({mentor.review_count})</span>
                          </div>
                        </div>

                        <p className="text-xs text-blue-700 font-medium mt-0.5 truncate">
                          {mentor.title} at <span className="text-slate-900 font-semibold">{mentor.organisation}</span>
                        </p>

                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          <span>{mentor.years_experience} Years Industry Experience</span>
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                      {mentor.bio}
                    </p>

                    {/* Technical Domains & Expertise */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {mentor.domains.map(d => (
                        <span key={d} className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md text-[10px] font-semibold">
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Discussion Topics */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Topics &amp; Discussion:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(mentor.mentoring_topics || []).slice(0, 3).map(topic => (
                          <span
                            key={topic}
                            className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer with Price and Book CTA */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Session Fee</span>
                      <span className="text-base font-extrabold text-slate-900">₹{mentor.session_price_inr}</span>
                      <span className="text-xs text-slate-500 font-normal"> / 30m</span>
                    </div>

                    <Link
                      href={`/book/${mentor.id}`}
                      className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Session</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Vertical Filter Drawer Modal ────────────────────── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-5 ml-auto z-10 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Filters</h3>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  aria-label="Close filters drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile: Domains */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">Career Domain</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availableDomains.map(d => (
                    <label key={d} className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedDomains.includes(d)}
                        onChange={() => handleDomainToggle(d)}
                        className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                      />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile: Experience */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">Experience</span>
                <div className="space-y-2">
                  {[
                    { id: '0-4', label: '1 to 4 Years' },
                    { id: '5-7', label: '5 to 7 Years' },
                    { id: '8+', label: '8+ Years (Staff / Principal)' }
                  ].map(exp => (
                    <label key={exp.id} className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedExperiences.includes(exp.id)}
                        onChange={() => handleExperienceToggle(exp.id)}
                        className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                      />
                      <span>{exp.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile: Price */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">Session Fee</span>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-800', label: 'Under ₹800' },
                    { id: '800-1000', label: '₹800 to ₹1000' },
                    { id: 'above-1000', label: 'Above ₹1000' }
                  ].map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="radio"
                        name="mobile-price"
                        value={p.id}
                        checked={selectedPriceTier === p.id}
                        onChange={() => setSelectedPriceTier(p.id)}
                        className="border-slate-300 text-blue-600 w-3.5 h-3.5"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Drawer Actions */}
            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleClearAll}
                className="w-1/2 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-center"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2.5 rounded-full bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 text-center shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
