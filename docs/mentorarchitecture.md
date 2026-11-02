# PathPilot AI - Two-Sided Platform & Mentor Architecture

## 1. Product Architecture Overview
PathPilot AI is extended into a two-portal platform serving two primary personas:
- **Students / Mentees**: Discover career options, analyze resumes, explore roadmaps, discover verified industry mentors, and book 1-on-1 consultations.
- **Mentors / Industry Professionals**: Manage their professional presence, define weekly and exception-based availability, manage consultation requests, and host genuine Google Meet sessions.

### Public Website Entry Points & Routes
- Homepage: `/`
- Student Sign In: `/student/sign-in`
- Student Sign Up: `/student/sign-up`
- Mentor Sign In: `/mentor/sign-in`
- Mentor Sign Up / Onboarding: `/mentor/sign-up`

### Student Portal Routes
- Dashboard: `/student/dashboard`
- Resume Analysis: `/student/resume-analysis`
- Career Explorer: `/student/career-explorer`
- Mentor Directory: `/student/mentors`
- Mentor Details & Booking: `/student/mentors/[id]`
- My Bookings: `/student/bookings`
- Student Profile: `/student/profile`

### Mentor Portal Routes
- Dashboard: `/mentor/dashboard`
- Profile Overview: `/mentor/profile`
- Edit Profile / Onboarding Wizard: `/mentor/profile/edit` (and `/mentor/onboarding`)
- Availability & Calendar: `/mentor/availability`
- Bookings List: `/mentor/bookings`
- Booking Details: `/mentor/bookings/[id]`
- Settings: `/mentor/settings`

---

## 2. Shared Authentication & Role-Based Access Control (RBAC)
- **Shared Auth Provider**: Built on Supabase Auth / SSR session cookies with fallback to localized persistent demo cookies.
- **Roles**:
  - `student`
  - `mentor`
  - `admin`
- **Role Redirection Logic**:
  - Student -> `/student/dashboard`
  - Mentor (Pending Approval / Incomplete Profile) -> `/mentor/profile`
  - Mentor (Approved) -> `/mentor/dashboard`
  - Admin -> `/admin/dashboard`
- **Security Invariants**:
  - Authentication identity and role are strictly decoupled. Selecting a portal does not grant unauthorized access.
  - Cross-portal blocking: Students are blocked from `/mentor/*` and Mentors are blocked from `/student/*`.
  - Only approved mentors can be listed on the student marketplace.

---

## 3. Database Architecture & Entities

### Core Tables
1. **`users` / `auth.users`**: Authenticated account credentials.
2. **`user_roles`**: Links `user_id` to `role` ('student', 'mentor', 'admin') and `status` ('active', 'pending_approval', 'approved', 'suspended').
3. **`student_profiles`**: Academic background, target roles, skills, resume history.
4. **`mentor_profiles`**: Full name, title, company, bio, years of experience, hourly/session rate, verification status (`draft`, `pending_approval`, `approved`, `rejected`), session durations (`[30, 45, 60]`).
5. **`mentor_expertise`**: Topics, career domains, job roles, skills, languages.
6. **`mentor_weekly_availability`**: Day of week (0-6), start_time, end_time, is_active.
7. **`mentor_availability_exceptions`**: Specific date overrides (block date, extra hours).
8. **`bookings`**: `student_id`, `mentor_id`, `topic`, `duration_minutes`, `scheduled_at`, `status` (`pending`, `confirmed`, `completed`, `cancelled`), `google_calendar_event_id`, `google_meet_link`.
9. **`mentor_calendar_connections`**: Mentor Google OAuth tokens for automatic calendar synchronization and Meet link creation.

---

## 4. Phase-Wise Implementation Roadmap

- **Phase 1: Dual-Portal Homepage & Shared RBAC Authentication** *(COMPLETED)*
  - Dual entry points on homepage (`/student/sign-in`, `/mentor/sign-in`, `/student/sign-up`, `/mentor/sign-up`).
  - Student and mentor value proposition sections.
  - Role-aware middleware with cross-portal redirection.
  - Safe signout flow.
  - Database role migration `003_dual_portal_roles.sql`.

- **Phase 2: Mentor Registration & Profile Management** *(COMPLETED)*
  - 5-step mentor onboarding wizard:
    - Step 1: Basic Information & Profile Photo
    - Step 2: Professional Experience (Title, Company, Years, LinkedIn)
    - Step 3: Mentoring Expertise (Domains, Topics, Supported Languages, Bio)
    - Step 4: Session Preferences (Durations: 30/45/60m, Pricing, Capacity)
    - Step 5: Review, Policy Acceptance & Submit for Approval
  - Draft saving support (can save incomplete drafts without submitting).
  - Profile completion progress indicator.
  - Editable profile pages at `/mentor/profile/edit`.
  - Profile preview modal/page.
  - Database schema migration `004_mentor_onboarding_fields.sql`.

- **Phase 3: Mentor Dashboard & Availability Calendar** *(COMPLETED)*
  - Weekly recurring availability engine (multiple intervals per day, breaks).
  - One-click copy Monday schedule to weekdays.
  - Calendar exceptions (date-specific blocks or additions with reasons).
  - Time zone-aware UTC calculations & settings (buffer, minimum notice, horizon).
  - Live availability API endpoint at `/api/mentor/availability`.
  - Database schema migration `005_mentor_availability.sql`.
  - Mentor overview dashboard widgets connected to live availability stats.

- **Phase 4: Booking Engine & Google Calendar / Meet Integration** *(COMPLETED)*
  - Real slot calculation taking into account weekly schedule, exceptions, and existing bookings (`lib/scheduling/slot-generator.ts`).
  - Strict double booking prevention via algorithmic collision check and database partial unique index.
  - Official Google Calendar API integration with `conferenceData.createRequest` and `conferenceDataVersion=1`.
  - Genuine Google Meet link handling and .ics RFC 5545 calendar file download.
  - Full Mentor Bookings Ledger at `/mentor/bookings` and API `/api/mentor/bookings` (complete/cancel status workflows).
  - Database schema migration `006_mentor_bookings.sql`.

- **Phase 5: Student Marketplace & Mentor Directory Integration** *(COMPLETED)*
  - Search and filter approved mentors by career domain, job role, pricing tier, and availability.
  - Public mentor profile with interactive slot picker connected to live availability.
  - Dedicated Student Portal routes (`/student/dashboard`, `/student/resume-analysis`, `/student/career-explorer`, `/student/mentors`, `/student/mentors/[id]`, `/student/bookings`, `/student/profile`).
  - Active navigation syncing across student sidebar.

- **Phase 6: Testing, Security Verification & Polish** *(COMPLETED)*
  - Next.js production build: 41 routes successfully generated and statically/dynamically optimized (`npm run build` exit code 0).
  - Full TypeScript type-checking passing with 0 diagnostic errors (`npx tsc --noEmit` exit code 0).
  - Backend API imports and routes verified (`main.py` syntax OK).
  - Resilient graceful degradation for demo, offline, and production environments.
