-- ============================================================
-- ADD KABINET_ID TO DIVISIONS TABLE
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- Add kabinet_id column to divisions table
ALTER TABLE divisions 
ADD COLUMN IF NOT EXISTS kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_divisions_kabinet_id ON divisions(kabinet_id);

-- Update existing divisions to associate with the active cabinet (if any)
UPDATE divisions 
SET kabinet_id = (
    SELECT id FROM kabinets WHERE is_active = true LIMIT 1
)
WHERE kabinet_id IS NULL;

-- ============================================================
-- CARA MENGGUNAKAN:
-- - Divisi sekarang terikat pada kabinet tertentu
-- - Saat membuat divisi baru, pilih kabinet yang sesuai
-- - Divisi hanya akan muncul di kabinet yang dipilih
-- ============================================================