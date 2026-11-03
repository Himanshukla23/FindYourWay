'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Layers,
  Code2,
  BookOpen,
  Briefcase,
  Users,
  Compass,
  Terminal,
  Check,
  ChevronRight,
} from 'lucide-react'

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null)
  const [consent, setConsent] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string
    strengths: string[]
    skills: string[]
    gaps: string[]
    recommendedRoles: Array<{
      title: string
      match: number
      domain: string
      category?: string
      reasoning?: string
    }>
  } | null>(null)

  const [aiInfo, setAiInfo] = useState<{ provider: string; model: string } | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>('Technical AI Product Manager')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleLoadSample = (type: 'software' | 'product') => {
    setUploadError(null)
    if (type === 'software') {
      setSelectedRole('Backend Software Engineer')
      setAiInfo({ provider: 'Google Gemini', model: 'gemini-flash-latest' })
      setAnalysisResult({
        summary: 'Comprehensive technical software engineering profile demonstrating competitive programming excellence (590+ LeetCode problems solved, ICPC 2025 Regionalist) and distributed systems fluency (Redis cache-aside, Docker containerization, C++ / Golang).',
        strengths: [
          'Competitive programming & algorithms: Top 5% LeetCode rating with 590+ verified problem solutions',
          'Distributed backend architecture: Hands-on implementation of Redis cache-aside invalidation and Docker microservices',
          'Core CS fundamentals: Proficient in C++, memory management, concurrency, and OOP design patterns'
        ],
        skills: ['C++', 'Data Structures & Algorithms', 'Redis', 'Docker', 'Go', 'TypeScript', 'Next.js', 'PostgreSQL', 'System Design'],
        gaps: [
          'Production observability & telemetry (Prometheus / Grafana / Datadog)',
          'Cloud infrastructure CI/CD pipelines (AWS ECS / Kubernetes / Terraform)',
          'Enterprise agile sprint cadence & code review standards'
        ],
        recommendedRoles: [
          {
            title: 'Backend Software Engineer',
            domain: 'Software',
            category: 'Primary Target',
            match: 95,
            reasoning: 'Exceptional core CS foundations in C++, algorithms, data structures, and Redis caching. Directly maps to high-scale backend engineering tracks at tier-1 product companies.'
          },
          {
            title: 'Systems / Infrastructure Engineer',
            domain: 'Cloud & DevOps',
            category: 'Adjacent Pivot',
            match: 86,
            reasoning: 'Strong low-level C++ systems fluency, Docker containerization, and networking knowledge enable rapid onboarding to platform and infrastructure roles.'
          },
          {
            title: 'Full-Stack AI Application Engineer',
            domain: 'AI & ML',
            category: 'Growth Path',
            match: 78,
            reasoning: 'Combines modern frontend UI development in React/Next.js with fast server-side processing, offering an accelerated path into AI product prototyping.'
          }
        ]
      })
    } else {
      setSelectedRole('Technical AI Product Manager / APM')
      setAiInfo({ provider: 'Google Gemini', model: 'gemini-flash-latest' })
      setAnalysisResult({
        summary: 'Strong AI Product Management profile combining hands-on technical literacy (RAG pipelines, LLM guardrails) with customer discovery, PRD authoring, and quantitative product metrics.',
        strengths: [
          'Technical AI fluency: Deep understanding of RAG latency benchmarks, embeddings precision, and agentic workflows',
          'Product execution & roadmapping: End-to-end PRD writing, RICE scoring prioritization, and sprint backlog coordination',
          'Cross-functional leadership: Experience liaising with engineering teams, design stakeholders, and enterprise customers'
        ],
        skills: ['AI Product Management', 'PRD Drafting', 'RAG Guardrails', 'RICE Scoring', 'Mixpanel', 'SQL Telemetry', 'Agile / Scrum', 'User Interviews'],
        gaps: [
          'Large-scale enterprise pricing & commercial packaging models',
          'Multi-region compliance and data residency frameworks (GDPR / DPDP)',
          'High-velocity B2B sales-assist product growth loops'
        ],
        recommendedRoles: [
          {
            title: 'Technical AI Product Manager / APM',
            domain: 'Product Management',
            category: 'Primary Target',
            match: 95,
            reasoning: 'Direct alignment across PRD drafting, RICE scoring, user discovery interviews, and hands-on fluency with RAG and LLM guardrails makes candidate immediately qualified for APM tracks.'
          },
          {
            title: 'Product Operations Analyst',
            domain: 'Operations & Analytics',
            category: 'Adjacent Pivot',
            match: 85,
            reasoning: 'Background liaising across merchant workflows, diagnosing root-cause trends, and building automated telemetry provides strong operational leverage.'
          },
          {
            title: 'AI Solutions Engineer',
            domain: 'Solutions Engineering',
            category: 'Growth Path',
            match: 75,
            reasoning: 'Expanding full-stack prototyping into production cloud deployment and SDK architecture opens direct paths into technical customer-facing AI deployment roles.'
          }
        ]
      })
    }
  }

  const handleSimulatedUpload = async () => {
    if (!file) {
      setUploadError('Please select and upload your resume file (PDF or DOCX) first!')
      return
    }

    setUploadError(null)
    setIsAnalyzing(true)
    try {
      const { parseResumeWithBackend } = await import('@/lib/api-client')
      const result = await parseResumeWithBackend(file)

      if (result.success && result.data) {
        setAnalysisResult(result.data)
        setAiInfo({ provider: result.providerUsed || 'Groq & Gemini AI Engine', model: result.model || 'gpt-oss-120b' })
        if (typeof window !== 'undefined') {
          localStorage.setItem('pathpilot_resume_analysis', JSON.stringify(result.data))
        }
      } else {
        setUploadError(result.error || 'Failed to analyze resume. Please try again.')
      }
    } catch (err) {
      console.error('Failed to parse resume:', err)
      setUploadError('Network error while processing file. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="page-container space-y-8">
      {/* ── Page Header (Koyeb Condensed Typography) ────────────────── */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E3DC] shadow-2xs font-tech-mono text-[11px] font-semibold text-neutral-800 tracking-wider mb-3">
          <span className="w-2 h-2 rounded-full bg-[#00F090] animate-pulse" />
          <span>// AI DIAGNOSTIC ENGINE • GEMINI &amp; GROQ ACCELERATED</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-[#0C0D0E] tracking-tight leading-[0.92] uppercase">
          RESUME ANALYSIS &amp; SKILL GAP AUDIT
        </h1>
        <p className="font-sans text-sm sm:text-base mt-2 max-w-3xl text-neutral-600 leading-relaxed">
          Upload your resume in PDF or DOCX format. PathPilot AI extracts your technical proficiencies, project portfolio, and accurately matches your profile with target tech career tracks.
        </p>
      </div>

      {/* ── Upload & Diagnostic Box ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload Controls */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white border border-[#E5E3DC] rounded-xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <span className="font-tech-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                // STEP 01
              </span>
              <span className="font-tech-mono text-[10px] text-[#00F090] bg-black px-2 py-0.5 rounded font-bold uppercase">
                MAX 5MB
              </span>
            </div>

            <h3 className="font-display text-xl text-[#0C0D0E] uppercase tracking-tight mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-black" />
              UPLOAD RESUME FILE
            </h3>
            
            {/* Dropzone with warm sand background */}
            <div className="border border-dashed border-[#D6D4CA] hover:border-black rounded-xl p-6 text-center cursor-pointer transition-all bg-[#FAF9F6] hover:bg-[#EFECE6] relative group">
              <input 
                type="file" 
                accept=".pdf,.docx" 
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0])
                    setUploadError(null)
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-lg bg-[#0C0D0E] text-[#00F090] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <FileText className="w-6 h-6 text-[#00F090]" />
              </div>
              {file ? (
                <div>
                  <div className="font-tech-mono text-xs font-bold text-neutral-900 truncate max-w-[200px] mx-auto">
                    {file.name}
                  </div>
                  <div className="font-tech-mono text-[11px] text-[#064E3B] bg-[#E6FAF2] px-2 py-0.5 rounded inline-block font-semibold mt-1.5">
                    {(file.size / 1024).toFixed(1)} KB • READY
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-tech-mono text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    CLICK TO CHOOSE PDF OR DOCX
                  </div>
                  <div className="font-tech-mono text-[10px] text-neutral-500 mt-1">
                    Auto-parsed with encrypted pipeline
                  </div>
                </div>
              )}
            </div>

            {/* Consent Checkbox */}
            <div className="mt-4 pt-4 border-t border-[#E5E3DC]">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded text-black border-neutral-400 focus:ring-black cursor-pointer accent-black" 
                />
                <span className="font-tech-mono text-xs text-neutral-600 leading-snug">
                  I consent to private AI processing of my resume. Data is encrypted and never shared.
                </span>
              </label>
            </div>

            {uploadError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in font-tech-mono">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Koyeb Black Action Button */}
            <button
              onClick={handleSimulatedUpload}
              disabled={isAnalyzing || !consent}
              className="mt-5 w-full koyeb-btn-black py-3 px-4 rounded-lg text-xs font-tech-mono flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-[#00F090] rounded-full animate-spin" />
                  <span>EXTRACTING SKILLS WITH AI...</span>
                </>
              ) : (
                <>
                  <span>▸</span>
                  <span>ANALYZE MY RESUME</span>
                  <span>◂</span>
                </>
              )}
            </button>

            {/* Quick Demo Profiles (Koyeb Developer Style) */}
            <div className="mt-5 pt-4 border-t border-[#E5E3DC]">
              <div className="font-tech-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                // OR PREVIEW WITH VERIFIED PROFILE:
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadSample('software')}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#FAF9F6] hover:bg-black hover:text-white border border-[#E5E3DC] text-neutral-800 text-xs font-tech-mono text-left flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="truncate pr-2 font-medium">💻 Anurag Mishra (C++, LeetCode 590+)</span>
                  <span className="text-[10px] text-neutral-500 group-hover:text-[#00F090] font-bold shrink-0">▸ PREVIEW</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('product')}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#FAF9F6] hover:bg-black hover:text-white border border-[#E5E3DC] text-neutral-800 text-xs font-tech-mono text-left flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="truncate pr-2 font-medium">📊 Himanshu Shukla (AI PM, RAG Ops)</span>
                  <span className="text-[10px] text-neutral-500 group-hover:text-[#00F090] font-bold shrink-0">▸ PREVIEW</span>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Assurance Box */}
          <div className="bg-white border border-[#E5E3DC] rounded-xl p-4 shadow-2xs font-tech-mono">
            <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs mb-1.5 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-[#00F090]" />
              // CONFIDENTIALITY ASSURANCE
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans">
              Your resume is processed confidentially with enterprise-grade encryption. You retain full data ownership and can delete your file telemetry anytime.
            </p>
          </div>
        </div>

        {/* Right Column: Diagnostic Results / Terminal Preview */}
        <div className="lg:col-span-2">
          {analysisResult ? (
            <div className="bg-white border border-[#E5E3DC] rounded-xl p-6 sm:p-8 space-y-6 shadow-2xs">
              {/* Header Status Bar */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#E5E3DC] gap-3">
                <div className="flex items-center gap-2 text-[#064E3B] bg-[#E6FAF2] border border-[#00F090]/40 px-3 py-1 rounded-md font-tech-mono font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#00F090] animate-pulse" />
                  <span>AI DIAGNOSTIC COMPLETE</span>
                </div>
                <span className="font-tech-mono text-[11px] px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-neutral-700">
                  ENGINE: {aiInfo?.provider || 'AI'} ({aiInfo?.model || 'smart-engine'})
                </span>
              </div>

              {/* Summary */}
              <div>
                <span className="font-tech-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  // EXECUTIVE EVALUATION
                </span>
                <p className="font-sans text-sm text-neutral-800 leading-relaxed bg-[#FAF9F6] p-4 rounded-lg border border-[#E5E3DC]">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Match Roles */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-tech-mono text-[11px] font-bold uppercase tracking-wider text-neutral-900">
                    // TARGET CAREER TRACK ALIGNMENT
                  </span>
                  <span className="font-tech-mono text-[10px] text-neutral-500">
                    Click a card to activate your roadmap
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {analysisResult.recommendedRoles.map((role: any) => {
                    const isSelected = selectedRole === role.title
                    return (
                      <div
                        key={role.title}
                        onClick={() => setSelectedRole(role.title)}
                        className={`p-5 rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white border-2 border-black shadow-md ring-1 ring-black/10'
                            : 'bg-[#FAF9F6] border border-[#E5E3DC] hover:border-black/40 hover:bg-white'
                        }`}
                      >
                        <div>
                          {/* Domain & Badges Header */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                            <span className="font-tech-mono text-[9px] text-neutral-600 font-bold uppercase tracking-wider bg-white border border-[#E5E3DC] px-2 py-0.5 rounded">
                              {role.domain}
                            </span>
                            <span className="font-tech-mono text-[10px] font-extrabold text-black bg-[#00F090] border border-[#00F090] px-2 py-0.5 rounded">
                              {role.match}% MATCH
                            </span>
                          </div>

                          {/* Role Title */}
                          <div className="font-display text-lg text-neutral-900 leading-tight uppercase">
                            {role.title}
                          </div>

                          {/* Reasoning */}
                          {role.reasoning && (
                            <p className="font-sans text-xs text-neutral-600 mt-2.5 leading-relaxed line-clamp-4">
                              {role.reasoning}
                            </p>
                          )}
                        </div>

                        {/* Selection Radio Footer */}
                        <div className={`mt-4 pt-3 border-t flex items-center justify-between ${isSelected ? 'border-neutral-300' : 'border-[#E5E3DC]'}`}>
                          <span className="font-tech-mono text-[10px] font-bold text-neutral-700">
                            {isSelected ? '✓ SELECTED TRACK' : 'CLICK TO SELECT'}
                          </span>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            isSelected 
                              ? 'bg-black border-black text-[#00F090] font-bold' 
                              : 'border-neutral-400 bg-white'
                          }`}>
                            {isSelected && '✓'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#E5E3DC]">
                  <h5 className="font-tech-mono text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00F090]" />
                    KEY STRENGTHS IDENTIFIED
                  </h5>
                  <ul className="space-y-2 text-xs text-neutral-700 font-sans">
                    {analysisResult.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#00F090] mt-0.5 font-bold">✔</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#E5E3DC]">
                  <h5 className="font-tech-mono text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    CRITICAL SKILL GAPS TO CLOSE
                  </h5>
                  <ul className="space-y-2 text-xs text-neutral-700 font-sans">
                    {analysisResult.gaps.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5 font-bold">!</span>
                        <span className="leading-relaxed">{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skills Detected */}
              <div>
                <span className="font-tech-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2.5">
                  // DETECTED COMPETENCIES &amp; FRAMEWORKS
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.skills.map((skill) => (
                    <span key={skill} className="font-tech-mono px-3 py-1.5 bg-[#FAF9F6] hover:bg-black hover:text-white text-neutral-800 text-xs font-semibold rounded-md border border-[#E5E3DC] transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Bridge Buttons */}
              <div className="pt-5 border-t border-[#E5E3DC] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="font-tech-mono text-xs text-neutral-600">
                  {selectedRole ? (
                    <span>ACTIVE TARGET: <strong className="text-black font-bold uppercase ml-1">{selectedRole}</strong></span>
                  ) : (
                    <span>Select a career track above to activate your custom learning roadmap</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto font-tech-mono">
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = selectedRole || 'Full Stack Software Engineer'
                      localStorage.setItem('pathpilot_target_role', chosen)
                      window.location.href = `/roadmap?role=${encodeURIComponent(chosen)}`
                    }}
                    className="koyeb-btn-mint px-4 py-2.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>▸</span>
                    <span>GENERATE ROADMAP</span>
                    <span>◂</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const chosen = selectedRole || 'Full Stack Software Engineer'
                      localStorage.setItem('pathpilot_target_role', chosen)
                      window.location.href = `/mentors?search=${encodeURIComponent(chosen)}`
                    }}
                    className="koyeb-btn-black px-4 py-2.5 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>▸</span>
                    <span>FIND MENTORS</span>
                    <span>◂</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Empty State: Koyeb Technical Awaiting Card ─────────── */
            <div className="h-full min-h-[420px] bg-white border border-[#E5E3DC] rounded-xl p-8 flex flex-col justify-between shadow-2xs overflow-hidden relative">
              {/* Terminal Mock Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E3DC] w-full">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="font-tech-mono text-[11px] text-neutral-400 ml-2">
                    pathpilot-resume-engine.sh — ready
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#E5E3DC] text-neutral-500 font-tech-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F090] animate-pulse" />
                  IDLE
                </div>
              </div>

              {/* Central Status */}
              <div className="my-auto py-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-xl bg-[#0C0D0E] text-[#00F090] flex items-center justify-center mb-5 shadow-xs">
                  <FileText className="w-8 h-8 text-[#00F090]" />
                </div>
                <h3 className="font-display text-3xl sm:text-4xl text-[#0C0D0E] uppercase tracking-tight mb-2">
                  AWAITING RESUME UPLOAD
                </h3>
                <p className="font-sans text-sm max-w-md leading-relaxed text-neutral-600 mb-6">
                  Select your PDF or DOCX file on the left, or test instantly with a sample verified profile to analyze technical proficiencies, identify gaps, and align your target career roadmap.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 font-tech-mono">
                  <button
                    onClick={() => handleLoadSample('software')}
                    className="koyeb-btn-black px-4 py-2 rounded-md text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>▸</span>
                    <span>TRY SOFTWARE SAMPLE</span>
                    <span>◂</span>
                  </button>
                  <button
                    onClick={() => handleLoadSample('product')}
                    className="font-tech-mono text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md border border-[#E5E3DC] bg-[#FAF9F6] hover:bg-neutral-100 text-neutral-800 transition-colors cursor-pointer"
                  >
                    <span>▸</span>
                    <span>TRY APM SAMPLE</span>
                    <span>◂</span>
                  </button>
                </div>
              </div>

              {/* Terminal Output Footer */}
              <div className="pt-4 border-t border-[#E5E3DC] flex items-center justify-between text-[11px] font-tech-mono text-neutral-400">
                <span>ACCEPTED: .PDF, .DOCX (UP TO 5MB)</span>
                <span>SECURITY: ENCRYPTED AT REST</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
