import { NextRequest, NextResponse } from 'next/server'
import { executeAIPrompt } from '@/lib/ai/provider'

export async function POST(req: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }
    const {
      roleTitle = 'Full Stack Engineer',
      hoursPerWeek = 15,
      graduationYear = '2026',
      existingSkills = []
    } = body

    const existingSkillsContext = existingSkills.length > 0
      ? `The student already has some foundational familiarity with: ${existingSkills.join(', ')}. Accelerate past introductory basics and focus on high-leverage industry practices.`
      : 'Calibrate from first principles to industry-ready capstone.'

    const prompt = `
You are an engineering hiring director & tech career mentor designing an elite, production-grade technical roadmap for a college student targeting: "${roleTitle}".
Weekly dedication: ${hoursPerWeek} hours/week.
Target graduation / placement batch: ${graduationYear}.
Context: ${existingSkillsContext}

Create a realistic 5-milestone roadmap taking them from core fundamentals to a portfolio-grade capstone project ready for technical interviews.

Respond strictly with valid JSON without markdown wrapping:
{
  "role": "${roleTitle}",
  "estimatedWeeks": 8,
  "difficulty": "Intermediate",
  "prerequisites": ["Basic Programming Logic", "Git & GitHub"],
  "tasks": [
    {
      "id": "task-1",
      "phase": "Phase 1: Foundations & Core Architecture",
      "title": "Clear milestone title",
      "desc": "Detailed explanation of industry best practices, patterns, and what to study",
      "deliverable": "Specific tangible hands-on artifact to build (e.g., benchmark report, minimal proof-of-concept)",
      "hours": ${Math.round(hoursPerWeek * 0.8)},
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "resources": ["Official Documentation", "Recommended Open Source Reference"]
    },
    {
      "id": "task-2",
      "phase": "Phase 1: Foundations & Core Architecture",
      "title": "Clear milestone title",
      "desc": "Detailed explanation of industry best practices, patterns, and what to study",
      "deliverable": "Specific tangible hands-on artifact to build",
      "hours": ${hoursPerWeek},
      "skills": ["Skill 4", "Skill 5"],
      "resources": ["Architecture Patterns Guide", "Interactive Sandbox"]
    },
    {
      "id": "task-3",
      "phase": "Phase 2: Deep Dive & Systems Integration",
      "title": "Clear milestone title",
      "desc": "Detailed explanation of complex real-world mechanics (databases, APIs, telemetry)",
      "deliverable": "Integrated sub-module with test coverage",
      "hours": ${Math.round(hoursPerWeek * 1.1)},
      "skills": ["Skill 6", "Skill 7"],
      "resources": ["Production Best Practices Repo", "Performance Profiling Docs"]
    },
    {
      "id": "task-4",
      "phase": "Phase 2: Deep Dive & Systems Integration",
      "title": "Clear milestone title",
      "desc": "Scalability, security, CI/CD, or cross-functional execution details",
      "deliverable": "Automated deployment pipeline or telemetry dashboard",
      "hours": ${Math.round(hoursPerWeek * 1.2)},
      "skills": ["Skill 8", "Skill 9"],
      "resources": ["Security Standards Checklist", "CI/CD Pipeline Template"]
    },
    {
      "id": "task-5",
      "phase": "Phase 3: Production Capstone & Interview Portfolio",
      "title": "Production Capstone Project",
      "desc": "End-to-end deployed portfolio application demonstrating enterprise readiness",
      "deliverable": "Public GitHub repository with comprehensive README, live deployed URL, and architecture diagram",
      "hours": ${Math.round(hoursPerWeek * 1.6)},
      "skills": ["End-to-End Architecture", "Production Deployment", "Portfolio Presentation"],
      "resources": ["System Design Primer", "Portfolio Case Study Template"]
    }
  ],
  "capstoneProject": {
    "title": "Flagship Portfolio Capstone for ${roleTitle}",
    "description": "Comprehensive project that proves competency to senior engineering interviewers.",
    "deliverables": [
      "Live deployed application with custom domain or Vercel URL",
      "Modular clean code with automated test coverage",
      "Technical writeup detailing architecture decisions and performance tradeoffs"
    ],
    "recommendedStack": ["Modern Web/Backend Stack", "PostgreSQL / Supabase", "Docker / Cloud Platform"]
  }
}
`

    const aiRes = await executeAIPrompt({
      prompt,
      systemInstruction: 'You are an elite technical mentor designing syllabus roadmaps. Always respond strictly with valid JSON without markdown fences.',
      responseJson: true,
    })

    if (aiRes.content) {
      try {
        const cleanContent = aiRes.content
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim()
        const parsed = JSON.parse(cleanContent)

        return NextResponse.json({
          success: true,
          data: parsed,
          providerUsed: aiRes.providerUsed,
          model: aiRes.model,
        })
      } catch (jsonErr) {
        console.warn('Roadmap AI JSON parsing issue:', jsonErr)
      }
    }

    // Dynamic tailored fallback if APIs are temporarily unreachable
    const isSoftware = roleTitle.toLowerCase().includes('software') || roleTitle.toLowerCase().includes('engineer') || roleTitle.toLowerCase().includes('backend') || roleTitle.toLowerCase().includes('developer')
    const isProduct = roleTitle.toLowerCase().includes('product') || roleTitle.toLowerCase().includes('apm') || roleTitle.toLowerCase().includes('manager')
    const isData = roleTitle.toLowerCase().includes('data') || roleTitle.toLowerCase().includes('ml') || roleTitle.toLowerCase().includes('ai')

    let fallbackData = {
      role: roleTitle,
      estimatedWeeks: 8,
      difficulty: 'Intermediate',
      prerequisites: ['Foundational CS Concepts', 'Modern Git Workflow'],
      tasks: [
        {
          id: 'task-1',
          phase: 'Phase 1: Foundations & Architecture',
          title: 'Core Domain Fundamentals & Best Practices',
          desc: `Master modern idioms, design patterns, and industry toolchains essential for ${roleTitle}.`,
          deliverable: 'Configured development environment, linting rules, and foundational reference repo.',
          hours: 12,
          skills: ['Domain Fundamentals', 'Clean Architecture', 'Version Control'],
          resources: ['Official Documentation', 'Best Practices Guide']
        },
        {
          id: 'task-2',
          phase: 'Phase 1: Foundations & Architecture',
          title: 'System Design & State Flow Management',
          desc: 'Architect scalable data flows, robust error-handling patterns, and high-concurrency protocols.',
          deliverable: 'Functional micro-module adhering to strict separation of concerns.',
          hours: 16,
          skills: ['State Design', 'Error Handling', 'Modular Systems'],
          resources: ['System Design Primer', 'Pattern Sandbox']
        },
        {
          id: 'task-3',
          phase: 'Phase 2: Deep Implementation & Telemetry',
          title: 'Relational Database Schema & API Contracts',
          desc: 'Design normalized schemas with PostgreSQL/Supabase, define strictly typed API endpoints, and establish Row Level Security.',
          deliverable: 'Tested database migration scripts with verified API contract tests.',
          hours: 18,
          skills: ['PostgreSQL', 'API Contract Design', 'Row Level Security'],
          resources: ['PostgreSQL Schema Best Practices', 'REST/GraphQL API Standards']
        },
        {
          id: 'task-4',
          phase: 'Phase 2: Deep Implementation & Telemetry',
          title: 'Production Observability & Automated CI/CD',
          desc: 'Implement structured telemetry, automated GitHub Actions test pipelines, and containerization with Docker.',
          deliverable: 'Green CI/CD deployment pipeline with automated preview environments.',
          hours: 20,
          skills: ['Docker', 'GitHub Actions', 'Telemetry & Logging'],
          resources: ['Docker Multi-stage Builds', 'CI/CD Workflow Blueprints']
        },
        {
          id: 'task-5',
          phase: 'Phase 3: Production Capstone & Interview Portfolio',
          title: 'Capstone: End-to-End Flagship Application',
          desc: `Build and launch a production-ready application showcasing verified expertise in ${roleTitle}.`,
          deliverable: 'Live web deployment with verified metrics, comprehensive README, and case study teardown.',
          hours: 28,
          skills: ['Production Deployment', 'Portfolio Architecture', 'Interview Storytelling'],
          resources: ['System Architecture Case Studies', 'Tech Portfolio Checklist']
        }
      ],
      capstoneProject: {
        title: `Production Portfolio Capstone for ${roleTitle}`,
        description: 'Comprehensive, deployable application that demonstrates end-to-end technical maturity.',
        deliverables: [
          'Live deployed URL accessible to recruiters',
          'Production test suite with unit and integration tests',
          'Comprehensive architectural README with tradeoffs analysis'
        ],
        recommendedStack: ['TypeScript / Next.js', 'PostgreSQL / Supabase', 'Docker', 'Vercel / Cloud']
      }
    }

    if (isProduct) {
      fallbackData.tasks = [
        {
          id: 'task-1',
          phase: 'Phase 1: Foundations & Discovery',
          title: 'Customer Discovery & Qualitative Synthesis',
          desc: 'Conduct 10+ structured user discovery interviews, identify core pain points, and map user journey frictions.',
          deliverable: 'Customer Interview Synthesis Deck with categorized user personas.',
          hours: 14,
          skills: ['User Interviews', 'Customer Discovery', 'Persona Mapping'],
          resources: ['The Mom Test Guide', 'Qualitative Synthesis Frameworks']
        },
        {
          id: 'task-2',
          phase: 'Phase 1: Foundations & Discovery',
          title: 'High-Fidelity PRD Specs & RICE Prioritization',
          desc: 'Draft comprehensive Product Requirement Documents with edge-case handling, acceptance criteria, and RICE scoring.',
          deliverable: 'Complete PRD with user stories and engineering acceptance criteria.',
          hours: 16,
          skills: ['PRD Writing', 'RICE Scoring', 'Acceptance Criteria'],
          resources: ['Modern PRD Templates', 'Feature Prioritization Matrix']
        },
        {
          id: 'task-3',
          phase: 'Phase 2: Quantitative Telemetry & Execution',
          title: 'Product Metrics & Quantitative Analytics (SQL + Mixpanel)',
          desc: 'Define north-star metrics, build funnel conversion dashboards, and analyze cohort retention with SQL queries.',
          deliverable: 'Interactive Mixpanel/PostHog dashboard tracking core user funnels.',
          hours: 16,
          skills: ['Product Analytics', 'SQL Queries', 'Funnel Optimization'],
          resources: ['SQL for Product Managers', 'Cohort Analysis Blueprint']
        },
        {
          id: 'task-4',
          phase: 'Phase 2: Quantitative Telemetry & Execution',
          title: 'GTM Strategy & Agile Sprint Synchronization',
          desc: 'Coordinate sprint planning with engineering teams, refine backlogs, and write public product launch changelogs.',
          deliverable: 'Sprint Backlog Board and GTM Launch Communication Plan.',
          hours: 18,
          skills: ['Sprint Planning', 'GTM Launch', 'Jira / Linear'],
          resources: ['GTM Strategy Checklist', 'Agile Product Management Handbook']
        },
        {
          id: 'task-5',
          phase: 'Phase 3: Capstone Product Teardown',
          title: 'Capstone: End-to-End AI Product Teardown & Case Study',
          desc: 'Publish an in-depth product teardown and prototype with user traction data and executive pitch deck.',
          deliverable: 'Live interactive product prototype and executive strategy case study.',
          hours: 24,
          skills: ['Product Teardown', 'Executive Pitch', 'Product Portfolio'],
          resources: ['Lenny’s Product Case Studies', 'Executive Presentation Deck Guide']
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: fallbackData,
      providerUsed: 'demo',
      model: 'calibrated-rules',
    })
  } catch (error: any) {
    console.error('Roadmap API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate roadmap' },
      { status: 500 }
    )
  }
}
