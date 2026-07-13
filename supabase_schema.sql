-- ==========================================
-- VETRO VIVO - Complete Schema (Recursion-Safe)
-- Run this entire file in Supabase SQL Editor
-- ==========================================

-- ============================================================
-- STEP 1: CLEANUP (drops everything so we start fresh)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP TABLE IF EXISTS public.homepage_settings CASCADE;
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.gems CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================
-- STEP 2: CREATE TABLES
-- ============================================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('main_admin', 'admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'precious' CHECK (type IN ('precious', 'semi-precious', 'other')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE public.gems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  carat DECIMAL(8,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  color TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT,
  image_url TEXT,
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'sold_out')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  gem_id UUID REFERENCES public.gems(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE public.homepage_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_bg_image_url TEXT,
  hero_welcome_text TEXT DEFAULT 'Welcome to VETRO VIVO',
  hero_headline TEXT DEFAULT 'We bring the enchantment and purity of Sri Lanka''s rarest gemstones directly to Naples and all of Europe. Every stone we offer tells a story of earth, light, and authenticity.',
  hero_paragraph TEXT DEFAULT 'Certified Authenticity: Each gemstone is sourced directly by experts with generations of experience in the gem trade and is accompanied by official, recognized certificates. Total Transparency: From the mine to the final cut, we guarantee 100% natural, untreated, and ethically sourced stones. Local Presence, Global Trust: Based in Naples, we provide the security of direct customer support, insured shipping, and a guaranteed return policy under European laws.',
  hero_overlay_color TEXT DEFAULT '#000000',
  hero_overlay_opacity INTEGER DEFAULT 65 CHECK (hero_overlay_opacity >= 0 AND hero_overlay_opacity <= 100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- STEP 3: is_admin() - THE KEY FIX
-- Uses SET search_path = '' so the internal SELECT bypasses RLS.
-- This prevents infinite recursion when policies call is_admin()
-- which would otherwise query the users table triggering RLS again.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'main_admin')
  );
$$;

-- ============================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gems              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 5: POLICIES - USERS
-- IMPORTANT: Do NOT call is_admin() here - it would recurse.
-- Each user can only see/edit their own row.
-- is_admin() itself bypasses RLS via SET search_path = ''.
-- ============================================================
CREATE POLICY "View own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- STEP 6: POLICIES - CATEGORIES
-- ============================================================
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admin manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- STEP 7: POLICIES - GEMS
-- ============================================================
CREATE POLICY "Public read gems"
  ON public.gems FOR SELECT
  USING (true);

CREATE POLICY "Admin manage gems"
  ON public.gems FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- STEP 8: POLICIES - INQUIRIES
-- ============================================================
CREATE POLICY "Public submit inquiry"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin read inquiries"
  ON public.inquiries FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin delete inquiries"
  ON public.inquiries FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- STEP 9: POLICIES - HOMEPAGE SETTINGS
-- ============================================================
CREATE POLICY "Public read homepage_settings"
  ON public.homepage_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin write homepage_settings"
  ON public.homepage_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- STEP 10: AUTO-CREATE PROFILE ON SIGN UP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 11: SET ADMIN ROLE
-- Sets vetrovivo.lk@gmail.com as main_admin.
-- The user must already exist in auth.users (have signed up before).
-- If 0 rows updated, sign up first, then re-run just this UPDATE.
-- ============================================================
UPDATE public.users
SET role = 'main_admin'
WHERE email = 'vetrovivo.lk@gmail.com';

-- ============================================================
-- STEP 12: STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('gem-images', 'gem-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 13: STORAGE POLICIES
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
-- STEP 14: INSERT DEFAULT HOMEPAGE SETTINGS ROW
-- ============================================================
INSERT INTO public.homepage_settings (
  id, hero_welcome_text, hero_headline, hero_paragraph,
  hero_overlay_color, hero_overlay_opacity
)
VALUES (
  1,
  'Welcome to VETRO VIVO',
  'We bring the enchantment and purity of Sri Lanka''s rarest gemstones directly to Naples and all of Europe. Every stone we offer tells a story of earth, light, and authenticity.',
  'Certified Authenticity: Each gemstone is sourced directly by experts with generations of experience in the gem trade and is accompanied by official, recognized certificates. Total Transparency: From the mine to the final cut, we guarantee 100% natural, untreated, and ethically sourced stones. Local Presence, Global Trust: Based in Naples, we provide the security of direct customer support, insured shipping, and a guaranteed return policy under European laws.',
  '#000000',
  65
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFICATION (run these separately after setup)
-- ============================================================
-- SELECT id, email, role FROM public.users;
-- SELECT * FROM public.homepage_settings;
-- SELECT public.is_admin();   -- should return true when logged in as admin
