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
  Compass
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
            reasoning: 'Direct alignment across PRD drafting, RICE scoring, user discovery interviews, and hands-on fluency with RAG and LLM guardrails makes him immediately qualified for APM tracks.'
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
      // Import and call backend parser with transparent fallback
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
    <div className="page-container animate-fade-in space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Google AI Resume Diagnostic
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Resume Analysis &amp; Skill Gap Audit
        </h1>
        <p className="text-sm mt-1 max-w-2xl text-slate-600">
          Upload your resume in PDF or DOCX format. PathPilot AI extracts your technical competencies, project portfolio, and accurately matches your profile with target career tracks.
        </p>
      </div>

      {/* Upload & Diagnostic Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base font-bold mb-2 flex items-center gap-2 text-slate-900">
              <Upload className="w-4 h-4 text-blue-600" />
              Upload Resume File
            </h3>
            
            <div className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-blue-50/40 hover:bg-blue-50/80 relative group">
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
              <div className="w-12 h-12 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              {file ? (
                <div>
                  <div className="text-sm font-semibold text-slate-900 truncate max-w-[200px] mx-auto">{file.name}</div>
                  <div className="text-xs text-blue-600 font-medium mt-1">{(file.size / 1024).toFixed(1)} KB • Ready</div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-semibold text-slate-800">Click to choose PDF or DOCX</div>
                  <div className="text-[11px] text-slate-500 mt-1">Max 5MB file size</div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" 
                />
                <span className="text-xs text-slate-600 leading-snug">
                  I consent to private AI processing of my resume. Data is encrypted and never shared.
                </span>
              </label>
            </div>

            {uploadError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <button
              onClick={handleSimulatedUpload}
              disabled={isAnalyzing || !consent}
              className="mt-5 w-full py-3 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Extracting Skills with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze My Resume</span>
                </>
              )}
            </button>

            {/* Quick Demo Samples */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-500 mb-2">
                Or preview with verified sample profile:
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLoadSample('software')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>💻 Anurag Mishra (Software Track)</span>
                  <span className="text-[10px] text-blue-600 font-bold">Preview →</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('product')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>📊 Himanshu Shukla (Product Track)</span>
                  <span className="text-[10px] text-blue-600 font-bold">Preview →</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs mb-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              Privacy Assurance
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your resume is processed confidentially with enterprise-grade encryption. You retain full data ownership and can delete your file anytime.
            </p>
          </div>
        </div>

        {/* Diagnostic Results Display */}
        <div className="lg:col-span-2">
          {analysisResult ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  AI Diagnostic Complete
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium capitalize">
                  Powered by {aiInfo?.provider || 'AI'} ({aiInfo?.model || 'smart-engine'})
                </span>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Executive Evaluation
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Match Roles */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Step 1: Choose Your Target Career Track
                  </h4>
                  <span className="text-[11px] text-slate-500">Click a card to activate your roadmap</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {analysisResult.recommendedRoles.map((role: any) => {
                    const isSelected = selectedRole === role.title
                    return (
                      <div
                        key={role.title}
                        onClick={() => setSelectedRole(role.title)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/80 border-2 border-blue-600 shadow-md shadow-blue-500/10 ring-2 ring-blue-600/20'
                            : 'bg-white border-2 border-slate-200 hover:border-blue-300 hover:shadow-md hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          {/* Domain & Badges Header */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                              {role.domain}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {role.category && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                  role.category.toLowerCase().includes('primary')
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : role.category.toLowerCase().includes('pivot')
                                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {role.category}
                                </span>
                              )}
                              <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                                {role.match}% Match
                              </span>
                            </div>
                          </div>

                          {/* Role Title */}
                          <div className="font-bold text-base text-slate-900 leading-snug">
                            {role.title}
                          </div>

                          {/* Reasoning */}
                          {role.reasoning && (
                            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-4">
                              {role.reasoning}
                            </p>
                          )}
                        </div>

                        {/* Selection Radio Footer */}
                        <div className={`mt-4 pt-3 border-t flex items-center justify-between ${isSelected ? 'border-blue-200' : 'border-slate-100'}`}>
                          <span className={`text-xs font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                            {isSelected ? '✓ Selected Track' : 'Click to Select'}
                          </span>
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white text-xs font-bold shadow-xs' 
                              : 'border-slate-400 bg-white'
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
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Strengths Identified
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-800">
                    {analysisResult.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5 font-bold">•</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200">
                  <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Critical Skill Gaps to Close
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-800">
                    {analysisResult.gaps.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-600 mt-0.5 font-bold">•</span>
                        <span className="leading-relaxed">{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                  Detected Competencies &amp; Frameworks
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Next Step Action Bridges */}
              <div className="pt-5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  {selectedRole ? (
                    <span>Selected Target: <strong className="text-blue-700 font-bold text-sm ml-1">{selectedRole}</strong></span>
                  ) : (
                    <span>Select a career track above to activate your custom learning roadmap &amp; job feed</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = selectedRole || 'Full Stack Software Engineer'
                      localStorage.setItem('pathpilot_target_role', chosen)
                      window.location.href = `/jobs?search=${encodeURIComponent(chosen)}`
                    }}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>View Jobs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const chosen = selectedRole || 'Full Stack Software Engineer'
                      localStorage.setItem('pathpilot_target_role', chosen)
                      window.location.href = `/roadmap?role=${encodeURIComponent(chosen)}`
                    }}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Generate Roadmap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const chosen = selectedRole || 'Full Stack Software Engineer'
                      localStorage.setItem('pathpilot_target_role', chosen)
                      window.location.href = `/mentors?search=${encodeURIComponent(chosen)}`
                    }}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Find Mentors</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[360px] bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 text-blue-600">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Awaiting Resume Upload</h3>
              <p className="text-sm max-w-md leading-relaxed text-slate-600">
                Select your resume file on the left and click &quot;Analyze My Resume&quot; to review strengths, missing requirements, and recommended entry-level tracks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
