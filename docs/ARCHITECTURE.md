# PathPilot AI — Phase-Wise Architecture & Implementation Plan

> **Document Type:** Technical Architecture + Implementation Plan
> **Based On:** Problem Statement v1.0
> **Version:** 1.2
> **Date:** October 2026
> **Status:** Backend Services Complete (Phase 3 AI, Phase 4 Marketplace & Phase 5 Persistence Operational)

---

## Quick Reference: What We Need From You

Before we start or during specific phases, we need the following from you.
Each item is marked with the phase it is needed in.

| # | What We Need | Phase Needed | Why |
|---|---|---|---|
| 1 | **Supabase Project URL + Anon Key** | Phase 1 | Database, Auth, File Storage |
| 2 | **Supabase Service Role Key** | Phase 1 | Server-side DB operations |
| 3 | **Google Gemini API Key** OR **OpenAI API Key** | Phase 3 | Resume parsing, career AI, roadmap generation |
| 4 | **Razorpay Key ID + Key Secret** (optional) | Phase 4 | Real payment for mentor bookings |
| 5 | **SMTP / Email credentials** (optional) | Phase 4 | Booking confirmation emails |
| 6 | **Google OAuth Client ID + Secret** (optional) | Phase 1 | Social sign-in for students |
| 7 | **Vercel / Hosting details** (optional) | Phase 6 | Production deployment |

> If you do not have any of these yet, do not worry. Every phase has a working demo/mock mode. We will tell you exactly when we need each one.

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | Next.js 14 (App Router, TypeScript) | Full-stack, SSR, API routes, file-based routing |
| **Styling** | Tailwind CSS + shadcn/ui | Fast, consistent, accessible component system |
| **Database** | Supabase (PostgreSQL) | Auth + DB + Storage in one |
| **Auth** | Supabase Auth | Email/password + optional Google OAuth |
| **File Storage** | Supabase Storage | Private buckets for resume files |
| **AI Layer** | Google Gemini 1.5 Pro (primary) / OpenAI GPT-4o (fallback) | Best for structured JSON output |
| **AI Fallback** | Deterministic demo mode | When no API key is configured |
| **Payments** | Razorpay (India-first) | INR support, UPI, card |
| **Validation** | Zod | Schema validation on both client and server |
| **Forms** | React Hook Form + Zod | Accessible, validated forms |
| **State** | Zustand (client) + Supabase (persistent) | Lightweight, scalable |
| **PDF Parsing** | pdf-parse (server-side) | Extract raw text from PDF resumes |
| **DOCX Parsing** | mammoth (server-side) | Extract text from DOCX resumes |

---

## Project Folder Structure

```
pathpilot-ai/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Landing page
│   │   ├── sign-up/page.tsx
│   │   └── sign-in/page.tsx
│   ├── (auth)/
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── resume/page.tsx
│   │   ├── careers/page.tsx
│   │   ├── careers/[domain]/page.tsx
│   │   ├── careers/[domain]/[role]/page.tsx
│   │   ├── roadmap/page.tsx
│   │   ├── mentors/page.tsx
│   │   ├── mentors/[id]/page.tsx
│   │   ├── book/[mentorId]/page.tsx
│   │   ├── consultations/page.tsx
│   │   ├── consultations/[id]/page.tsx
│   │   └── profile/page.tsx
│   └── api/
│       ├── ai/
│       │   ├── parse-resume/route.ts
│       │   ├── career-recommendations/route.ts
│       │   ├── roadmap/route.ts
│       │   └── mentor-match/route.ts
│       ├── resume/route.ts
│       ├── bookings/route.ts
│       └── upload/route.ts
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── layout/                   # Sidebar, navbar, footer
│   ├── resume/
│   ├── career/
│   ├── roadmap/
│   ├── mentor/
│   └── dashboard/
├── lib/
│   ├── ai/
│   │   ├── provider.ts           # Switch between Gemini/OpenAI/demo
│   │   ├── resume-parser.ts
│   │   ├── career-advisor.ts
│   │   ├── roadmap-generator.ts
│   │   └── mentor-matcher.ts
│   ├── supabase/
│   ├── validators/               # Zod schemas
│   └── utils/
├── types/
├── data/                         # Seeded demo data (mentors, careers)
├── supabase/migrations/
├── .env.example
├── README.md
└── docs/
    ├── Problemstatement.md
    └── ARCHITECTURE.md
```

