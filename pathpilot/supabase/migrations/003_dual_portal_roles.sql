-- ============================================================
-- PathPilot AI — Dual-Portal Database Schema Migration (Phase 1)
-- Dual-Portal Roles, RBAC, and Mentor Verification Schema
-- Run in Supabase SQL Editor or via: supabase db push
-- ============================================================

-- ── 1. User Roles Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'approved', 'suspended')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── 2. Add Verification Status to Mentor Profiles ─────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mentor_profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE public.mentor_profiles
      ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'pending'
      CHECK (verification_status IN ('draft', 'pending', 'approved', 'rejected'));
  END IF;
END $$;

-- ── 3. Auto-sync trigger on auth.users creation ──────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  initial_status TEXT;
BEGIN
  -- Read role from raw_user_meta_data, default to 'student'
  assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  
  -- Mentors start as pending_approval until verified; students and admins start active
  IF assigned_role = 'mentor' THEN
    initial_status := 'pending_approval';
  ELSE
    initial_status := 'active';
  END IF;

  -- Upsert into profiles
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END;

  -- Upsert into user_roles
  INSERT INTO public.user_roles (user_id, role, status)
  VALUES (NEW.id, assigned_role, initial_status)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- ── 4. Helper Function: Get User Role and Approval Status ─────────────────────
CREATE OR REPLACE FUNCTION public.get_user_role_status(target_uid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT json_build_object(
    'role', ur.role,
    'status', ur.status,
    'user_id', ur.user_id
  ) INTO result
  FROM public.user_roles ur
  WHERE ur.user_id = target_uid;

  IF result IS NULL THEN
    -- Fallback to profiles table
    SELECT json_build_object(
      'role', p.role,
      'status', 'active',
      'user_id', p.id
    ) INTO result
    FROM public.profiles p
    WHERE p.id = target_uid;
  END IF;

  RETURN COALESCE(result, json_build_object('role', 'student', 'status', 'active'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
