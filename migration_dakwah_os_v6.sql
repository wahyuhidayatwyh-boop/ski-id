-- ============================================================
-- DAKWAH-OS MIGRATION V6 (KNOWLEDGE BASE REVAMP)
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. UPDATE knowledge_base: Tambah kolom division_id, file_size, file_type
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS division_id UUID REFERENCES divisions(id) ON DELETE SET NULL;
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0;
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE;

-- 2. RLS untuk knowledge_base (semua pengurus bisa insert, semua bisa read)
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Semua bisa lihat knowledge_base" ON knowledge_base;
CREATE POLICY "Semua bisa lihat knowledge_base"
    ON knowledge_base FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Semua pengurus bisa insert knowledge_base" ON knowledge_base;
CREATE POLICY "Semua pengurus bisa insert knowledge_base"
    ON knowledge_base FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Pemilik bisa delete knowledge_base" ON knowledge_base;
CREATE POLICY "Pemilik bisa delete knowledge_base"
    ON knowledge_base FOR DELETE
    USING (true);

-- 3. RLS untuk documents (semua pengurus bisa insert & read)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Semua bisa lihat documents" ON documents;
CREATE POLICY "Semua bisa lihat documents"
    ON documents FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Semua pengurus bisa insert documents" ON documents;
CREATE POLICY "Semua pengurus bisa insert documents"
    ON documents FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Semua pengurus bisa update documents" ON documents;
CREATE POLICY "Semua pengurus bisa update documents"
    ON documents FOR UPDATE
    USING (true);

-- 4. Paksa Supabase me-reload schema cache
NOTIFY pgrst, 'reload schema';
