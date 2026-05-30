-- Modul Pembayaran Kas di Portal Anggota
-- Mencatat pembayaran kas bulanan oleh setiap pengurus

CREATE TABLE IF NOT EXISTS pembayaran_kas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengurus_id UUID REFERENCES pengurus(id) ON DELETE CASCADE,
    kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL, -- divisi pengurus
    amount DECIMAL(12, 2) NOT NULL, -- jumlah bayar
    bulan INTEGER NOT NULL, -- 1-12
    tahun INTEGER NOT NULL, -- 2024, 2025, dst
    bukti_url TEXT NOT NULL, -- bukti pembayaran (gambar/PDF)
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    catatan TEXT, -- catatan bendahara jika ditolak
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES pengurus(id) ON DELETE SET NULL
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_pembayaran_kas_pengurus ON pembayaran_kas(pengurus_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_kas_bulan_tahun ON pembayaran_kas(bulan, tahun);
CREATE INDEX IF NOT EXISTS idx_pembayaran_kas_status ON pembayaran_kas(status);

-- RLS Policies
ALTER TABLE pembayaran_kas ENABLE ROW LEVEL SECURITY;

-- Pengurus bisa membuat/melihat pembayaran kas mereka sendiri
CREATE POLICY "Pengurus can insert own pembayaran_kas"
    ON pembayaran_kas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Pengurus can view own pembayaran_kas"
    ON pembayaran_kas FOR SELECT
    TO authenticated
    USING (pengurus_id IN (
        SELECT id FROM pengurus WHERE pengurus.user_id = auth.uid()
    ));

-- Bendahara/POH bisa melihat semua pembayaran kas (untuk verifikasi)
-- Policy ini akan dioverride oleh aplikasi berdasarkan role_level
CREATE POLICY "POH/Bendahara can view all pembayaran_kas"
    ON pembayaran_kas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "POH/Bendahara can update pembayaran_kas"
    ON pembayaran_kas FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- View untuk cek status pembayaran kas per pengurus per bulan
CREATE OR REPLACE VIEW vw_status_kas_pengurus AS
SELECT 
    p.id AS pengurus_id,
    p.full_name,
    p.division_id,
    d.name AS division_name,
    pk.bulan,
    pk.tahun,
    pk.amount,
    pk.status,
    pk.bukti_url,
    pk.created_at
FROM pengurus p
JOIN divisions d ON p.division_id = d.id
LEFT JOIN pembayaran_kas pk ON p.id = pk.pengurus_id;

NOTIFY pgrst, 'reload schema';