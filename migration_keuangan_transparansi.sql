-- Modul Keuangan SKI (Transparansi)
-- Digunakan untuk mencatat pemasukan, pengeluaran, donasi, dan alokasi dana per divisi

CREATE TABLE IF NOT EXISTS keuangan_transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL, -- Null berarti transaksi umum/organisasi
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')), -- IN = Pemasukan, OUT = Pengeluaran
    kategori VARCHAR(50) NOT NULL, -- Donasi, Kas Anggota, Dana Usaha, Operasional, Proker Divisi, Lain-lain
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES pengurus(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS Policies untuk Keuangan
ALTER TABLE keuangan_transaksi ENABLE ROW LEVEL SECURITY;

-- Semua orang bisa membaca data keuangan (Transparansi penuh)
CREATE POLICY "Public read keuangan_transaksi" 
    ON keuangan_transaksi FOR SELECT 
    USING (true);

-- Hanya bisa diedit/ditambah oleh pengurus terautentikasi (nanti difilter di aplikasi hanya Bendahara)
CREATE POLICY "Auth full access keuangan_transaksi" 
    ON keuangan_transaksi FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- View untuk menghitung saldo divisi secara otomatis
CREATE OR REPLACE VIEW vw_saldo_divisi AS
SELECT 
    d.id AS division_id,
    d.name AS division_name,
    k.id AS kabinet_id,
    k.name AS kabinet_name,
    COALESCE(SUM(CASE WHEN t.type = 'IN' THEN t.amount ELSE 0 END), 0) AS total_pemasukan,
    COALESCE(SUM(CASE WHEN t.type = 'OUT' THEN t.amount ELSE 0 END), 0) AS total_pengeluaran,
    COALESCE(SUM(CASE WHEN t.type = 'IN' THEN t.amount ELSE -t.amount END), 0) AS saldo_akhir
FROM 
    divisions d
CROSS JOIN 
    kabinets k
LEFT JOIN 
    keuangan_transaksi t ON t.division_id = d.id AND t.kabinet_id = k.id
GROUP BY 
    d.id, d.name, k.id, k.name;

NOTIFY pgrst, 'reload schema';
