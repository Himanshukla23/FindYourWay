/**
 * Recruiter & Demo Session Helper
 * Seeds rich, realistic candidate APM data so recruiters and reviewers
 * can test the full platform without registration, email verification,
 * or onboarding hurdles.
 */

export function seedRecruiterDemoSession(role: 'student' | 'mentor' = 'student') {
  if (typeof window === 'undefined') return

  // Set cookies so middleware recognizes authenticated & onboarded state
  document.cookie = 'pathpilot_demo_session=true; path=/; max-age=86400'
  document.cookie = 'pathpilot_onboarded=true; path=/; max-age=86400'
  document.cookie = `pathpilot_user_role=${role}; path=/; max-age=2592000`

  localStorage.setItem('pathpilot_demo_session', 'true')
  localStorage.setItem('pathpilot_user_role', role)
  localStorage.setItem('pathpilot_onboarding_completed', 'true')

  if (role === 'student') {
    localStorage.setItem('pathpilot_target_role', 'Technical AI Product Manager')
    localStorage.setItem(
      'pathpilot_student_profile',
      JSON.stringify({
        full_name: 'Himanshu Shukla',
        degree: 'Bachelor of Technology (B.Tech)',
        branch: 'Electronics & Communication',
        college: 'Madan Mohan Malaviya University of Technology',
        grad_year: '2025',
        current_status: 'recent_graduate',
        target_job_role: 'Technical AI Product Manager',
        targetRole: 'Technical AI Product Manager',
        primary_goal: 'Land an APM or Technical Product Manager role in high-growth AI / B2B SaaS',
        career_interests: ['product_mgmt', 'data_analytics'],
        hours_per_week: 12,
        resume_uploaded: true,
        resume_file_name: 'Himanshu_Shukla_Product_Manager_Resume.pdf',
        skills: [
          { name: 'Product Roadmapping', level: 'advanced', category: 'Core PM' },
          { name: 'PRDs & Functional Specs', level: 'advanced', category: 'Core PM' },
          { name: 'RICE Prioritization', level: 'advanced', category: 'Core PM' },
          { name: 'User Discovery Interviews', level: 'advanced', category: 'Core PM' },
          { name: 'RAG Guardrails & Grounding', level: 'advanced', category: 'Technical AI' },
          { name: 'SQL & Telemetry', level: 'intermediate', category: 'Analytics' },
          { name: 'Python', level: 'intermediate', category: 'Technical' },
          { name: 'A/B Testing & VoC', level: 'intermediate', category: 'Growth' },
          { name: 'Figma & Whimsical', level: 'advanced', category: 'Design & Specs' },
          { name: 'Jira & Agile Sprints', level: 'advanced', category: 'Execution' },
        ],
        onboarding_completed: true,
      })
    )

    localStorage.setItem(
      'pathpilot_resume_analysis',
      JSON.stringify({
        summary: 'Top 1% NextLeap Product Management Fellow with demonstrated ability shipping 0-to-1 AI platforms, leading B2B distributor discovery at Rootlex, and coordinating 100+ D2C merchant accounts at Shiprocket.',
        strengths: [
          'Demonstrated 0-to-1 product execution: Specced and launched PathPilot AI with Gemini/Groq failover and Google Meet/Calendar OAuth automation.',
          'B2B customer discovery & PRD authoring: Mapped distributor workflows across 20+ regional distributors at Rootlex, reducing turnaround by ~25%.',
          'Technical AI product fluency: Authored RICE-prioritized roadmaps for Grounding (AI assumption layer) and semantic vector search in GrowwAI.'
        ],
        skills: [
          'Product Roadmapping',
          'PRDs & User Stories',
          'RICE Prioritization',
          'Customer Journey Mapping',
          'User Discovery',
          'A/B Testing',
          'SQL',
          'Python',
          'RAG Guardrails',
          'Mixpanel',
          'Jira'
        ],
        gaps: [
          'Large-scale enterprise pricing packaging & commercial sales enablement',
          'Multi-region data compliance frameworks (GDPR / DPDP compliance)'
        ],
        recommendedRoles: [
          {
            title: 'Technical AI Product Manager / APM',
            domain: 'Product Management',
            category: 'Primary Target',
            match: 95,
            reasoning: 'Candidate combines rigorous technical foundations (B.Tech, APIs, SQL, RAG) with proven PRD drafting, RICE scoring, and frontline merchant discovery experience.'
          },
          {
            title: 'Product Operations Analyst',
            domain: 'Operations & Analytics',
            category: 'Adjacent Pivot',
            match: 88,
            reasoning: 'Direct experience managing 100+ merchant accounts and tracking Return-to-Origin bottlenecks at Shiprocket.'
          }
        ]
      })
    )
  } else {
    // Mentor profile
    localStorage.setItem(
      'pathpilot_mentor_profile',
      JSON.stringify({
        full_name: 'Himanshu Shukla (Mentor Demo)',
        headline: 'Technical PM & Product Builder',
        company: 'PathPilot AI / NextLeap Top Fellow',
        hourly_rate: 0,
        bio: 'Demonstrated product leader helping students break into technical product management.',
        expertise: ['Product Management', 'Technical Architecture', 'Resume Teardowns'],
      })
    )
  }
}
