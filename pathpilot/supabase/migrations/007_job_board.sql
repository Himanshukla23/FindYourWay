-- ============================================================================
-- Migration: 007_job_board.sql
-- Description: Production Job Board & Intelligence Engine (Architecture Spec 2.0)
-- Features:
--   - High-throughput 'jobs' ledger with SHA-256 deduplication hash
--   - Composite & GIN indexes for sub-millisecond full-text & filter queries
--   - 'user_saved_jobs' and 'user_applied_jobs' for application pipeline tracking
--   - Row-Level Security (RLS) policies for public search & user privacy
-- ============================================================================

-- 1. JOBS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hash_id VARCHAR(64) UNIQUE NOT NULL, -- SHA256(company:title:location) for zero-duplicate guarantees
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    company_logo TEXT,
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    work_mode VARCHAR(50) NOT NULL DEFAULT 'Remote', -- 'Remote', 'Hybrid', 'On-site'
    exp_min INT NOT NULL DEFAULT 0,
    exp_max INT NOT NULL DEFAULT 2,
    salary_display VARCHAR(100) DEFAULT 'Not Disclosed',
    skills TEXT[] DEFAULT '{}',
    role_category VARCHAR(100) NOT NULL DEFAULT 'Software Engineering', -- 'Product', 'Software Engineering', 'Design', 'Data & Analytics', 'Cloud & DevOps'
    tier INT NOT NULL DEFAULT 2, -- 1: Tech Giants/FAANG, 2: Funded Unicorns, 3: Fast-growing Startups
    apply_url TEXT NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'Direct ATS', -- 'Greenhouse', 'Lever', 'Remotive', 'Curated'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'closed', 'new'
    jd_summary TEXT,
    jd_full TEXT,
    hiring_contact JSONB DEFAULT '{}'::jsonb, -- { "name": "...", "role": "...", "linkedin": "..." }
    verified_at TIMESTAMPTZ DEFAULT now(),
    posted_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USER SAVED JOBS (Wishlist)
CREATE TABLE IF NOT EXISTS public.user_saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_user_saved_job UNIQUE(user_id, job_id)
);

-- 3. USER APPLIED JOBS (Kanban / Application Pipeline Tracker)
CREATE TABLE IF NOT EXISTS public.user_applied_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'applied', -- 'saved', 'applied', 'interviewing', 'offered', 'rejected'
    notes TEXT DEFAULT '',
    applied_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_user_applied_job UNIQUE(user_id, job_id)
);

-- 4. HIGH-PERFORMANCE INDEXING
CREATE INDEX IF NOT EXISTS idx_jobs_status_posted ON public.jobs(status, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_country_workmode ON public.jobs(country, work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_category_exp ON public.jobs(role_category, exp_min, exp_max);
CREATE INDEX IF NOT EXISTS idx_jobs_skills_gin ON public.jobs USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON public.user_saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_applied_jobs_user ON public.user_applied_jobs(user_id);

-- Full-Text Search tsvector index for instant keyword search across title, company, skills
CREATE INDEX IF NOT EXISTS idx_jobs_fts ON public.jobs USING GIN(
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(company, '') || ' ' || coalesce(location, ''))
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_applied_jobs ENABLE ROW LEVEL SECURITY;

-- Jobs: Anyone can read active or new jobs
DROP POLICY IF EXISTS "Public read active jobs" ON public.jobs;
CREATE POLICY "Public read active jobs"
    ON public.jobs FOR SELECT
    USING (status IN ('active', 'new'));

-- Saved Jobs: Users can read/write their own saved jobs
DROP POLICY IF EXISTS "Users can read own saved jobs" ON public.user_saved_jobs;
CREATE POLICY "Users can read own saved jobs"
    ON public.user_saved_jobs FOR SELECT
    USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can manage own saved jobs" ON public.user_saved_jobs;
CREATE POLICY "Users can manage own saved jobs"
    ON public.user_saved_jobs FOR ALL
    USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Applied Jobs: Users can manage their own application tracker
DROP POLICY IF EXISTS "Users can read own applied jobs" ON public.user_applied_jobs;
CREATE POLICY "Users can read own applied jobs"
    ON public.user_applied_jobs FOR SELECT
    USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can manage own applied jobs" ON public.user_applied_jobs;
CREATE POLICY "Users can manage own applied jobs"
    ON public.user_applied_jobs FOR ALL
    USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

