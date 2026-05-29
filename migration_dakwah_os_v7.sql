-- ============================================================
-- DAKWAH-OS MIGRATION V7 (DYNAMIC NESTED FOLDERS)
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. TABLE KNOWLEDGE_FOLDERS
CREATE TABLE IF NOT EXISTS knowledge_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES knowledge_folders(id) ON DELETE CASCADE,
    kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE, -- Jika NULL, berarti folder Umum
    created_by UUID REFERENCES pengurus(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. UPDATE KNOWLEDGE_BASE
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES knowledge_folders(id) ON DELETE CASCADE;

-- 3. RLS untuk knowledge_folders
ALTER TABLE knowledge_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Semua bisa lihat knowledge_folders" ON knowledge_folders;
CREATE POLICY "Semua bisa lihat knowledge_folders"
    ON knowledge_folders FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Semua pengurus bisa insert knowledge_folders" ON knowledge_folders;
CREATE POLICY "Semua pengurus bisa insert knowledge_folders"
    ON knowledge_folders FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Semua pengurus bisa delete knowledge_folders" ON knowledge_folders;
CREATE POLICY "Semua pengurus bisa delete knowledge_folders"
    ON knowledge_folders FOR DELETE
    USING (true);

-- 4. Paksa Supabase me-reload schema cache
NOTIFY pgrst, 'reload schema';
