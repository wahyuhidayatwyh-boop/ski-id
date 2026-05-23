-- ============================================================
-- COMPLETE ORGANIZATIONAL STRUCTURE MIGRATION FOR SKI WEBSITE
-- Jalankan di Supabase Dashboard → SQL Editor
-- Struktur: Kabinet → DPO/POH → Divisi → LSO → Anggota
-- ============================================================

-- ============================================================
-- 1. DIVISIONS TABLE (Divisi Organisasi)
-- ============================================================
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 2. KABINETS TABLE (Kabinet SKI per periode)
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

-- ============================================================
-- 3. PENGURUS TABLE (Anggota Organisasi)
-- Column kabinet_id & division_id menghubungkan ke struktur
-- ============================================================
CREATE TABLE IF NOT EXISTS pengurus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    jabatan TEXT,
    nim VARCHAR(50),
    prodi VARCHAR(100),
    photo_url TEXT,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    kabinet_id UUID REFERENCES kabinets(id) ON DELETE SET NULL,
    role_level VARCHAR(50) DEFAULT 'staff',
    -- role_level values:
    -- 'ketuum' = Ketua Umum
    -- 'wakil' = Wakil Ketua
    -- 'sekretaris1' = Sekretaris 1
    -- 'sekretaris2' = Sekretaris 2
    -- 'bendahara1' = Bendahara 1
    -- 'bendahara2' = Bendahara 2
    -- 'dpo' = Data Protection Officer (setara Wakil)
    -- 'poh' = Pejabat Operasional Harian (opsional)
    -- 'lso_ketua' = Koordinator LSO
    -- 'div_ketua' = Koordinator Divisi
    -- 'staff' = Anggota/Staff biasa
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 4. RLS Policies
-- ============================================================
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kabinets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengurus ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read divisions" ON divisions;
DROP POLICY IF EXISTS "Auth full access divisions" ON divisions;
DROP POLICY IF EXISTS "Public read kabinets" ON kabinets;
DROP POLICY IF EXISTS "Auth full access kabinets" ON kabinets;
DROP POLICY IF EXISTS "Public read pengurus" ON pengurus;
DROP POLICY IF EXISTS "Auth full access pengurus" ON pengurus;

-- Public can read all
CREATE POLICY "Public read divisions" ON divisions FOR SELECT USING (true);
CREATE POLICY "Public read kabinets" ON kabinets FOR SELECT USING (true);
CREATE POLICY "Public read pengurus" ON pengurus FOR SELECT USING (true);

-- Authenticated users can full access
CREATE POLICY "Auth full access divisions" ON divisions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access kabinets" ON kabinets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth full access pengurus" ON pengurus FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 5. Trigger updated_at
-- ============================================================
DROP TRIGGER IF EXISTS update_kabinets_updated_at ON kabinets;
DROP TRIGGER IF EXISTS update_pengurus_updated_at ON pengurus;

CREATE TRIGGER update_kabinets_updated_at BEFORE UPDATE ON kabinets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pengurus_updated_at BEFORE UPDATE ON pengurus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. SEED DATA - Divisi Contoh
-- ============================================================
INSERT INTO divisions (name, description, icon) VALUES
('Syiar & Dakwah', 'Mengelola kajian, ceramah, dan kegiatan dakwah kampus', '🕌'),
('Media & Informasi', 'Mengelola media sosial, website, dan publikasi', '📱'),
('Humas & Kerjasama', 'Menjalin hubungan dengan pihak eksternal dan internal', '🤝'),
('Pendidikan & Kaderisasi', 'Mengelola program pendidikan dan kaderisasi anggota', '📚'),
('Sosial & Masyarakat', 'Kegiatan bakti sosial dan pemberdayaan masyarakat', '❤️'),
('Ekonomi & Danus', 'Mengelola usaha dana usaha dan keuangan', '💰'),
('Olahraga & Seni', 'Mengembangkan bakat olahraga dan seni anggota', '🎨'),
('Perempuan & Anak', 'Fokus pada pemberdayaan perempuan dan anak', '👩')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. SEED DATA - Kabinet Contoh (jika belum ada)
-- ============================================================
INSERT INTO kabinets (name, period, logo_url, tagline, description, visi, misi, is_active)
VALUES (
    'Al-Istiqomah',
    '2025 / 2026',
    '/Logo%20SKI%20TEL-U%20P.png',
    'Istiqomah dalam Dakwah, Unggul dalam Prestasi',
    'Kabinet Al-Istiqomah dibentuk dengan komitmen kuat untuk menjaga konsistensi syiar dakwah.',
    'Menjadikan SKI sebagai wadah utama pembinaan karakter Islami mahasiswa.',
    '["Mengoptimalkan sistem kaderisasi yang berkelanjutan.", "Menggalakkan syiar dakwah yang kreatif.", "Mempererat ukhuwah islamiyah."]'::jsonb,
    true
) ON CONFLICT DO NOTHING;

-- ============================================================
-- CARA MENGGUNAKAN STRUKTUR:
-- ============================================================
-- 1. Buat Divisi: INSERT INTO divisions (name, description) VALUES ('Nama Divisi', 'Deskripsi');
-- 2. Buat Kabinet: INSERT INTO kabinets (name, period, ...) VALUES (...);
-- 3. Tambah Pengurus:
--    - Ketua Umum: role_level='ketuum', division_id=NULL, kabinet_id='...'
--    - DPO: role_level='dpo', division_id=NULL, kabinet_id='...'
--    - Koordinator Divisi: role_level='div_ketua', division_id='...', kabinet_id='...'
--    - Staff Divisi: role_level='staff', division_id='...', kabinet_id='...'
--    - LSO: role_level='lso_ketua', division_id=NULL, kabinet_id='...'
-- ============================================================