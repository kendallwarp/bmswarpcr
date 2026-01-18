-- ============================================
-- Warp CR - Complete Database Schema
-- Supabase PostgreSQL Migration
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('Admin', 'Editor')) DEFAULT 'Editor',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        'Editor'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- 2. BRANDS TABLE
-- ============================================

CREATE TABLE public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- API Credentials (store encrypted in production)
    meta_access_token TEXT,
    meta_ad_account_id TEXT,
    tiktok_access_token TEXT,
    tiktok_advertiser_id TEXT,
    whatsapp_business_account_id TEXT,
    whatsapp_phone_number_id TEXT,
    linkedin_access_token TEXT,
    linkedin_organization_id TEXT
);

-- Indexes
CREATE INDEX idx_brands_created_by ON public.brands(created_by);

-- RLS Policies for brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brands"
    ON public.brands FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can create brands"
    ON public.brands FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own brands"
    ON public.brands FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own brands"
    ON public.brands FOR DELETE
    USING (auth.uid() = created_by);

-- ============================================
-- 3. POSTS TABLE
-- ============================================

CREATE TABLE public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Scheduling
    date DATE NOT NULL,
    time TIME NOT NULL,
    
    -- Platform & Content
    platform TEXT NOT NULL,
    objective TEXT NOT NULL,
    status TEXT CHECK (status IN ('Draft', 'Approved', 'Scheduled', 'Published')) DEFAULT 'Draft',
    copy TEXT NOT NULL,
    image TEXT,
    
    -- Budget
    is_paid BOOLEAN DEFAULT FALSE,
    budget NUMERIC(10, 2) DEFAULT 0,
    
    -- Campaign Hierarchy (Multi-Platform Strategy)
    campaign_name TEXT,
    ad_group_name TEXT,
    ad_id TEXT,
    
    -- Audit timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_brand_id ON public.posts(brand_id);
CREATE INDEX idx_posts_created_by ON public.posts(created_by);
CREATE INDEX idx_posts_date ON public.posts(date);
CREATE INDEX idx_posts_platform ON public.posts(platform);
CREATE INDEX idx_posts_campaign_name ON public.posts(campaign_name);
CREATE INDEX idx_posts_status ON public.posts(status);

-- RLS Policies for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view posts from own brands"
    ON public.posts FOR SELECT
    USING (
        brand_id IN (
            SELECT id FROM public.brands WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create posts for own brands"
    ON public.posts FOR INSERT
    WITH CHECK (
        auth.uid() = created_by AND
        brand_id IN (
            SELECT id FROM public.brands WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update posts from own brands"
    ON public.posts FOR UPDATE
    USING (
        brand_id IN (
            SELECT id FROM public.brands WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete posts from own brands"
    ON public.posts FOR DELETE
    USING (
        brand_id IN (
            SELECT id FROM public.brands WHERE created_by = auth.uid()
        )
    );

-- ============================================
-- 4. UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_brands
    BEFORE UPDATE ON public.brands
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_posts
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get user's brands
CREATE OR REPLACE FUNCTION public.get_user_brands(user_id UUID)
RETURNS SETOF public.brands AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.brands
    WHERE created_by = user_id
    ORDER BY name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get brand posts
CREATE OR REPLACE FUNCTION public.get_brand_posts(brand_uuid UUID)
RETURNS SETOF public.posts AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.posts
    WHERE brand_id = brand_uuid
    ORDER BY date DESC, time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Warp CR database schema created successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Enable Email auth in Supabase Dashboard';
    RAISE NOTICE '2. Create your first user account';
    RAISE NOTICE '3. Configure environment variables in your app';
END $$;
