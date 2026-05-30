-- ============================================================
-- MIGRASI LENGKAP UNTUK MODUL PEMBAYARAN KAS PENGURUS
-- Jalankan di Supabase Dashboard → SQL Editor
-- 
-- File ini menggabungkan semua dependency yang dibutuhkan:
-- 1. Tabel divisions (jika belum ada)
-- 2. Tabel pengurus (jika belum ada)
-- 3. Tabel kabinets (jika belum ada)
-- 4. Tabel pembayaran_kas
-- ============================================================

-- ============================================================
-- BAGIAN 1: TABEL DIVISIONS (Divisi Organisasi)
-- ============================================================
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    hero_image_url TEXT,
    vision TEXT,
    mission TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS for divisions
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read divisions" ON divisions;
DROP POLICY IF EXISTS "Auth insert divisions" ON divisions;
DROP POLICY IF EXISTS "Auth update divisions" ON divisions;
DROP POLICY IF EXISTS "Auth delete divisions" ON divisions;

CREATE POLICY "Public read divisions" ON divisions FOR SELECT USING (true);
CREATE POLICY "Auth insert divisions" ON divisions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update divisions" ON divisions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete divisions" ON divisions FOR DELETE TO authenticated USING (true);

-- ============================================================
-- BAGIAN 2: TABEL PENGURUS (Anggota Organisasi)
-- ============================================================
CREATE TABLE IF NOT EXISTS pengurus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    jabatan TEXT,
    nim VARCHAR(50),
    prodi VARCHAR(100),
    phone_number VARCHAR(20),
    photo_url TEXT,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    kabinet_id UUID, -- akan di-set foreign key setelah tabel kabinets dibuat
    role_level VARCHAR(50) DEFAULT 'staff',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS for pengurus
ALTER TABLE pengurus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read pengurus" ON pengurus;
DROP POLICY IF EXISTS "Auth insert pengurus" ON pengurus;
DROP POLICY IF EXISTS "Auth update pengurus" ON pengurus;
DROP POLICY IF EXISTS "Auth delete pengurus" ON pengurus;

CREATE POLICY "Public read pengurus" ON pengurus FOR SELECT USING (true);
CREATE POLICY "Auth insert pengurus" ON pengurus FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update pengurus" ON pengurus FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete pengurus" ON pengurus FOR DELETE TO authenticated USING (true);

-- Trigger updated_at for pengurus
DROP TRIGGER IF EXISTS update_pengurus_updated_at ON pengurus;

-- ============================================================
-- BAGIAN 3: TABEL KABINETS (Kabinet SKI Per Periode)
-- ============================================================
CREATE TABLE IF NOT EXISTS kabinets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    period TEXT NOT NULL,
    logo_url TEXT,
    tagline TEXT,
    description TEXT,
    visi TEXT,
    misi JSONB DEFAULT '[]',
    structure_image_url TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS for kabinets
ALTER TABLE kabinets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read kabinets" ON kabinets;
DROP POLICY IF EXISTS "Auth insert kabinets" ON kabinets;
DROP POLICY IF EXISTS "Auth update kabinets" ON kabinets;
DROP POLICY IF EXISTS "Auth delete kabinets" ON kabinets;

CREATE POLICY "Public read kabinets" ON kabinets FOR SELECT USING (true);
CREATE POLICY "Auth insert kabinets" ON kabinets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update kabinets" ON kabinets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete kabinets" ON kabinets FOR DELETE TO authenticated USING (true);

-- Sekarang set foreign key pengurus.kabinet_id ke kabinets
ALTER TABLE pengurus 
    DROP CONSTRAINT IF EXISTS pengurus_kabinet_id_fkey;

ALTER TABLE pengurus 
    ADD CONSTRAINT pengurus_kabinet_id_fkey 
    FOREIGN KEY (kabinet_id) REFERENCES kabinets(id) ON DELETE SET NULL;

