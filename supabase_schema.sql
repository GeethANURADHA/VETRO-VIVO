-- ==========================================
-- Ceylon Gem Marketplace FIXED SQL (Non-Recursive)
-- ==========================================

-- 1. CLEANUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.gems CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. CREATE TABLES
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

-- 3. HELPER FUNCTIONS (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'main_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ENABLE RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES: USERS (Non-Recursive)
CREATE POLICY "View own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all" ON public.users FOR SELECT USING (public.is_admin());

-- 6. POLICIES: CATEGORIES
CREATE POLICY "Public categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin categories" ON public.categories FOR ALL USING (public.is_admin());

-- 7. POLICIES: GEMS
CREATE POLICY "Public gems" ON public.gems FOR SELECT USING (true);
CREATE POLICY "Admin gems" ON public.gems FOR ALL USING (public.is_admin());

-- 8. POLICIES: INQUIRIES
CREATE POLICY "Admin inquiries" ON public.inquiries FOR SELECT USING (public.is_admin());
CREATE POLICY "Public inquiries insert" ON public.inquiries FOR INSERT WITH CHECK (true);

-- 9. AUTOMATION: PROFILE SYNC
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. HELPER: RESTORE ADMIN (Use this if you get locked out)
-- UPDATE public.users SET role = 'main_admin' WHERE email = 'vetrovivo.lk@gmail.com';

-- 11. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('gem-images', 'gem-images', true)
ON CONFLICT (id) DO NOTHING;

-- 12. STORAGE POLICIES
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;

-- Allow public viewing of images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'gem-images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'gem-images' AND (public.is_admin())
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'gem-images' AND (public.is_admin())
);

-- ==========================================
-- 13. HOMEPAGE SETTINGS TABLE
-- ==========================================
DROP TABLE IF EXISTS public.homepage_settings CASCADE;

CREATE TABLE public.homepage_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_bg_image_url TEXT,
  hero_welcome_text TEXT DEFAULT 'Welcome to VETRO VIVO',
  hero_headline TEXT DEFAULT 'We bring the enchantment and purity of Sri Lanka''s rarest gemstones directly to Naples and all of Europe. Every stone we offer tells a story of earth, light, and authenticity.',
  hero_paragraph TEXT DEFAULT 'Why Choose Us? Certified Authenticity: Each gemstone is sourced directly by experts with generations of experience in the gem trade and is accompanied by official, recognized certificates. Total Transparency: From the mine to the final cut, we guarantee 100% natural, untreated, and ethically sourced stones. Local Presence, Global Trust: Based in Naples, we provide the security of direct customer support, insured shipping, and a guaranteed return policy under European laws. Explore our collection and find the gemstone that will illuminate your story.',
  hero_overlay_color TEXT DEFAULT '#000000',
  hero_overlay_opacity INTEGER DEFAULT 65 CHECK (hero_overlay_opacity >= 0 AND hero_overlay_opacity <= 100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read homepage_settings" ON public.homepage_settings 
  FOR SELECT USING (true);

CREATE POLICY "Admin write homepage_settings" ON public.homepage_settings 
  FOR ALL USING (public.is_admin());

-- Insert default row
INSERT INTO public.homepage_settings (id, hero_welcome_text, hero_headline, hero_paragraph, hero_overlay_color, hero_overlay_opacity)
VALUES (
  1, 
  'Welcome to VETRO VIVO', 
  'We bring the enchantment and purity of Sri Lanka''s rarest gemstones directly to Naples and all of Europe. Every stone we offer tells a story of earth, light, and authenticity.', 
  'Why Choose Us? Certified Authenticity: Each gemstone is sourced directly by experts with generations of experience in the gem trade and is accompanied by official, recognized certificates. Total Transparency: From the mine to the final cut, we guarantee 100% natural, untreated, and ethically sourced stones. Local Presence, Global Trust: Based in Naples, we provide the security of direct customer support, insured shipping, and a guaranteed return policy under European laws. Explore our collection and find the gemstone that will illuminate your story.', 
  '#000000', 
  65
)
ON CONFLICT (id) DO NOTHING;

