-- ============================================================
-- DAKWAH-OS MIGRATION V2 (UPDATE FOR DIVISION DETAILS)
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. UPDATE DIVISIONS TABLE
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS vision TEXT;
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS mission TEXT;

-- 2. UPDATE PROKERS TABLE (Add Image)
ALTER TABLE prokers ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. LINK PENGURUS TO USERS (If not yet)
ALTER TABLE pengurus ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE pengurus ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- 4. TABLE PROKERS (Program Kerja)
CREATE TABLE IF NOT EXISTS prokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TABLE PROKER_TASKS (Sub-Tugas Proker)
CREATE TABLE IF NOT EXISTS proker_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proker_id UUID REFERENCES prokers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES pengurus(id) ON DELETE SET NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. TABLE ACARA_INTERNAL (Event Dakwah-OS)
CREATE TABLE IF NOT EXISTS acara_internal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proker_id UUID REFERENCES prokers(id) ON DELETE CASCADE,
    kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    location TEXT,
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, live, finished
    jwt_secret_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. TABLE ABSENSI_DIGITAL (Kehadiran Event)
CREATE TABLE IF NOT EXISTS absensi_digital (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acara_id UUID REFERENCES acara_internal(id) ON DELETE CASCADE,
    pengurus_id UUID REFERENCES pengurus(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'hadir', -- hadir, izin, sakit, alpa
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(acara_id, pengurus_id)
);

-- 8. TABLE COMMITTEE_ROLES (Record Peran Kepanitiaan)
CREATE TABLE IF NOT EXISTS committee_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acara_id UUID REFERENCES acara_internal(id) ON DELETE CASCADE,
    pengurus_id UUID REFERENCES pengurus(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(acara_id, pengurus_id)
);

-- 9. TABLE DOCUMENTS (Proposal & LPJ Vault)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- proposal, lpj
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    uploaded_by UUID REFERENCES pengurus(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- REFRESH RLS POLICIES
-- Pastikan tabel ada dulu sebelum enable rls, di-skip scriptnya jika tidak diperlukan
-- Tapi karena CREATE TABLE IF NOT EXISTS, jadi aman.
