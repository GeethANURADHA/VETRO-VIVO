-- ============================================================
-- VETRO VIVO — Quick Fix SQL
-- Run this in Supabase SQL Editor AFTER the main schema
-- ============================================================

-- ============================================================
-- 1. Sync existing users (fixes missing profiles after schema wipe)
-- ============================================================
INSERT INTO public.users (id, name, email, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)), 
  email, 
  'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Re-set admin role 
-- ============================================================
UPDATE public.users 
SET role = 'main_admin' 
WHERE email = 'vetrovivo.lk@gmail.com';

-- Confirm result:
SELECT id, email, role FROM public.users;

-- ============================================================
-- 3. Seed Categories (run this to add initial categories)
-- ============================================================
INSERT INTO public.categories (name, type) VALUES
  ('Sapphire',  'precious'),
  ('Ruby',      'precious'),
  ('Emerald',   'precious'),
  ('Alexandrite','precious'),
  ('Cat''s Eye', 'precious'),
  ('Spinel',    'semi-precious'),
  ('Tourmaline','semi-precious'),
  ('Garnet',    'semi-precious'),
  ('Amethyst',  'semi-precious'),
  ('Topaz',     'semi-precious')
ON CONFLICT (name) DO NOTHING;

-- Confirm:
SELECT name, type FROM public.categories ORDER BY type, name;

-- ============================================================
-- 4. Create storage bucket (if not already done via Dashboard)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('gem-images', 'gem-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. Storage policies (re-apply in case they were dropped)
-- ============================================================
DROP POLICY IF EXISTS "Public Access"     ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;

CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gem-images');

CREATE POLICY "Admins can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gem-images' AND public.is_admin());

CREATE POLICY "Admins can update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gem-images' AND public.is_admin());

CREATE POLICY "Admins can delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gem-images' AND public.is_admin());

-- ============================================================
-- 6. Verify everything
-- ============================================================
SELECT 'users' as table_name, count(*)::text as rows FROM public.users
UNION ALL
SELECT 'categories', count(*)::text FROM public.categories
UNION ALL
SELECT 'gems', count(*)::text FROM public.gems
UNION ALL
SELECT 'homepage_settings', count(*)::text FROM public.homepage_settings;
