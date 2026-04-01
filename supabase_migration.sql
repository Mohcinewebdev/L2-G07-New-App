-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Add 'module' column to profiles (which teacher teaches which module)
alter table profiles add column if not exists module text;

-- 2. Add 'pdf_url' column to courses (link to PDF file)
alter table courses add column if not exists pdf_url text;

-- 3. Add 'module' column to courses (which module the course belongs to)
alter table courses add column if not exists module text;

-- 4. Fix the email-confirmation redirect:
--    Go to Supabase Dashboard → Authentication → URL Configuration
--    Set "Site URL" to: https://l2-g07-new-app.vercel.app
--    Add to "Redirect URLs": https://l2-g07-new-app.vercel.app/dashboard
--    (This cannot be done via SQL — must be done in the dashboard UI)
