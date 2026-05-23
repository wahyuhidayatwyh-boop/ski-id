-- ============================================================
-- ADDITIONAL MIGRATION: KABINETS TABLE
-- Tambahkan di bawah migration.sql yang sudah ada
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- KABINETS TABLE - Menyimpan data kabinet SKI per periode
-- ============================================================
CREATE TABLE IF NOT EXISTS kabinets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                      -- "Al-Istiqomah"
    period TEXT NOT NULL,                    -- "2025 / 2026"
    logo_url TEXT,                           -- URL logo kabinet
    tagline TEXT,                            -- motto kabinet
    description TEXT,                        -- deskripsi kabinet
    visi TEXT,                               -- visi kabinet
    misi JSONB DEFAULT '[]',                 -- array of string misi
    structure_image_url TEXT,                -- URL gambar bagan struktur
    is_active BOOLEAN DEFAULT false,         -- kabinet aktif saat ini
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- UPDATE PENGURUS TABLE - Tambah kolom kabinet & role
-- ============================================================
ALTER TABLE pengurus 
    ADD COLUMN IF NOT EXISTS kabinet_id UUID REFERENCES kabinets(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS role_level VARCHAR(50) DEFAULT 'staff';
    -- role_level: ketuum, wakil, sekretaris1, sekretaris2, 
    --             bendahara1, bendahara2, dpo, lso_ketua, div_ketua, staff

-- ============================================================
-- RLS untuk kabinets
-- ============================================================
ALTER TABLE kabinets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read kabinets" ON kabinets;
DROP POLICY IF EXISTS "Auth insert kabinets" ON kabinets;
DROP POLICY IF EXISTS "Auth update kabinets" ON kabinets;
DROP POLICY IF EXISTS "Auth delete kabinets" ON kabinets;

CREATE POLICY "Public read kabinets"  ON kabinets FOR SELECT USING (true);
CREATE POLICY "Auth insert kabinets"  ON kabinets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update kabinets"  ON kabinets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete kabinets"  ON kabinets FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Trigger updated_at untuk kabinets
-- ============================================================
DROP TRIGGER IF EXISTS update_kabinets_updated_at ON kabinets;
CREATE TRIGGER update_kabinets_updated_at BEFORE UPDATE ON kabinets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA — Import kabinet Al-Istiqomah dari cabinets.ts
-- Jalankan SETELAH tabel dibuat
-- ============================================================
INSERT INTO kabinets (name, period, logo_url, tagline, description, visi, misi, is_active)
VALUES (
    'Al - Istiqomah',
    '2025 / 2026',
    '/Logo%20SKI%20TEL-U%20P.png',
    'Istiqomah dalam Dakwah, Unggul dalam Prestasi',
    'Kabinet Al - Istiqomah dibentuk dengan komitmen kuat untuk menjaga konsistensi syiar dakwah di lingkungan kampus Universitas Telkom Purwokerto.',
    'Menjadikan Sentral Kerohanian Islam (SKI) sebagai wadah utama pembinaan karakter Islami mahasiswa yang istiqomah, adaptif, kolaboratif, serta berdaya guna tinggi bagi almamater dan masyarakat.',
    '["Mengoptimalkan sistem kaderisasi yang berkelanjutan dan terstruktur guna melahirkan generasi Robbani.", "Menggalakkan syiar dakwah yang kreatif, moderat, dan bersahabat bagi seluruh sivitas akademika.", "Mempererat ukhuwah islamiyah dan kolaborasi aktif lintas organisasi di kampus maupun luar kampus.", "Mengembangkan layanan kemahasiswaan berbasis kepedulian sosial dan pemberdayaan umat.", "Meningkatkan tata kelola organisasi yang profesional, transparan, dan berbasis teknologi informasi."]'::jsonb,
    true
) ON CONFLICT DO NOTHING;

INSERT INTO kabinets (name, period, logo_url, tagline, description, visi, misi, is_active)
VALUES (
    'Al - Fatih',
    '2024 / 2025',
    '/Logo%20SKI%20TEL-U%20P.png',
    'Bergerak Bersama, Berdampak Nyata',
    'Kabinet Al - Fatih membawa misi pembaharuan dakwah yang adaptif terhadap dinamika mahasiswa.',
    'Terwujudnya Sentral Kerohanian Islam sebagai lokomotif dakwah inspiratif yang mencetak insan akademis berkarakter Robbani.',
    '["Menyelenggarakan kajian intensif berorientasi pada pemecahan masalah mahasiswa modern.", "Menguatkan jejaring alumni untuk kolaborasi peningkatan soft skill pengurus.", "Menginisiasi aksi sosial rutin di lingkungan masyarakat sekitar kampus."]'::jsonb,
    false
) ON CONFLICT DO NOTHING;
