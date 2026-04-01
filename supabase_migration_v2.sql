-- =====================================================================
-- FIXED MIGRATION — Run this in Supabase Dashboard → SQL Editor
-- =====================================================================

-- profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS module text;

-- courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pdf_url text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS module text;

-- lessons table (no course_id — add only what's needed)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS semester integer NOT NULL DEFAULT 2;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module text;

-- assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS module text;

-- Storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-pdfs', 'course-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY IF NOT EXISTS "Public read course-pdfs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-pdfs');

CREATE POLICY IF NOT EXISTS "Teachers upload course-pdfs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-pdfs' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );