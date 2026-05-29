-- ============================================================
-- DAKWAH-OS MIGRATION V5 (FULL MODUL INTEGRATION)
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. MODUL VAULT APPROVAL (Update table documents)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS proker_id UUID REFERENCES prokers(id) ON DELETE CASCADE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS catatan_revisi TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_by_bendahara UUID REFERENCES pengurus(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_by_sekretaris UUID REFERENCES pengurus(id) ON DELETE SET NULL;
-- Status documents: 'draft', 'cek_bendahara', 'revisi_bendahara', 'cek_sekretaris', 'approved', 'rejected'

-- 2. MODUL FINANCIAL DASHBOARD (Table transactions)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'pemasukan', 'pengeluaran'
    category VARCHAR(100) NOT NULL, -- 'dana_kampus', 'donasi_umat', 'kas_rutin', 'proker'
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    description TEXT,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    proker_id UUID REFERENCES prokers(id) ON DELETE SET NULL,
    proof_url TEXT, -- Foto nota / bukti transfer
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_by UUID REFERENCES pengurus(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. MODUL KNOWLEDGE MANAGEMENT (Table knowledge_base)
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    folder VARCHAR(100) NOT NULL, -- 'arsip_lpj', 'aset_desain', 'kurikulum', 'database_eksternal'
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES pengurus(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. MODUL KPI ANALYTICS & REWARD SYSTEM (Table kpi_evaluations)
CREATE TABLE IF NOT EXISTS kpi_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluator_id UUID REFERENCES pengurus(id) ON DELETE CASCADE,
    evaluatee_id UUID REFERENCES pengurus(id) ON DELETE CASCADE,
    period_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    score INT CHECK (score >= 1 AND score <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(evaluator_id, evaluatee_id, period_month)
);

-- 5. UPDATE VIEW PERFORMA UNTUK KPI
-- Drop view lama jika perlu penyesuaian (opsional, jika ingin menambahkan metric baru)
-- DROP VIEW IF EXISTS vw_performa_pengurus;
-- Saat ini vw_performa_pengurus sudah menghitung kehadiran. Nanti di logic aplikasi (atau view baru) bisa di-join dengan task completion.

-- Paksa Supabase me-reload schema cache
NOTIFY pgrst, 'reload schema';
