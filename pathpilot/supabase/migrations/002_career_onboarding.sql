-- ============================================================
-- PathPilot AI — Career Onboarding Profile Schema
-- Phase 2 — Extended Student Profile for guided onboarding
-- ============================================================

-- ── Extended Career Onboarding Profiles ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.career_onboarding_profiles (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id               UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Step 1: Background
  full_name             TEXT NOT NULL DEFAULT '',
  avatar_url            TEXT,
  current_status        TEXT NOT NULL DEFAULT 'third_year'
                        CHECK (current_status IN (
                          'first_year', 'second_year', 'third_year', 'final_year',
                          'recent_graduate', 'working_professional', 'career_switcher', 'other'
                        )),
  degree                TEXT,
  branch                TEXT,
  college_name          TEXT,
  graduation_year       TEXT,
  years_experience      INTEGER,
  current_title         TEXT,
  country               TEXT DEFAULT 'India',
  preferred_location    TEXT DEFAULT '',
  resume_uploaded       BOOLEAN NOT NULL DEFAULT FALSE,
  resume_file_name      TEXT,
  resume_consent        BOOLEAN DEFAULT FALSE,

  -- Step 2: Career Goals
  career_interests      TEXT[] DEFAULT '{}',
  career_objective      TEXT DEFAULT 'explore_careers'
                        CHECK (career_objective IN (
                          'find_internship', 'first_job', 'campus_placements',
                          'explore_careers', 'career_switch', 'advance_current'
                        )),
  target_job_role       TEXT,
  preferred_activities  TEXT[] DEFAULT '{}',
  career_confidence     TEXT DEFAULT 'need_exploration'
                        CHECK (career_confidence IN ('exact_role', 'few_roles', 'need_exploration')),
  skills                JSONB DEFAULT '[]',
  primary_challenge     TEXT,

  -- Step 3: Preparation Plan
  hours_per_week        INTEGER DEFAULT 10,
  target_timeline       TEXT DEFAULT '6_months',
  preparation_level     TEXT DEFAULT 'just_starting',
  learning_preferences  TEXT[] DEFAULT '{}',
  help_areas            TEXT[] DEFAULT '{}',

  -- Step 4: Mentoring Preferences
  mentoring_skipped     BOOLEAN NOT NULL DEFAULT TRUE,
  mentoring_topics      TEXT[] DEFAULT '{}',
  mentor_language       TEXT DEFAULT 'English',
  session_budget        TEXT DEFAULT 'flexible',
  session_duration      INTEGER DEFAULT 30,
  availability_window   TEXT,

  -- Metadata
  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  current_step          INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 4),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.career_onboarding_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their career onboarding profile"
  ON public.career_onboarding_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_career_onboarding_user_id
  ON public.career_onboarding_profiles(user_id);
