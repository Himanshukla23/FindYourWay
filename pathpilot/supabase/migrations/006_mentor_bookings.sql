-- ══════════════════════════════════════════════════════════════════════════════
-- PathPilot AI: Mentor Bookings & Concurrency Architecture (Phase 4)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Bookings Table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id                UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  student_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name             TEXT NOT NULL,
  student_email            TEXT NOT NULL,
  mentor_name              TEXT NOT NULL,
  booking_date             DATE NOT NULL,
  start_time               TIME NOT NULL,
  end_time                 TIME NOT NULL,
  duration_minutes         INTEGER NOT NULL DEFAULT 30,
  topic                    TEXT NOT NULL,
  notes                    TEXT,
  status                   TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'DEMO_CONFIRMED')),
  amount_inr               NUMERIC(10, 2) NOT NULL DEFAULT 0,
  google_calendar_event_id TEXT,
  google_meet_link         TEXT,
  google_calendar_status   TEXT DEFAULT 'AWAITING_CREDENTIALS',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Concurrency Control: Strictly prevent two students from booking the same mentor at the same time
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_mentor_booking
  ON public.bookings (mentor_id, booking_date, start_time)
  WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_bookings_mentor_date ON public.bookings(mentor_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_student_email ON public.bookings(student_email);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON public.bookings(student_id);

-- ── 2. Mentor Google Calendar OAuth Integration ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_calendar_connections (
  mentor_id       UUID PRIMARY KEY REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL DEFAULT 'google',
  connected_email TEXT,
  refresh_token   TEXT,
  access_token    TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Row Level Security Policies ────────────────────────────────────────────
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_calendar_connections ENABLE ROW LEVEL SECURITY;

-- Students can read their own bookings
CREATE POLICY "Students can view own bookings"
  ON public.bookings FOR SELECT
  USING (
    student_id = auth.uid() OR
    student_email = auth.jwt()->>'email'
  );

-- Mentors can view bookings assigned to them
CREATE POLICY "Mentors can view own consultations"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles
      WHERE mentor_profiles.id = bookings.mentor_id
      AND mentor_profiles.user_id = auth.uid()
    )
  );

-- Mentors can update booking status (complete, cancel)
CREATE POLICY "Mentors can update own consultation status"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles
      WHERE mentor_profiles.id = bookings.mentor_id
      AND mentor_profiles.user_id = auth.uid()
    )
  );

-- Authenticated students or server can insert bookings
CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

-- Mentor calendar connection RLS
CREATE POLICY "Mentors can view own calendar connection"
  ON public.mentor_calendar_connections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles
      WHERE mentor_profiles.id = mentor_calendar_connections.mentor_id
      AND mentor_profiles.user_id = auth.uid()
    )
  );
