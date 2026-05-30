-- ============================================
-- SUPABASE STORAGE BUCKETS MIGRATION
-- ============================================
-- This migration creates storage buckets for 
-- image uploads in the SKI website
-- ============================================
-- CARA MENGGUNAKAN:
-- 1. Buka Supabase Dashboard
-- 2. Masuk ke SQL Editor
-- 3. Copy dan paste semua query di bawah
-- 4. Klik "Run" untuk menjalankan
-- ============================================

-- ============================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================

-- Create bucket for events thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'events-images',
    'events-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for galleries (documentation) images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'galleries-images',
    'galleries-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for products images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products-images',
    'products-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for profile images (pengurus, kabinet, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for kas payment proof
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kas-bukti',
    'kas-bukti',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. ROW LEVEL SECURITY POLICIES
-- ============================================
-- CATATAN: Jika mendapatkan error "must be owner of table objects",
-- setup policies secara manual melalui Supabase Dashboard:
-- Storage -> Pilih bucket -> Policies -> New Policy
-- ============================================

-- Enable RLS on storage.objects (hanya bisa dilakukan oleh owner)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy untuk INSERT (upload) - untuk authenticated users
-- CREATE POLICY "Allow authenticated users to upload files"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--     bucket_id IN ('events-images', 'galleries-images', 'products-images', 'profile-images')
-- );

-- Policy untuk SELECT (read) - untuk public (karena bucket public)
-- CREATE POLICY "Allow public to read files"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (
--     bucket_id IN ('events-images', 'galleries-images', 'products-images', 'profile-images')
-- );

-- Policy untuk DELETE - untuk authenticated users
-- CREATE POLICY "Allow authenticated users to delete files"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--     bucket_id IN ('events-images', 'galleries-images', 'products-images', 'profile-images')
-- );

-- Policy untuk UPDATE - untuk authenticated users
-- CREATE POLICY "Allow authenticated users to update files"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (
--     bucket_id IN ('events-images', 'galleries-images', 'products-images', 'profile-images')
-- )
-- WITH CHECK (
--     bucket_id IN ('events-images', 'galleries-images', 'products-images', 'profile-images')
-- );