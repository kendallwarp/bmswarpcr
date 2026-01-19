-- Migration: Add image_description to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_description TEXT;

-- Success Message
DO $$
BEGIN
    RAISE NOTICE 'Success! image_description column added to posts table.';
END $$;