---

## Phase Overview

```
Phase 1 → Foundation         → Project setup, auth, DB schema, layout
Phase 2 → Core UI & Pages    → All pages built with static/demo content
Phase 3 → AI Features        → Resume parsing, career AI, roadmap AI
Phase 4 → Mentor Marketplace → Mentor discovery, booking, payments
Phase 5 → Persistence & Data → Real DB wiring, progress tracking, storage
Phase 6 → Polish & Deploy    → Testing, error handling, deployment
```

Each phase produces a working, testable state. We complete one phase fully before moving to the next.

---

# PHASE 1 — Foundation

**Goal:** Running Next.js app with authentication, database schema, and base layout shell.

**Deliverable:** A student can sign up, sign in, and reach an empty but navigable dashboard.

---

## 1.1 Project Initialisation

### What We Do
- Run `npx create-next-app@latest` with TypeScript, Tailwind CSS, App Router
- Install all core dependencies
- Create folder structure
- Create `.env.example` with all required variable names (no real values)
- Create `README.md` with setup instructions

### Dependencies to Install
```bash
# UI & Styling
npx shadcn@latest init
npm install class-variance-authority clsx tailwind-merge

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# State Management
npm install zustand

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# File Parsing (server-side)
npm install pdf-parse mammoth

# AI Providers
npm install @google/generative-ai openai

# Date & Utilities
npm install date-fns uuid lucide-react
```

### Environment Variables Needed
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **We need from you:** Supabase project URL, anon key, and service role key.
> If not ready, we proceed with a local demo mode.

---

## 1.2 Database Schema

### Tables to Create

```
profiles               - user identity and role
student_profiles       - degree, branch, college, year, graduation year
resumes                - file metadata, storage path, processing status
resume_analysis        - AI-generated structured analysis output
career_domains         - career domain catalogue (10 domains)
job_profiles           - entry-level job profiles per domain
career_recommendations - AI recommendations linked to a student
student_target_roles   - student's selected primary and saved roles
roadmaps               - generated roadmap per student per role
roadmap_phases         - phases within a roadmap
roadmap_tasks          - individual tasks with status and notes
mentor_profiles        - mentor data (seeded demo + future real)
mentor_availability    - weekly availability windows per mentor
available_slots        - concrete bookable date+time slots
bookings               - confirmed bookings with status
booking_followups      - mentor notes after a session
reviews                - student reviews of mentor sessions
saved_items            - saved job profiles and mentors
onboarding_responses   - onboarding questionnaire answers
consent_records        - resume processing consent log
```

### Row-Level Security Rules
- Students access only their own rows
- Mentor profiles are readable by all authenticated users
- Bookings visible only to the student and mentor involved
- Resume files are private to the file owner

---

## 1.3 Authentication

### What We Do
- Email + password sign-up and sign-in via Supabase Auth
- Optional Google OAuth (if Google Client ID provided)
- Middleware to protect all auth-required pages
- Session provider wrapping the app
- On first sign-in → redirect to onboarding

---

## 1.4 Base Layout Shell

### What We Do
- Global layout: sidebar on desktop, bottom nav on mobile
- Sidebar links: Dashboard, Resume, Careers, Roadmap, Mentors, Consultations, Profile
- Topbar with user avatar
- Design tokens applied globally

### Design Tokens
```
Primary:    Deep Navy #0F1B2D
Accent:     Violet #6C47FF
Background: Off-white #F8F9FC
Surface:    White #FFFFFF
Font:       Inter (Google Fonts)
Border:     12px cards, 8px inputs
```

---

## Phase 1 Exit Criteria

- [ ] `npm run dev` starts without errors
- [ ] Student can sign up and sign in
- [ ] Dashboard shell is reachable after sign-in
- [ ] Database schema created in Supabase
- [ ] Sidebar navigation works on desktop and mobile
- [ ] Middleware blocks unauthenticated access
- [ ] `.env.example` file is complete

---

---

# PHASE 2 — Core UI and All Pages

**Goal:** Every page built with correct layout and realistic seeded demo content. No real AI or DB wiring yet.

**Deliverable:** A fully navigable prototype where every button leads somewhere.

---

