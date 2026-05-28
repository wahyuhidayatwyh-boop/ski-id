-- ============================================================
-- DAKWAH-OS MIGRATION V4 (UPDATE FOR ACARA PORTAL)
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tambah kolom yang hilang di acara_internal
ALTER TABLE acara_internal ADD COLUMN IF NOT EXISTS proker_id UUID REFERENCES prokers(id) ON DELETE SET NULL;
ALTER TABLE acara_internal ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE acara_internal ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- 2. Pastikan end_time boleh NULL (agar acara dari portal tidak error)
ALTER TABLE acara_internal ALTER COLUMN end_time DROP NOT NULL;

-- 3. Paksa Supabase API Cache untuk me-reload skema baru (MENGHILANGKAN ERROR SCHEMA CACHE)
NOTIFY pgrst, 'reload schema';
