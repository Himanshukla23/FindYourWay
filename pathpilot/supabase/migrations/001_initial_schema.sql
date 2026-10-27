-- ============================================================
-- PathPilot AI — Database Schema Migration
-- Phase 1 — Complete Schema
-- Run this in the Supabase SQL Editor or via: supabase db push
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. Profiles (extends auth.users) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── 2. Student Profiles ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id              UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  degree               TEXT,
  branch               TEXT,
  college_name         TEXT,
  year_of_study        INTEGER CHECK (year_of_study BETWEEN 1 AND 6),
  graduation_year      INTEGER,
  city                 TEXT,
  bio                  TEXT,
  linkedin_url         TEXT,
  github_url           TEXT,
  portfolio_url        TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own profile"
  ON public.student_profiles FOR ALL
  USING (auth.uid() = user_id);

-- ── 3. Resumes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resumes (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_name         TEXT NOT NULL,
  file_url          TEXT NOT NULL,
  file_type         TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'txt')),
  file_size_bytes   INTEGER NOT NULL,
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_status TEXT NOT NULL DEFAULT 'pending'
                    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_text    TEXT,
  consent_given     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at        TIMESTAMPTZ
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own resumes"
  ON public.resumes FOR ALL
  USING (auth.uid() = user_id);

-- ── 4. Resume Analysis ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resume_analysis (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resume_id            UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  user_id              UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  summary              TEXT,
  strengths            TEXT[] DEFAULT '{}',
  skills_found         TEXT[] DEFAULT '{}',
  experience_found     TEXT[] DEFAULT '{}',
  education_found      TEXT[] DEFAULT '{}',
  projects_found       TEXT[] DEFAULT '{}',
  certifications_found TEXT[] DEFAULT '{}',
  gaps_identified      TEXT[] DEFAULT '{}',
  next_steps           TEXT[] DEFAULT '{}',
  raw_json             JSONB,
  ai_provider          TEXT NOT NULL DEFAULT 'demo',
  is_demo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resume analysis"
  ON public.resume_analysis FOR ALL
  USING (auth.uid() = user_id);

-- ── 5. Career Domains ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.career_domains (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT '💼',
  color       TEXT NOT NULL DEFAULT '#6C47FF',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.career_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view career domains"
  ON public.career_domains FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── 6. Job Profiles ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_profiles (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain_id            UUID REFERENCES public.career_domains(id) ON DELETE CASCADE NOT NULL,
  title                TEXT NOT NULL,
  slug                 TEXT NOT NULL,
  overview             TEXT NOT NULL,
  responsibilities     TEXT[] DEFAULT '{}',
  required_skills      TEXT[] DEFAULT '{}',
  tools                TEXT[] DEFAULT '{}',
  certifications       TEXT[] DEFAULT '{}',
  eligibility          TEXT,
  career_progression   TEXT[] DEFAULT '{}',
  experience_level     TEXT NOT NULL DEFAULT 'entry' CHECK (experience_level IN ('entry', 'mid', 'senior')),
  is_entry_level       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(domain_id, slug)
);

ALTER TABLE public.job_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view job profiles"
  ON public.job_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── 7. Career Recommendations ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.career_recommendations (
  id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id            UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_analysis_id UUID REFERENCES public.resume_analysis(id) ON DELETE SET NULL,
  domain_id          UUID REFERENCES public.career_domains(id) ON DELETE CASCADE NOT NULL,
  job_profile_id     UUID REFERENCES public.job_profiles(id) ON DELETE SET NULL,
  suitability_score  INTEGER CHECK (suitability_score BETWEEN 0 AND 100),
  reasoning          TEXT,
  evidence           TEXT[] DEFAULT '{}',
  gaps               TEXT[] DEFAULT '{}',
  next_steps         TEXT[] DEFAULT '{}',
  is_demo            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recommendations"
  ON public.career_recommendations FOR ALL
  USING (auth.uid() = user_id);

-- ── 8. Student Target Roles ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_target_roles (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_profile_id  UUID REFERENCES public.job_profiles(id) ON DELETE CASCADE NOT NULL,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  selected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  UNIQUE(user_id, job_profile_id)
);

ALTER TABLE public.student_target_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their target roles"
  ON public.student_target_roles FOR ALL
  USING (auth.uid() = user_id);

-- ── 9. Roadmaps ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_profile_id  UUID REFERENCES public.job_profiles(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  total_phases    INTEGER NOT NULL DEFAULT 0,
  estimated_weeks INTEGER NOT NULL DEFAULT 0,
  is_demo         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  regenerated_at  TIMESTAMPTZ
);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own roadmaps"
  ON public.roadmaps FOR ALL
  USING (auth.uid() = user_id);

-- ── 10. Roadmap Phases ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roadmap_phases (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  roadmap_id      UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
  phase_number    INTEGER NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  estimated_weeks INTEGER NOT NULL DEFAULT 0,
  order_index     INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.roadmap_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their roadmap phases"
  ON public.roadmap_phases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps r
      WHERE r.id = roadmap_phases.roadmap_id AND r.user_id = auth.uid()
    )
  );

-- ── 11. Roadmap Tasks ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roadmap_tasks (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phase_id            UUID REFERENCES public.roadmap_phases(id) ON DELETE CASCADE NOT NULL,
  roadmap_id          UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  skill_focus         TEXT,
  resources           JSONB DEFAULT '[]',
  practical_task      TEXT,
  estimated_hours     INTEGER DEFAULT 0,
  completion_criteria TEXT[] DEFAULT '{}',
  why_it_matters      TEXT,
  status              TEXT NOT NULL DEFAULT 'not_started'
                      CHECK (status IN ('not_started', 'in_progress', 'completed')),
  notes               TEXT,
  project_link        TEXT,
  completed_at        TIMESTAMPTZ,
  order_index         INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks"
  ON public.roadmap_tasks FOR ALL
  USING (auth.uid() = user_id);

-- ── 12. Mentor Profiles ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id               UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name             TEXT NOT NULL,
  title                 TEXT NOT NULL,
  organisation          TEXT NOT NULL,
  bio                   TEXT NOT NULL,
  avatar_url            TEXT,
  years_experience      INTEGER NOT NULL DEFAULT 1,
  domains               TEXT[] DEFAULT '{}',
  skills                TEXT[] DEFAULT '{}',
  mentoring_topics      TEXT[] DEFAULT '{}',
  session_price_inr     INTEGER NOT NULL DEFAULT 500,
  session_duration_mins INTEGER[] DEFAULT '{30, 60}',
  rating                NUMERIC(2,1) DEFAULT 0,
  review_count          INTEGER DEFAULT 0,
  is_verified           BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo_profile       BOOLEAN NOT NULL DEFAULT TRUE,
  linkedin_url          TEXT,
  is_available          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view mentor profiles"
  ON public.mentor_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── 13. Available Slots ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.available_slots (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id  UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
  date       DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  is_booked  BOOLEAN NOT NULL DEFAULT FALSE,
  booking_id UUID
);

ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view available slots"
  ON public.available_slots FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── 14. Bookings ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id            UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id             UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
  slot_id               UUID REFERENCES public.available_slots(id) ON DELETE SET NULL,
  topic                 TEXT NOT NULL,
  questions             TEXT,
  target_role           TEXT,
  session_duration_mins INTEGER NOT NULL DEFAULT 60,
  total_price_inr       INTEGER NOT NULL DEFAULT 0,
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','demo_confirmed','cancelled','completed','no_show')),
  meeting_link          TEXT,
  is_demo_booking       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at          TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  cancellation_reason   TEXT
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own bookings (cancellation)"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = student_id);

-- ── 15. Reviews ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id  UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  student_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id   UUID REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view verified reviews"
  ON public.reviews FOR SELECT
  USING (auth.role() = 'authenticated' AND is_verified = TRUE);

CREATE POLICY "Students can create reviews for their own bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- ── 16. Saved Items ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_items (
  id        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('job_profile', 'mentor')),
  item_id   UUID NOT NULL,
  saved_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their saved items"
  ON public.saved_items FOR ALL
  USING (auth.uid() = user_id);

-- ── 17. Onboarding Responses ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id              UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  interests            TEXT[] DEFAULT '{}',
  preferred_work_style TEXT[] DEFAULT '{}',
  learning_preference  TEXT[] DEFAULT '{}',
  career_goals         TEXT[] DEFAULT '{}',
  challenges           TEXT,
  hours_per_week       INTEGER,
  completed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their onboarding responses"
  ON public.onboarding_responses FOR ALL
  USING (auth.uid() = user_id);

-- ── 18. Consent Records ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consent_records (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL,
  given_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address   TEXT,
  revoked_at   TIMESTAMPTZ
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their consent records"
  ON public.consent_records FOR ALL
  USING (auth.uid() = user_id);

-- ── Seed: Career Domains ──────────────────────────────────────────────────────
INSERT INTO public.career_domains (name, slug, description, icon, color) VALUES
  ('Software Development',       'software-development',   'Build web, mobile, and desktop applications. One of the most in-demand paths for CS graduates.', '💻', '#6C47FF'),
  ('Cybersecurity',              'cybersecurity',          'Protect systems, networks, and data from digital threats. A rapidly growing field with strong demand.', '🔐', '#EF4444'),
  ('Data Analytics & Science',   'data-analytics',         'Transform raw data into actionable insights using statistics, tools, and visualisation.', '📊', '#3B82F6'),
  ('Product Management',         'product-management',     'Bridge the gap between business, design, and engineering. Drive product vision and strategy.', '🎯', '#F59E0B'),
  ('Cloud Computing & DevOps',   'cloud-devops',           'Deploy, scale, and manage applications in the cloud. Automate infrastructure and CI/CD pipelines.', '☁️', '#10B981'),
  ('UI/UX Design',               'ui-ux-design',           'Design intuitive, beautiful digital experiences that users love. Combines creativity with user psychology.', '🎨', '#EC4899'),
  ('Digital Marketing',          'digital-marketing',      'Drive online growth through SEO, content, social media, paid ads, and analytics.', '📱', '#8B5CF6'),
  ('Business Analysis',          'business-analysis',      'Analyse business needs, processes, and data to improve operations and drive decisions.', '📈', '#06B6D4'),
  ('Finance & Consulting',       'finance-consulting',     'Analyse financial data, support business decisions, and provide expert advisory services.', '💰', '#84CC16'),
  ('Quality Assurance',          'quality-assurance',      'Ensure software quality through manual and automated testing. A great entry point into tech.', '✅', '#F97316')
ON CONFLICT (slug) DO NOTHING;

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analysis_user_id ON public.resume_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_user_id ON public.roadmap_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_status ON public.roadmap_tasks(status);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON public.bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_available_slots_mentor_date ON public.available_slots(mentor_id, date);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_domains ON public.mentor_profiles USING GIN(domains);

-- ── Done ──────────────────────────────────────────────────────────────────────
-- To verify: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