## 2.1 Landing Page

- Hero: headline, subheadline, two CTAs
- How it works: 5-step visual flow
- Feature highlights: 3 feature cards
- Career domain preview cards
- Footer

---

## 2.2 Onboarding Flow (4-Step Wizard)

**Step 1 — About You**
Full name, college, degree, branch, year of study, graduation year, city

**Step 2 — Your Interests**
Preferred career domains (multi-select), preferred work style, strongest subjects

**Step 3 — Your Goals**
Target outcome (internship/placement/freelance/higher studies), biggest challenge, time per week available

**Step 4 — Resume Choice**
Upload resume now OR skip — with clear consent message before any file selection

---

## 2.3 Student Dashboard

Sections:
1. Welcome banner
2. Profile completion progress bar
3. Resume status card
4. Career goal card
5. Roadmap progress card
6. Upcoming consultations card
7. Recommended mentors strip (3 cards)
8. Recommended next action (one primary CTA)
9. Recently completed tasks

Empty states for every section when no data exists.

---

## 2.4 Resume Analysis Page

**Upload Area**
- Drag-and-drop + file picker (PDF, DOCX, TXT, max 5 MB)
- Upload progress bar, processing spinner
- Consent checkbox required before processing
- Error states: wrong file type, too large, network error

**Extracted Data Review**
- Editable fields: education, skills, projects, experience, certifications
- Confirm and Analyse button

**Analysis Report**
- Resume summary card
- Strengths with evidence tags
- Skills tag cloud
- Career domain recommendation cards with suitability bars
- Skill gaps list
- Next steps list
- Follow-up question input (wired to AI in Phase 3)

---

## 2.5 Career Explorer Page

- Grid of 10 career domain cards
- Domain detail page: lists entry-level job profiles
- Job profile detail page: full role breakdown
- Role comparison modal (two-column side-by-side)
- "Select as My Target Role" button on each profile

**Each Job Profile Shows:**
- Role overview and daily responsibilities
- Required skills (tags)
- Tools and technologies
- Suggested projects
- Certifications
- Career progression path

---

## 2.6 Career Roadmap Page

- Phase timeline (sidebar on desktop, accordion on mobile)
- Each phase: description, estimated duration, task list
- Each task card: title, skill focus, resources, practical task, effort estimate, checklist
- Task status toggle: Not Started → In Progress → Completed
- Phase and overall progress bars
- Notes field per task
- Regenerate Roadmap button (triggers AI in Phase 3)

---

## 2.7 Mentor Directory Page

- Search bar (name, skill, domain)
- Filter sidebar: domain, experience, price range, availability, topic
- Sort: Relevance, Price, Experience
- Grid of mentor cards
- "AI Recommended for You" section (3 cards with match reason)

**Each Mentor Card Shows:**
Photo, name, title, organisation, domains, rating, price, next slot, Book Now

---

## 2.8 Mentor Profile Page

- Hero: photo, name, title, organisation, verified badge
- Bio and career journey
- Expertise tags
- "I can help with" list
- Session formats and prices table
- Available slots calendar
- Reviews section (seeded sample reviews)
- Sticky Book a Session CTA

---

## 2.9 Booking Flow (4-Step Wizard)

**Step 1 — Select Topic**
Career exploration / Role-specific advice / Resume review / Interview prep / Skill gap discussion / Other

**Step 2 — Choose Slot**
Date picker → available time slots

**Step 3 — Session Details**
Questions to ask, target role display, session duration, price summary

**Step 4 — Review and Confirm**
Full booking summary, demo checkout notice, Confirm button

**Booking Confirmation Page**
Booking ID, session details, preparation checklist, meeting link placeholder, ICS calendar download

---

## 2.10 My Consultations Page

- Upcoming sessions list
- Past sessions list

**Session Detail Page**
- Full session info
- Student preparation area (notes)
- Mentor follow-up section (read-only placeholder in MVP)
- Cancel booking button with confirmation modal

---

## 2.11 Student Profile and Settings Page

- Edit personal info
- Change password
- Saved job profiles
- Saved mentors
- Resume management: view, replace, delete
- Privacy and consent settings
- Delete account (with confirmation)

---

## Phase 2 Exit Criteria

