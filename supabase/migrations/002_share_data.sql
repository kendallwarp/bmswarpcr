-- ============================================
-- Warp CR - Enable "Company Mode" (Shared Data)
-- This will allow ALL users to see/edit ALL data.
-- ============================================

-- 1. DROP OLD RESTRICTIVE POLICIES (BRANDS)
DROP POLICY IF EXISTS "Users can view own brands" ON public.brands;
DROP POLICY IF EXISTS "Users can create brands" ON public.brands;
DROP POLICY IF EXISTS "Users can update own brands" ON public.brands;
DROP POLICY IF EXISTS "Users can delete own brands" ON public.brands;

-- 2. CREATE NEW SHARED POLICIES (BRANDS)
CREATE POLICY "Team can view all brands"
    ON public.brands FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Team can create brands"
    ON public.brands FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Team can update all brands"
    ON public.brands FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Team can delete all brands"
    ON public.brands FOR DELETE
    USING (auth.role() = 'authenticated');


-- 3. DROP OLD RESTRICTIVE POLICIES (POSTS)
DROP POLICY IF EXISTS "Users can view posts from own brands" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts for own brands" ON public.posts;
DROP POLICY IF EXISTS "Users can update posts from own brands" ON public.posts;
DROP POLICY IF EXISTS "Users can delete posts from own brands" ON public.posts;

-- 4. CREATE NEW SHARED POLICIES (POSTS)
CREATE POLICY "Team can view all posts"
    ON public.posts FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Team can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Team can update all posts"
    ON public.posts FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Team can delete all posts"
    ON public.posts FOR DELETE
    USING (auth.role() = 'authenticated');

-- Success Message
DO $$
BEGIN
    RAISE NOTICE 'Success! "Company Mode" is now active. All users can see shared data.';
END $$;
