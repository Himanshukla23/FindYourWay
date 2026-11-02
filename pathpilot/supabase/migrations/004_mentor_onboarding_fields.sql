-- ══════════════════════════════════════════════════════════════════════════════
-- PathPilot AI: Mentor Onboarding & Profile Schema Extension (Phase 2)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Add Onboarding & Profile Fields to mentor_profiles ────────────────────
ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS phone                TEXT,
  ADD COLUMN IF NOT EXISTS country              TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS timezone             TEXT DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS previous_experience  TEXT,
  ADD COLUMN IF NOT EXISTS education            TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url        TEXT,
  ADD COLUMN IF NOT EXISTS primary_domain       TEXT,
  ADD COLUMN IF NOT EXISTS target_roles         TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages            TEXT[] DEFAULT '{English}',
  ADD COLUMN IF NOT EXISTS consultation_types   TEXT[] DEFAULT '{"1-on-1 Mentorship", "Resume Review"}',
  ADD COLUMN IF NOT EXISTS consultation_format  TEXT DEFAULT 'Google Meet',
  ADD COLUMN IF NOT EXISTS target_audience      TEXT[] DEFAULT '{"College Students", "Early Career Engineers"}',
  ADD COLUMN IF NOT EXISTS weekly_capacity      INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS terms_accepted       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS draft_step           INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── 2. Add Row Level Security for Mentors to Update Their Own Profile ────────
CREATE POLICY "Mentors can insert their own profile"
  ON public.mentor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mentors can update their own profile"
  ON public.mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. Index for Mentor Search & Filtering ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_status ON public.mentor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user ON public.mentor_profiles(user_id);
