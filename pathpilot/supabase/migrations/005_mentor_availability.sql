-- ══════════════════════════════════════════════════════════════════════════════
-- PathPilot AI: Mentor Availability & Scheduling Architecture (Phase 3)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Weekly Recurring Availability ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_weekly_availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id       UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  day_of_week     INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday... 6=Saturday
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_slot_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_mentor_weekly_avail_mentor ON public.mentor_weekly_availability(mentor_id, day_of_week);

-- ── 2. Date-Specific Availability Exceptions / Blockouts ───────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_availability_exceptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id       UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  exception_date  DATE NOT NULL,
  is_unavailable  BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = whole day blocked; FALSE = custom hours
  start_time      TIME,
  end_time        TIME,
  reason          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_avail_exceptions_mentor_date ON public.mentor_availability_exceptions(mentor_id, exception_date);

-- ── 3. Mentor Scheduling Preferences & Buffers ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_scheduling_settings (
  mentor_id            UUID PRIMARY KEY REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  timezone             TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  buffer_minutes       INTEGER NOT NULL DEFAULT 15,
  notice_hours         INTEGER NOT NULL DEFAULT 4,
  max_weeks_in_advance INTEGER NOT NULL DEFAULT 4,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Row Level Security Policies ────────────────────────────────────────────
ALTER TABLE public.mentor_weekly_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_scheduling_settings ENABLE ROW LEVEL SECURITY;

-- Public read for booking engine
CREATE POLICY "Public read active weekly availability"
  ON public.mentor_weekly_availability FOR SELECT
  USING (true);

CREATE POLICY "Public read availability exceptions"
  ON public.mentor_availability_exceptions FOR SELECT
  USING (true);

CREATE POLICY "Public read scheduling settings"
  ON public.mentor_scheduling_settings FOR SELECT
  USING (true);

-- Mentor management policies (check ownership via mentor_profiles user_id)
CREATE POLICY "Mentors can manage own weekly availability"
  ON public.mentor_weekly_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles
      WHERE mentor_profiles.id = mentor_weekly_availability.mentor_id
      AND mentor_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can manage own exceptions"
  ON public.mentor_availability_exceptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles
      WHERE mentor_profiles.id = mentor_availability_exceptions.mentor_id
      AND mentor_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can manage own scheduling settings"
  ON public.mentor_scheduling_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles
      WHERE mentor_profiles.id = mentor_scheduling_settings.mentor_id
      AND mentor_profiles.user_id = auth.uid()
    )
  );
