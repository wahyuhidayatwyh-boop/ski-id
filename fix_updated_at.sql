-- FIX MISSING UPDATED_AT COLUMNS
-- Jalankan ini di Supabase SQL Editor untuk mengatasi error "record new has no field updated_at"

ALTER TABLE acara_internal ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE prokers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE proker_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Khusus untuk absensi digital jika terlanjur kena trigger
ALTER TABLE absensi_digital ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