- [ ] All pages render without errors
- [ ] Navigation works between all pages
- [ ] All forms have inline validation
- [ ] Seeded demo mentors display correctly
- [ ] Seeded career domains and job profiles display correctly
- [ ] Empty states display when no data exists
- [ ] Mobile and desktop layouts correct on all pages
- [ ] No non-functional button without a "coming soon" label

---

---

# PHASE 3 — AI Features

**Goal:** Connect AI-powered features to a real model. Build server-side AI service layer with demo fallback.

**Deliverable:** Resume upload triggers real AI parsing. Career recommendations and roadmap generated by AI.

---

## 3.1 AI Service Layer Architecture

A provider-agnostic service in `lib/ai/provider.ts`:

```typescript
AI_PROVIDER = 'gemini' | 'openai' | 'demo'
```

- `demo`: Returns clearly labelled deterministic sample responses
- `gemini`: Routes to Google Gemini 1.5 Pro
- `openai`: Routes to OpenAI GPT-4o

All AI outputs validated with Zod before being returned to the UI.

### Environment Variables Needed
```env
AI_PROVIDER=gemini
GOOGLE_GEMINI_API_KEY=
# OR
AI_PROVIDER=openai
OPENAI_API_KEY=
# OR
AI_PROVIDER=demo
```

> **We need from you:** A Google Gemini API key or OpenAI API key.
> Without one, set `AI_PROVIDER=demo` — everything still works with labelled demo output.

---

## 3.2 AI Service 1 — Resume Parser

**Route:** `POST /api/ai/parse-resume`

**Input:** Extracted plain text from the uploaded file

**Output (Zod-validated JSON):**
```typescript
{
  education: { degree, branch, college, graduation_year },
  skills: { technical: string[], non_technical: string[] },
  projects: { title, description, technologies }[],
  experience: { company, role, duration, description }[],
  certifications: string[],
  links: { type, url }[],
  inferred_interests: string[],
  confidence_notes: string
}
```

---

## 3.3 AI Service 2 — Career Domain Recommender

**Route:** `POST /api/ai/career-recommendations`

**Input:** Parsed resume JSON + onboarding questionnaire answers

**Output:** 3–5 recommended domains with suitability scores, evidence, gaps, and next steps

---

## 3.4 AI Service 3 — Job Profile Recommender

**Route:** `POST /api/ai/job-profiles`

**Input:** Selected career domain + student background

**Output:** Ranked entry-level job profiles within the domain

---

## 3.5 AI Service 4 — Roadmap Generator

**Route:** `POST /api/ai/roadmap`

**Input:** Selected job profile + student background + graduation date + hours per week available

**Output:** Full personalised roadmap with phases, tasks, resources, and completion criteria

---

## 3.6 AI Service 5 — Follow-Up Career Questions

**Route:** `POST /api/ai/follow-up`

**What It Does:**
- After initial analysis, AI generates 3–5 targeted follow-up questions
- Student answers refine career recommendations
- Questions are role-specific (not generic)

---

## 3.7 AI Service 6 — Mentor Matcher

**Route:** `POST /api/ai/mentor-match`

**Input:** Student target role + skill gaps + consultation goal + budget

**Output:** Ranked mentor profiles with match explanations

---

## Phase 3 Exit Criteria

- [ ] Resume upload → text extraction → AI parsing → extracted data shown to student
- [ ] Student can edit extracted data before analysis
- [ ] Career recommendations generated by AI (or labelled demo output)
- [ ] Roadmap generated for selected role by AI (or labelled demo output)
- [ ] All AI outputs Zod-validated — invalid AI responses produce graceful errors
- [ ] API keys never exposed in client-side code
- [ ] Demo mode clearly labelled in the UI when active

---

---

# PHASE 4 — Mentor Marketplace

**Goal:** Full mentor booking experience with real data and optional payment integration.

**Deliverable:** Student can discover mentors, view profiles, select a slot, and complete a booking.

---

## 4.1 Mentor Data Seeding

- 20–30 sample mentor profiles across all career domains
- Each tagged `is_demo_profile = true` — shows a "Sample Profile" badge
- Realistic but fictional names, titles, organisations, bios, expertise
- Domains covered: Software Dev, Cybersecurity, Data Analytics, Product Management, Cloud/DevOps, UI/UX, Digital Marketing, Business Analysis, Finance, Consulting

---

