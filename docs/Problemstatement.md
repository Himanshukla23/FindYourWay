# PathPilot AI — Problem Statement

> **Product Name:** PathPilot AI
> **Document Type:** Problem Statement
> **Version:** 1.0
> **Date:** October 2026
> **Audience:** Product, Engineering, Design, Stakeholders

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Background and Context](#2-background-and-context)
3. [Target Users](#3-target-users)
4. [Core Problem Statement](#4-core-problem-statement)
5. [Problem Breakdown](#5-problem-breakdown)
6. [Current Solutions and Their Gaps](#6-current-solutions-and-their-gaps)
7. [Impact of the Problem](#7-impact-of-the-problem)
8. [Opportunity](#8-opportunity)
9. [Proposed Solution Overview](#9-proposed-solution-overview)
10. [Success Metrics](#10-success-metrics)
11. [Constraints and Assumptions](#11-constraints-and-assumptions)
12. [Out of Scope](#12-out-of-scope)

---

## 1. Executive Summary

College students across India — particularly those from Tier-2 and Tier-3 institutions — face a critical and persistent gap between their current academic experience and the structured, personalised career guidance they need to become employable. They receive fragmented, often conflicting advice from multiple sources, have no structured way to translate their skills into a career plan, and cannot easily access experienced industry mentors who understand their specific goals.

**PathPilot AI** is designed to close this gap. It is an AI-powered career development platform that helps college students identify suitable career paths from their existing background, understand exactly what they need to learn, follow a personalised preparation roadmap, and book one-to-one consultations with industry professionals — all from one unified platform.

---

## 2. Background and Context

### The Indian Higher Education Landscape

India produces approximately **1.5 million engineering graduates** and millions more graduates across science, commerce, and arts disciplines every year. A large portion of these students graduate from Tier-2 and Tier-3 colleges that have:

- Limited industry exposure and placement cell resources
- Few connections to experienced professionals in competitive sectors
- No structured mechanism to give personalised career advice at scale
- Significant variation in curriculum relevance to industry expectations

### The Changing Job Market

The Indian job market for entry-level roles has shifted substantially:

- Technical roles now require domain-specific skills, tool proficiency, and demonstrable projects — not just a degree
- Roles such as SOC Analyst, Product Manager, Data Analyst, DevOps Engineer, and UI/UX Designer require targeted, role-specific preparation
- Employers increasingly screen for practical skills, certifications, and portfolio work in addition to academic qualifications
- The gap between what college curricula teach and what employers expect is widening

### The Information Overload Problem

Students have access to more career information than ever before — YouTube channels, LinkedIn posts, Reddit threads, online course platforms, AI chatbots, and career blogs. However, more information has not translated into better outcomes. Instead, it has created:

- Confusion about which advice applies to their specific background
- Difficulty distinguishing entry-level accessible roles from roles requiring significant experience
- Inability to turn scattered recommendations into a coherent, actionable plan
- Over-reliance on peer advice that may not reflect actual industry expectations

---

## 3. Target Users

### Primary Users

| Segment | Description | Key Need |
|---|---|---|
| **First-year students** | Exploring potential career paths with little industry awareness | Career discovery and exploration |
| **Second and third-year students** | Selecting a specialisation, building skills, seeking internships | Structured roadmap and skill-gap identification |
| **Final-year students** | Preparing for placements, refining resumes, practising interviews | Placement strategy and mentor access |
| **Recent graduates** | Seeking first jobs or considering a career transition | Role-specific preparation and professional guidance |

### Geographic and Institutional Focus

- **Primary market:** Indian college students, with emphasis on Tier-2 and Tier-3 college students who have limited access to structured career support
- **Designed for:** Future extensibility to students in other countries and education systems

### User Characteristics

- Age range: 18–26 years
- Limited professional network and industry exposure
- Varying levels of technical background and digital literacy
- Budget-conscious; unable to afford expensive coaching or career counselling consistently
- Motivated but uncertain about how to direct their effort

---

## 4. Core Problem Statement

> **"How might we help college students identify suitable entry-level career opportunities from their existing skills and experience, understand the gaps they need to close, follow a personalised preparation roadmap, and access relevant industry mentors whenever they need guidance — all from one platform?"**

---

## 5. Problem Breakdown

### Problem 1: Students Cannot Translate Their Background Into a Career Direction

Most students cannot answer three fundamental questions with confidence:

1. Which career paths are realistically suited to my current background?
2. Which specific entry-level job roles should I be targeting?
3. What do I need to learn, build, or demonstrate to qualify for those roles?

Students know their degree, their courses, and the projects they have worked on — but they do not have a structured way to map this information to industry role requirements. A Computer Science student may not know whether they are more suited for frontend development, data analytics, DevOps, or cybersecurity — and what differentiates those paths in terms of day-to-day work and preparation requirements.

**Root causes:**
- College curricula are broad and do not map clearly to specific job roles
- Students lack exposure to what different roles actually involve on a daily basis
- There is no personalised translation layer between academic experience and job market requirements

---

### Problem 2: Career Advice Is Fragmented, Generic, and Unverifiable

Students receive advice from many sources simultaneously — college placement cells, seniors, online content creators, AI chatbots, and career counsellors. This advice often:

- Contradicts itself across sources
- Is based on outdated or anecdotal information
- Does not account for the student's specific background, skills, or target role
- Cannot be easily verified against actual industry hiring requirements
- Is expressed at a generic level that cannot be converted into a specific action plan

A student who asks "How do I become a data analyst?" may receive ten different answers from ten different sources, with no way to determine which advice is relevant to their specific situation.

**Root causes:**
- No single source integrates a student's individual background with role-specific requirements
- Generic content creation is optimised for broad audiences, not individual circumstances
- Students lack the domain knowledge to evaluate which advice applies to them

---

### Problem 3: Students Cannot Convert Advice Into a Structured, Time-Bound Plan

Even when students receive good advice, they struggle to convert it into a prioritised, time-bound preparation plan. They do not know:

- Which skills to learn first, given their starting point
- How long realistic preparation takes for different milestones
- What projects to build to demonstrate competence for a specific role
- How to balance breadth and depth across multiple skill areas
- When they are "ready enough" to apply for internships or jobs

This leads to either unfocused effort spread too thin across many topics or excessive focus on a single area while neglecting other critical requirements.

**Root causes:**
- Career roadmaps require integration of role-specific knowledge, skill assessment, time estimation, and sequencing — a complex task that students cannot reliably do alone
- Off-the-shelf roadmaps do not account for a student's existing knowledge, academic year, or graduation timeline
- There is no structured mechanism to track progress and adjust the plan over time

---

### Problem 4: Access to Experienced Industry Professionals Is Unequal and Expensive

Industry professionals who can give genuinely personalised career advice — based on actual hiring experience, domain expertise, and familiarity with entry-level role requirements — are:

- Largely inaccessible to students from Tier-2 and Tier-3 colleges
- Not easily discoverable by students who do not know where to look
- Expensive to consult through formal coaching platforms
- Difficult to evaluate in advance — students cannot determine whether a mentor's experience is relevant to their specific goals before paying for a session
- Scattered across LinkedIn and informal networks with no standardised booking or consultation experience

Students from well-connected colleges or urban areas have a structural advantage in accessing professional networks. Students without these connections face a compounding disadvantage.

**Root causes:**
- No structured marketplace exists that matches students to mentors based on specific career goals and role requirements
- Existing platforms focus on general coaching or interview preparation, not role-specific career development
- The discovery, evaluation, and booking experience for career mentors is not designed for college students

---

### Problem 5: Career Support Is Not Persistent or Integrated

A student's career needs evolve across their college journey — from initial exploration in the first year to specialisation, internship preparation, placement preparation, and post-graduation job search. Existing tools do not support this evolution:

- Career counselling sessions are one-off and do not create a persistent record
- Online courses do not connect learning to a broader career plan
- Resume feedback is not integrated with career recommendations or mentor access
- Progress made on one platform is not reflected on another
- There is no single place where a student can track their entire career development arc

**Root causes:**
- Career tools are designed as point solutions (resume builders, course platforms, job boards, counselling apps) rather than as integrated, persistent career development systems
- No existing platform connects resume analysis, career recommendations, learning roadmaps, and mentor consultations in a single persistent workspace

---

## 6. Current Solutions and Their Gaps

| Solution | What It Offers | Key Gaps |
|---|---|---|
| **College placement cell** | Campus drives, resume review, occasional workshops | Not personalised; limited to partner companies; inconsistent quality |
| **LinkedIn** | Professional networking, job listings, industry content | Requires existing network; no personalised guidance; overwhelming |
| **Online course platforms (Coursera, Udemy)** | Structured learning content | No personalisation to individual background; no career mapping or roadmap |
| **AI chatbots (ChatGPT, Gemini)** | General career advice on demand | No persistent student profile; no resume integration; generic responses |
| **Career counsellors** | Personalised one-on-one sessions | Expensive; limited sessions; difficult to find domain-specific expertise |
| **YouTube and social media** | Career stories, advice, and tutorials | Not personalised; conflicting advice; no action plan |
| **Job boards (Naukri, LinkedIn Jobs)** | Entry-level job listings | No guidance on which roles to apply for or how to prepare |
| **Expert booking platforms (Topmate, Mentorship.io)** | Book sessions with professionals | No integration with resume, career goals, or preparation plan; generic discovery |

**The gap no existing solution addresses:** A platform that integrates resume analysis, personalised career recommendations, a role-specific preparation roadmap, and curated mentor matching in one persistent, student-centred workspace.

---

## 7. Impact of the Problem

### On Individual Students

- Students invest preparation time in the wrong areas, wasting months of effort
- Students apply for roles they are not suited for or overlook roles they could qualify for with targeted preparation
- Students from under-served colleges miss out on internships and placements due to lack of structured preparation, not lack of ability
- Students feel anxious and overwhelmed about career decisions, leading to avoidance and last-minute scrambling
- First-generation college students and students without professional family networks face the greatest disadvantage

### On Institutions

- College placement rates remain lower than they could be, even for capable students
- Placement cells cannot provide personalised guidance at scale
- Reputation and rankings are partially tied to placement outcomes

### On Employers

- Interview pipelines include poorly matched candidates who applied without understanding role requirements
- Entry-level hiring teams spend disproportionate time screening candidates who are not ready for the role
- The talent pipeline from Tier-2 and Tier-3 colleges is underutilised due to structural discovery and preparation gaps

---

## 8. Opportunity

### Why This Problem Is Solvable Now

Several recent developments make a platform like PathPilot AI both technically feasible and commercially timely:

1. **Large language models** can now parse resumes, generate structured career analysis, produce role-specific roadmaps, and match students to mentors with explainable reasoning — at a quality level that was not previously possible
2. **Growth of Indian edtech and career platforms** has demonstrated strong student demand for personalised, digital career support
3. **Increasing awareness among students** about the need to prepare for specific roles rather than simply obtaining a degree
4. **Professional willingness to mentor** — a significant and growing number of experienced professionals in India are willing to offer paid or subsidised career consultations to students
5. **Mobile and internet penetration** has made digital platforms accessible to students at Tier-2 and Tier-3 colleges

### Market Opportunity

- India has approximately **40 million college students**, with a significant share from Tier-2 and Tier-3 institutions
- The Indian edtech market is valued at over $6 billion and continues to grow
- Willingness to pay for career-relevant services is established and increasing among Indian students
- The mentor marketplace model (Topmate, Mentorship.io) has demonstrated product-market fit for the paid consultation model in India

---

## 9. Proposed Solution Overview

PathPilot AI addresses the identified problems through five integrated features:

### Feature 1: AI Resume Analysis
Upload a resume (PDF, DOCX, or TXT). The AI extracts structured information, identifies strengths and gaps, and generates a career readiness report — grounded in actual resume evidence and supplemented by a short interest questionnaire.

### Feature 2: Career Domain and Job Profile Explorer
Browse career domains and entry-level job profiles. View role-specific requirements, responsibilities, skills, tools, and suggested projects. Compare roles and select a primary target role.

### Feature 3: Personalised Career Roadmap
Receive an AI-generated, phase-by-phase preparation plan tailored to the selected role, current skill level, academic year, and graduation date. Track progress, mark tasks complete, and request AI explanations or alternatives.

### Feature 4: Mentor Marketplace
Discover and compare verified industry professionals. The system recommends mentors based on the student's target role, skill gaps, and consultation goals. Book a session through a structured booking flow.

### Feature 5: Student Dashboard
A persistent, personalised workspace that integrates resume summary, career recommendations, roadmap progress, upcoming consultations, and recommended next actions in one place.

---

## 10. Success Metrics

### Activation
- Percentage of new users who complete onboarding and upload or demo-analyse a resume within their first session
- Percentage of users who select a primary target role after viewing AI recommendations

### Engagement
- Percentage of users who return within 7 days of first session
- Average number of roadmap tasks marked complete per active user per week
- Average number of mentor profiles viewed per user per session

### Core Outcomes
- Number of mentor bookings created per month (real and demo)
- Percentage of users who complete at least one full roadmap phase
- User-reported confidence in their career direction (measured via optional in-app survey)

### Quality
- Accuracy of resume extraction as reported by students who review extracted data
- Percentage of AI career recommendations rated as relevant by the student
- Percentage of mentor bookings that result in a confirmed and completed session

### Trust and Safety
- Zero instances of student resume data being accessible to unauthorised users
- Zero instances of AI-generated claims being presented as guaranteed career outcomes

---

## 11. Constraints and Assumptions

### Constraints

- The MVP must be deliverable with a small engineering team
- AI API costs must be managed carefully; demo mode must function fully without live AI credentials
- Resume processing must comply with applicable data privacy obligations
- The platform must function on standard mobile browsers used by Tier-2 and Tier-3 college students
- Mentor profiles in the MVP may be seeded sample profiles, clearly identified as such

### Assumptions

- Students are willing to upload their resume in exchange for personalised career guidance when clear consent and privacy controls are provided
- A meaningful segment of Indian college students will pay for or book free/low-cost mentor consultations if the matching quality is high enough
- Experienced professionals are willing to offer paid consultations through a structured platform
- Large language models can produce career analysis and roadmap content that is sufficiently accurate and useful when grounded in student-provided data

---

## 12. Out of Scope

The following features are explicitly **not** part of the MVP:

- Job board scraping or live job listing aggregation
- College administration dashboards or institutional licensing
- Complex subscription tiers or in-platform course delivery
- Social feeds or peer community features
- Enterprise analytics or bulk student management
- Full video-conferencing infrastructure (meeting links to third-party services are acceptable)
- Mentor onboarding and verification workflows (MVP uses seeded sample mentor profiles)
- AI-generated salary data, job market demand statistics, or placement guarantees
- Support for non-Indian education systems in the initial release

---

> **Document Owner:** Product Team, PathPilot AI
> **Last Updated:** October 2026
> **Status:** Approved for MVP Development

---

*This document defines the problem that PathPilot AI is built to solve. It should be reviewed alongside the Product Requirements Document and Technical Architecture Specification before implementation begins.*
