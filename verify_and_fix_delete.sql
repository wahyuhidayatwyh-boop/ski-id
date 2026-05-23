-- ============================================================
-- VERIFY AND FIX DELETE FUNCTIONALITY
-- Jalankan script ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. VERIFIKASI STRUKTUR TABEL
-- ============================================================

-- Cek apakah tabel divisions memiliki kolom kabinet_id
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'divisions' AND column_name = 'kabinet_id';

-- Cek apakah tabel pengurus memiliki kolom kabinet_id dan division_id
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'pengurus' AND column_name IN ('kabinet_id', 'division_id');

-- ============================================================
-- 2. VERIFIKASI FOREIGN KEY CONSTRAINTS
-- ============================================================

-- Lihat semua foreign key constraints untuk tabel pengurus dan divisions
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    CASE contype WHEN 'f' THEN 'FOREIGN KEY' ELSE contype::text END as constraint_type,
    CASE confdeltype 
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
    END as delete_behavior
FROM pg_constraint 
WHERE conrelid IN ('pengurus'::regclass, 'divisions'::regclass)
AND contype = 'f';

-- ============================================================
-- 3. FIX: Tambahkan kolom kabinet_id ke divisions jika belum ada
-- ============================================================

ALTER TABLE divisions 
ADD COLUMN IF NOT EXISTS kabinet_id UUID;

-- ============================================================
-- 4. FIX: Update foreign key constraints
-- ============================================================

-- Drop existing constraints if they exist
ALTER TABLE pengurus DROP CONSTRAINT IF EXISTS pengurus_kabinet_id_fkey;
ALTER TABLE pengurus DROP CONSTRAINT IF EXISTS pengurus_division_id_fkey;
ALTER TABLE divisions DROP CONSTRAINT IF EXISTS divisions_kabinet_id_fkey;

-- Add foreign key with proper cascade behavior
ALTER TABLE pengurus
ADD CONSTRAINT pengurus_kabinet_id_fkey 
FOREIGN KEY (kabinet_id) REFERENCES kabinets(id) ON DELETE CASCADE;

ALTER TABLE pengurus
ADD CONSTRAINT pengurus_division_id_fkey 
FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL;

ALTER TABLE divisions
ADD CONSTRAINT divisions_kabinet_id_fkey 
FOREIGN KEY (kabinet_id) REFERENCES kabinets(id) ON DELETE CASCADE;

-- ============================================================
-- 5. VERIFIKASI RLS POLICIES
-- ============================================================

-- Cek RLS policies untuk ketiga tabel
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('kabinets', 'divisions', 'pengurus')
ORDER BY tablename, policyname;

-- ============================================================
-- 6. ENSURE RLS IS ENABLED AND POLICIES ARE CORRECT
-- ============================================================

-- Enable RLS if not already enabled
ALTER TABLE kabinets ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengurus ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Public read kabinets" ON kabinets;
DROP POLICY IF EXISTS "Auth full access kabinets" ON kabinets;
DROP POLICY IF EXISTS "Public read divisions" ON divisions;
DROP POLICY IF EXISTS "Auth full access divisions" ON divisions;
DROP POLICY IF EXISTS "Public read pengurus" ON pengurus;
DROP POLICY IF EXISTS "Auth full access pengurus" ON pengurus;

-- Create proper policies
CREATE POLICY "Public read kabinets" ON kabinets FOR SELECT USING (true);
CREATE POLICY "Auth full access kabinets" ON kabinets FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read divisions" ON divisions FOR SELECT USING (true);
CREATE POLICY "Auth full access divisions" ON divisions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public read pengurus" ON pengurus FOR SELECT USING (true);
CREATE POLICY "Auth full access pengurus" ON pengurus FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 7. TEST DELETE FUNCTIONALITY
-- ============================================================

-- Test 1: Delete a pengurus (should work without affecting others)
-- Uncomment to test:
-- DELETE FROM pengurus WHERE id = (SELECT id FROM pengurus LIMIT 1);

-- Test 2: Delete a division (pengurus should remain but division_id becomes NULL)
-- Uncomment to test:
-- DELETE FROM divisions WHERE id = (SELECT id FROM divisions LIMIT 1);

-- Test 3: Delete a kabinet (all related pengurus and divisions should be deleted)
-- Uncomment to test:
-- DELETE FROM kabinets WHERE id = (SELECT id FROM kabinets WHERE is_active = false LIMIT 1);

-- ============================================================
-- 8. FINAL VERIFICATION QUERY
-- ============================================================

-- Run this to see current state
SELECT 
    'kabinets' as table_name, 
    COUNT(*) as record_count 
FROM kabinets
UNION ALL
SELECT 
    'divisions' as table_name, 
    COUNT(*) as record_count 
FROM divisions
UNION ALL
SELECT 
    'pengurus' as table_name, 
    COUNT(*) as record_count 
FROM pengurus;

-- ============================================================
-- CARA MENGGUNAKAN
-- ============================================================
-- 1. Copy semua isi file ini
-- 2. Buka Supabase Dashboard → SQL Editor
-- 3. Paste dan jalankan (Run)
-- 4. Lihat hasil query untuk verifikasi
-- 5. Jika ada error, perbaiki sesuai pesan error
-- ============================================================