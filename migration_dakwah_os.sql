-- ============================================================
-- DAKWAH-OS MIGRATION
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. LINK PENGURUS TO USERS
ALTER TABLE pengurus ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE pengurus ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- 2. TABLE PROKERS (Program Kerja)
CREATE TABLE IF NOT EXISTS prokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, finished
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TABLE PROKER_TASKS (Sub-Tugas Proker)
CREATE TABLE IF NOT EXISTS proker_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proker_id UUID REFERENCES prokers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES pengurus(id) ON DELETE SET NULL, -- Assigned staff
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. TABLE ACARA_INTERNAL (Event Dakwah-OS)
CREATE TABLE IF NOT EXISTS acara_internal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 5. TABLE ABSENSI_DIGITAL (Kehadiran Event)
CREATE TABLE IF NOT EXISTS absensi_digital (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acara_id UUID REFERENCES acara_internal(id) ON DELETE CASCADE,
    pengurus_id UUID REFERENCES pengurus(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'hadir', -- hadir, izin, sakit, alpa
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(acara_id, pengurus_id)
);

-- 6. TABLE COMMITTEE_ROLES (Record Peran Kepanitiaan)
CREATE TABLE IF NOT EXISTS committee_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acara_id UUID REFERENCES acara_internal(id) ON DELETE CASCADE,
    pengurus_id UUID REFERENCES pengurus(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL, -- Coordinator, PJ Sub-Tugas, Peserta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(acara_id, pengurus_id)
);

-- 7. TABLE DOCUMENTS (Proposal & LPJ Vault)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- proposal, lpj
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, reviewed_bendahara, reviewed_sekretaris, approved
    uploaded_by UUID REFERENCES pengurus(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS
ALTER TABLE prokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE proker_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE acara_internal ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi_digital ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Public can read for portal
CREATE POLICY "Public read prokers" ON prokers FOR SELECT USING (true);
CREATE POLICY "Public read proker_tasks" ON proker_tasks FOR SELECT USING (true);
CREATE POLICY "Public read acara_internal" ON acara_internal FOR SELECT USING (true);
CREATE POLICY "Public read absensi_digital" ON absensi_digital FOR SELECT USING (true);
CREATE POLICY "Public read committee_roles" ON committee_roles FOR SELECT USING (true);
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);

-- Auth users full access
CREATE POLICY "Auth full access prokers" ON prokers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access proker_tasks" ON proker_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access acara_internal" ON acara_internal FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access absensi_digital" ON absensi_digital FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access committee_roles" ON committee_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access documents" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_prokers_updated_at BEFORE UPDATE ON prokers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proker_tasks_updated_at BEFORE UPDATE ON proker_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_acara_internal_updated_at BEFORE UPDATE ON acara_internal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