## 4.2 Mentor Availability and Slot System

- Each mentor has pre-configured weekly availability (e.g. Mon–Fri 6PM–9PM IST)
- Auto-generate bookable 30-minute and 60-minute slots for the next 30 days
- Mark slots booked on confirmation
- Prevent double-booking of the same slot

---

## 4.3 Booking Flow with Demo Checkout

**Demo Checkout (always available)**
- Displays: "This is a demo booking. No payment will be taken."
- Creates booking record with `is_demo_booking = true`, status `DEMO_CONFIRMED`
- Shown in My Consultations with a demo badge

**Real Razorpay Checkout (if credentials provided)**
- Razorpay order created server-side
- Razorpay checkout widget opens in browser
- On success: booking confirmed, slot marked booked
- On failure: booking pending, slot released after 15 minutes

### Environment Variables Needed (optional)
```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

> **We need from you (optional):** Razorpay Key ID and Key Secret for real payments.
> Platform works fully without them using demo checkout.

---

## 4.4 Booking Confirmation and Email

- Booking confirmation page always shown after booking
- ICS calendar file download link
- Meeting link: placeholder or Google Meet link
- Email confirmation sent to student (if SMTP configured)

---

## 4.5 Cancellation Workflow

- Cancel button on session detail page
- Confirmation modal
- On confirm: status → `CANCELLED`, slot released
- If real payment: "Refund will be processed in 5–7 days" message shown

---

## Phase 4 Exit Criteria

- [x] 20+ demo mentor profiles visible in directory
- [x] Search, filter, and sort work on mentor directory
- [x] Mentor profile page shows all sections correctly
- [x] Available slots load and disable already-booked slots
- [x] Booking flow completes end-to-end (demo mode)
- [x] Booking appears in My Consultations after confirmation
- [x] Cancellation updates booking status correctly and releases slot
- [x] If Razorpay configured: payment flow works (signature verification & order creation)
- [x] Demo bookings are clearly labelled — never misrepresented as real payments
- [x] RFC 5545 iCalendar (.ics) generation for 1-click calendar sync


---

---

# PHASE 5 — Persistence, Progress Tracking, and Data Wiring

**Goal:** Connect every feature to the real database. All student data private and secure.

**Deliverable:** Close the browser, return later, see all progress exactly as left.

---

## 5.1 Resume Storage

- Files stored in a private Supabase Storage bucket (`resumes/`)
- Access policy: only file owner can read or delete
- File metadata in `resumes` table
- File type validated server-side using magic bytes (not just extension)
- Max 5 MB enforced server-side
- Soft-delete first, hard-delete after 30 days

---

## 5.2 Roadmap Progress Persistence

- Every task status change immediately saved to Supabase
- Notes and project links auto-saved with debounce
- Progress percentages calculated server-side
- Roadmap regeneration creates a new record, keeps old roadmap in history

---

## 5.3 Saved Items

- Students save/unsave job profiles and mentor profiles
- Persisted to `saved_items` table
- Visible in Profile and Settings page

---

## 5.4 AI Analysis History

- Every AI analysis saved to `resume_analysis` table
- Students can view previous analyses

---

## 5.5 Row-Level Security Audit

- Verify every table has correct RLS policies
- Test: Student A cannot read Student B's resume, analysis, roadmap, or bookings
- Test: Mentor profiles readable by all authenticated students
- Test: Booking details visible only to student and mentor involved

---

## Phase 5 Exit Criteria

- [x] Resume file in private Storage with magic bytes validation and metadata in DB
- [x] Roadmap task status persists with debounced auto-save & server-side percentage calculation
- [x] Dashboard reflects latest persistent state after refresh
- [x] Student data privacy and RLS schemas in place
- [x] Resume deletion removes file and performs soft-delete
- [x] Onboarding responses load correctly on profile page
- [x] AI analysis history retrievable


---

---

# PHASE 6 — Polish, Testing, and Deployment

**Goal:** Fix bugs, ensure accessibility, deploy to production.

**Deliverable:** Production-ready MVP passing all acceptance criteria.

---

## 6.1 End-to-End Test Checklist

```
[x] Sign up → sign in
[x] Complete onboarding (all 4 steps)
[x] Upload PDF resume → verify extraction
[x] Review and edit extracted data
[x] View AI career recommendations
[x] Answer follow-up questions → see refined recommendations
[x] Browse Career Explorer → open job profile
[x] Select target role
[x] View generated roadmap
[x] Mark 3 tasks complete → verify progress update
[x] Browse mentor directory → search and filter
[x] Open mentor profile
[x] Complete demo booking
[x] Verify booking in My Consultations
[x] View session detail page
[x] Cancel booking → verify status update
[x] Dashboard widgets show correct data
[x] Sign out → sign in → verify all data persists
[x] Test on 375px mobile viewport
```

---

## 6.2 Error Handling Audit

- Every API route returns structured error responses
- AI failures show user-friendly messages with demo fallback
- File upload errors give specific actionable messages
- Form validation errors are inline and clear
- 404 page for unknown routes
- Loading states on all data-fetching operations

---

## 6.3 Accessibility Audit

- All interactive elements have accessible labels
- Keyboard navigation works across all forms and modals
- Focus states clearly visible
- Colour contrast meets WCAG AA

---

## 6.4 Production Deployment

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER=groq
GROQ_API_KEY=
GOOGLE_GEMINI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

> **Deployment Options:** Vercel (Next.js frontend) + Render / Railway / Docker (FastAPI backend).

---

## Phase 6 Exit Criteria (= MVP Complete)

- [x] Student can create account and reach dashboard
- [x] Onboarding responses can be entered, edited, and saved
- [x] Resume can be uploaded and processed (or demo shown)
- [x] Extracted resume data can be reviewed and corrected
- [x] Career domains display with evidence-based explanations
- [x] Student can select job profile and view role-specific roadmap
- [x] Student can mark tasks complete and see progress update
- [x] Student can browse, search, filter, and open mentor profiles
- [x] Mentor recommendation shows relevant mentors with match reason
- [x] Student can select slot and create test or real booking
- [x] Booking status appears on dashboard
- [x] Data persists across navigation and refresh
- [x] Invalid inputs and AI failures produce helpful messages
- [x] All major pages responsive with working navigation
- [x] No decorative or non-functional button without a label
- [x] App installs, configures, and launches using documented commands

---

---

## Complete API and Credentials Reference

| Credential | Phase | Required? | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 1 | **Required** | Database and auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 1 | **Required** | Public Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | 1 | **Required** | Server-side DB operations |
| `GOOGLE_GEMINI_API_KEY` | 3 | Optional (demo mode if absent) | Resume parsing, career AI, roadmap |
| `OPENAI_API_KEY` | 3 | Optional (alternative to Gemini) | Same as above |
| `AI_PROVIDER` | 3 | Optional (defaults to `demo`) | Switch between gemini/openai/demo |
| `RAZORPAY_KEY_ID` | 4 | Optional (demo checkout if absent) | Real payments |
| `RAZORPAY_KEY_SECRET` | 4 | Optional | Payment verification |
| `SMTP_HOST/USER/PASS` | 4 | Optional (no emails if absent) | Booking confirmation emails |
| `GOOGLE_CLIENT_ID` | 1 | Optional | Google OAuth sign-in |
| `GOOGLE_CLIENT_SECRET` | 1 | Optional | Google OAuth sign-in |
| `NEXT_PUBLIC_APP_URL` | 6 | Required for production | Correct URLs in emails and redirects |

---

## Five Questions We Need Answered Before Starting

**1. Do you have a Supabase account?**
- Yes → Share Project URL, Anon Key, and Service Role Key
- No → We use local demo mode; you add Supabase later

**2. Which AI provider do you prefer?**
- Google Gemini (recommended — free tier available)
- OpenAI GPT-4o
- Start with demo mode (no key needed)

**3. Do you want Google OAuth ("Sign in with Google")?**
- Yes → Need Google Cloud Console Client ID and Secret
- No → Email/password only

**4. Payments for mentor bookings?**
- Real Razorpay (need Razorpay account)
- Demo checkout only for MVP

**5. Deployment preference?**
- Vercel (recommended for Next.js)
- Railway / Render / Self-hosted
- Just run locally for now

---

> **Document Owner:** Engineering Team, PathPilot AI
> **Status:** Ready for Phase 1 — awaiting answers to the 5 questions above
> **Next Step:** Answer the questions → we begin Phase 1 immediately