-- Seed data untuk kabinet (hanya jika belum ada)
INSERT INTO kabinets (id, name, period, logo_url, tagline, description, visi, misi, is_active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Al - Istiqomah',
    '2025 / 2026',
    '/Logo%20SKI%20TEL-U%20P.png',
    'Istiqomah dalam Dakwah, Unggul dalam Prestasi',
    'Kabinet Al - Istiqomah dibentuk dengan komitmen kuat untuk menjaga konsistensi syiar dakwah di lingkungan kampus Universitas Telkom Purwokerto.',
    'Menjadikan Sentral Kerohanian Islam (SKI) sebagai wadah utama pembinaan karakter Islami mahasiswa yang istiqomah, adaptif, kolaboratif, serta berdaya guna tinggi bagi almamater dan masyarakat.',
    '["Mengoptimalkan sistem kaderisasi yang berkelanjutan dan terstruktur guna melahirkan generasi Robbani.", "Menggalakkan syiar dakwah yang kreatif, moderat, dan bersahabat bagi seluruh sivitas akademika.", "Mempererat ukhuwah islamiyah dan kolaborasi aktif lintas organisasi di kampus maupun luar kampus.", "Mengembangkan layanan kemahasiswaan berbasis kepedulian sosial dan pemberdayaan umat.", "Meningkatkan tata kelola organisasi yang profesional, transparan, dan berbasis teknologi informasi."]'::jsonb,
    true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO kabinets (id, name, period, logo_url, tagline, description, visi, misi, is_active)
VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Al - Fatih',
    '2024 / 2025',
    '/Logo%20SKI%20TEL-U%20P.png',
    'Bergerak Bersama, Berdampak Nyata',
    'Kabinet Al - Fatih membawa misi pembaharuan dakwah yang adaptif terhadap dinamika mahasiswa.',
    'Terwujudnya Sentral Kerohanian Islam sebagai lokomotif dakwah inspiratif yang mencetak insan akademis berkarakter Robbani.',
    '["Menyelenggarakan kajian intensif berorientasi pada pemecahan masalah mahasiswa modern.", "Menguatkan jejaring alumni untuk kolaborasi peningkatan soft skill pengurus.", "Menginisiasi aksi sosial rutin di lingkungan masyarakat sekitar kampus."]'::jsonb,
    false
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BAGIAN 4: FUNCTION update_updated_at_column
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON divisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pengurus_updated_at BEFORE UPDATE ON pengurus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kabinets_updated_at BEFORE UPDATE ON kabinets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- BAGIAN 5: TABEL PEMBAYARAN KAS (Inti Modul)
-- ============================================================
CREATE TABLE IF NOT EXISTS pembayaran_kas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengurus_id UUID REFERENCES pengurus(id) ON DELETE CASCADE,
    kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    bulan INTEGER NOT NULL CHECK (bulan >= 1 AND bulan <= 12),
    tahun INTEGER NOT NULL CHECK (tahun >= 2020),
    bukti_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES pengurus(id) ON DELETE SET NULL
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_pembayaran_kas_pengurus ON pembayaran_kas(pengurus_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_kas_kabinet ON pembayaran_kas(kabinet_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_kas_division ON pembayaran_kas(division_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_kas_bulan_tahun ON pembayaran_kas(bulan, tahun);
CREATE INDEX IF NOT EXISTS idx_pembayaran_kas_status ON pembayaran_kas(status);

-- RLS Policies
ALTER TABLE pembayaran_kas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pengurus can insert own pembayaran_kas" ON pembayaran_kas;
DROP POLICY IF EXISTS "Pengurus can view own pembayaran_kas" ON pembayaran_kas;
DROP POLICY IF EXISTS "POH/Bendahara can view all pembayaran_kas" ON pembayaran_kas;
DROP POLICY IF EXISTS "POH/Bendahara can update pembayaran_kas" ON pembayaran_kas;

-- Pengurus bisa membuat pembayaran kas mereka sendiri
CREATE POLICY "Pengurus can insert own pembayaran_kas"
    ON pembayaran_kas FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Pengurus bisa melihat pembayaran kas mereka sendiri
CREATE POLICY "Pengurus can view own pembayaran_kas"
    ON pembayaran_kas FOR SELECT
    TO authenticated
    USING (pengurus_id IN (
        SELECT id FROM pengurus WHERE pengurus.user_id = auth.uid()
    ));

-- POH/Bendahara bisa melihat semua pembayaran kas
CREATE POLICY "POH/Bendahara can view all pembayaran_kas"
    ON pembayaran_kas FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM pengurus p 
            WHERE p.user_id = auth.uid() 
            AND p.role_level IN ('ketuum', 'wakil', 'sekretaris1', 'sekretaris2', 'bendahara1', 'bendahara2', 'dpo')
        )
    );

-- POH/Bendahara bisa update status verifikasi
CREATE POLICY "POH/Bendahara can update pembayaran_kas"
    ON pembayaran_kas FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM pengurus p 
            WHERE p.user_id = auth.uid() 
            AND p.role_level IN ('ketuum', 'wakil', 'sekretaris1', 'sekretaris2', 'bendahara1', 'bendahara2', 'dpo')
        )
    )
    WITH CHECK (true);

-- View untuk rekap status pembayaran kas per pengurus
CREATE OR REPLACE VIEW vw_status_kas_pengurus AS
SELECT 
    p.id AS pengurus_id,
    p.full_name,
    p.nim,
    p.prodi,
    p.division_id,
    d.name AS division_name,
    k.id AS kabinet_id,
    k.name AS kabinet_name,
    k.period AS kabinet_period,
    pk.bulan,
    pk.tahun,
    pk.amount,
    pk.status,
    pk.bukti_url,
    pk.catatan,
    pk.created_at,
    pk.verified_at
FROM pengurus p
LEFT JOIN divisions d ON p.division_id = d.id
LEFT JOIN kabinets k ON p.kabinet_id = k.id
LEFT JOIN pembayaran_kas pk ON p.id = pk.pengurus_id
WHERE p.status = 'active';

-- View untuk rekap total kas per bulan
CREATE OR REPLACE VIEW vw_rekap_kas_bulanan AS
SELECT 
    k.id AS kabinet_id,
    k.name AS kabinet_name,
    k.period,
    pk.bulan,
    pk.tahun,
    pk.status,
    COUNT(*) AS jumlah_pengurus,
    SUM(pk.amount) AS total_amount,
    COUNT(CASE WHEN pk.status = 'VERIFIED' THEN 1 END) AS verified_count,
    COUNT(CASE WHEN pk.status = 'PENDING' THEN 1 END) AS pending_count,
    COUNT(CASE WHEN pk.status = 'REJECTED' THEN 1 END) AS rejected_count
FROM pembayaran_kas pk
JOIN kabinets k ON pk.kabinet_id = k.id
GROUP BY k.id, k.name, k.period, pk.bulan, pk.tahun, pk.status
ORDER BY pk.tahun DESC, pk.bulan DESC;

-- ============================================================
-- SELESAI - Verifikasi tabel telah dibuat
-- ============================================================
-- Cek di Table Editor Supabase untuk memastikan tabel:
-- - divisions
-- - pengurus  
-- - kabinets
-- - pembayaran_kas
-- sudah muncul dengan benar.