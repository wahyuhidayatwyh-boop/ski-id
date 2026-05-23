-- ============================================================
-- FIX CASCADE DELETE FOR KABINET, DIVISI, PENGURUS
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Fix pengurus -> kabinets foreign key (ON DELETE CASCADE)
-- Drop existing constraint if exists and recreate with CASCADE
ALTER TABLE pengurus 
DROP CONSTRAINT IF EXISTS pengurus_kabinet_id_fkey;

ALTER TABLE pengurus
ADD CONSTRAINT pengurus_kabinet_id_fkey 
FOREIGN KEY (kabinet_id) REFERENCES kabinets(id) ON DELETE CASCADE;

-- 2. Fix pengurus -> divisions foreign key (ON DELETE SET NULL)
-- When division is deleted, pengurus still exists but without division
ALTER TABLE pengurus 
DROP CONSTRAINT IF EXISTS pengurus_division_id_fkey;

ALTER TABLE pengurus
ADD CONSTRAINT pengurus_division_id_fkey 
FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL;

-- 3. Fix divisions -> kabinets foreign key (ON DELETE CASCADE)
-- When kabinet is deleted, all its divisions are also deleted
ALTER TABLE divisions 
DROP CONSTRAINT IF EXISTS divisions_kabinet_id_fkey;

ALTER TABLE divisions
ADD CONSTRAINT divisions_kabinet_id_fkey 
FOREIGN KEY (kabinet_id) REFERENCES kabinets(id) ON DELETE CASCADE;

-- ============================================================
-- VERIFIKASI CONSTRAINTS
-- ============================================================
-- Setelah menjalankan script ini, Anda bisa verifikasi dengan:
-- SELECT conname, contype, confdeltype 
-- FROM pg_constraint 
-- WHERE conrelid = 'pengurus'::regclass OR conrelid = 'divisions'::regclass;

-- ============================================================
-- PENJELASAN
-- ============================================================
-- ON DELETE CASCADE: Saat parent dihapus, child juga ikut terhapus
-- ON DELETE SET NULL: Saat parent dihapus, foreign key di-child jadi NULL

-- Struktur sekarang:
-- - Hapus Kabinet → Pengurus & Divisi terkait ikut terhapus
-- - Hapus Divisi → Pengurus di divisi tersebut jadi tanpa divisi (NULL)
-- - Hapus Pengurus → Tidak mempengaruhi yang lain

-- ============================================================
-- CARA MENGGUNAKAN DELETE DI ADMIN
-- ============================================================
-- Setelah migration ini, tombol hapus di admin akan berfungsi:
-- 1. Hapus Kabinet: Akan hapus semua pengurus & divisi di kabinet tersebut
-- 2. Hapus Divisi: Pengurus di divisi tetap ada (tanpa divisi)
-- 3. Hapus Pengurus: Hanya hapus pengurus tersebut
-- ============================================================