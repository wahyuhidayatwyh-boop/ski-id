-- ============================================================
-- DAKWAH-OS MIGRATION V4 (UPDATE FOR ACARA PORTAL)
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tambah kolom attachment dan meeting link di acara_internal
ALTER TABLE acara_internal ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE acara_internal ADD COLUMN IF NOT EXISTS meeting_link TEXT;
