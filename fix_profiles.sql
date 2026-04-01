-- ================================================================
-- COMPLETE FIX — Run this in Supabase → SQL Editor
-- Fixes: teachers not appearing in Teachers page,
--        lessons/assignments not showing on module pages
-- ================================================================

-- ── STEP 1: Create auto-profile trigger ─────────────────────────
-- Every time a user signs up (even before email confirmation),
-- this trigger auto-creates their profile row using their metadata.
-- SECURITY DEFINER means it bypasses RLS — runs as DB owner.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, module)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'module', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    name   = COALESCE(EXCLUDED.name, profiles.name),
    role   = COALESCE(EXCLUDED.role, profiles.role),
    module = COALESCE(EXCLUDED.module, profiles.module);
  RETURN NEW;
END;
$$;

-- Drop old trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── STEP 2: Backfill existing users who have no profile row ─────
-- This fixes every teacher/student who registered before the fix.

INSERT INTO public.profiles (id, email, name, role, module)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'student'),
  COALESCE(au.raw_user_meta_data->>'module', '')
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL   -- only users who have NO profile row
ON CONFLICT (id) DO NOTHING;

-- ── STEP 3: Update existing profile rows that have wrong/missing data ──
-- In case a profile row exists but module or role is empty.

UPDATE public.profiles p
SET
  name   = COALESCE(NULLIF(p.name, ''),   au.raw_user_meta_data->>'full_name'),
  role   = COALESCE(NULLIF(p.role, ''),   au.raw_user_meta_data->>'role', 'student'),
  module = COALESCE(NULLIF(p.module, ''), au.raw_user_meta_data->>'module')
FROM auth.users au
WHERE au.id = p.id;

-- ── STEP 4: Ensure lessons & assignments have semester column ────
ALTER TABLE lessons     ADD COLUMN IF NOT EXISTS semester integer NOT NULL DEFAULT 1;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS semester integer NOT NULL DEFAULT 1;

-- ── STEP 5: Ensure storage bucket exists ────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('courses', 'courses', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ── STEP 6: Storage RLS policies ────────────────────────────────
DROP POLICY IF EXISTS "Public read courses bucket"    ON storage.objects;
DROP POLICY IF EXISTS "Teachers upload courses bucket" ON storage.objects;

CREATE POLICY "Public read courses bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'courses');

CREATE POLICY "Teachers upload courses bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'courses'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- ── STEP 7: Verify — run this SELECT to confirm teachers exist ──
-- (You can run this separately to check the result)
-- SELECT id, email, name, role, module FROM profiles WHERE role = 'teacher';

