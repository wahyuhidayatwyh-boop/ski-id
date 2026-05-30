-- Migration: Tabel Donasi / Infaq
-- Untuk mencatat donasi yang masuk melalui form di halaman /donasi

-- Tabel untuk menyimpan donasi/infaq
CREATE TABLE IF NOT EXISTS public.donasi_transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Informasi donatur (opsional, bisa anonymous)
    nama_donatur TEXT,
    email_donatur TEXT,
    no_hp_donatur TEXT,
    
    -- Informasi donasi
    jenis_donasi TEXT NOT NULL DEFAULT 'Infaq', -- Infaq, Sedekah, Zakat, dll
    nominal DECIMAL(15,2) NOT NULL DEFAULT 0,
    pesan TEXT, -- Pesan/doa dari donatur
    
    -- Metode pembayaran
    metode_pembayaran TEXT NOT NULL, -- transfer_bank, ewallet
    bukti_transfer_url TEXT, -- URL foto bukti transfer di storage
    
    -- Status verifikasi
    status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
    catatan_admin TEXT,
    
    -- Referensi
    kabinet_id UUID REFERENCES public.kabinets(id) ON DELETE SET NULL,
    verified_by UUID, -- User ID yang memverifikasi
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    is_anonymous BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'web_form' -- web_form, whatsapp, direct, dll
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_donasi_transaksi_created_at ON public.donasi_transaksi(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donasi_transaksi_status ON public.donasi_transaksi(status);
CREATE INDEX IF NOT EXISTS idx_donasi_transaksi_kabinet_id ON public.donasi_transaksi(kabinet_id);

-- Updated at trigger (check if function exists first)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = timezone('utc'::text, now());
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END $$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS update_donasi_transaksi_updated_at ON public.donasi_transaksi;
CREATE TRIGGER update_donasi_transaksi_updated_at
    BEFORE UPDATE ON public.donasi_transaksi
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.donasi_transaksi ENABLE ROW LEVEL SECURITY;

-- Policy: Siapa saja bisa insert (donatur)
CREATE POLICY "Siapapun bisa insert donasi" ON public.donasi_transaksi
    FOR INSERT
    WITH CHECK (true);

-- Policy: Admin bisa lihat semua (menggunakan pengurus table - semua pengurus dianggap admin)
CREATE POLICY "Admin bisa akses semua donasi" ON public.donasi_transaksi
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.pengurus p
            WHERE p.user_id::text = auth.uid()::text
        )
    );

-- View untuk admin melihat semua donasi
CREATE OR REPLACE VIEW public.vw_donasi_admin AS
SELECT 
    dt.*,
    k.name as kabinet_name
FROM public.donasi_transaksi dt
LEFT JOIN public.kabinets k ON dt.kabinet_id = k.id
ORDER BY dt.created_at DESC;

-- Add column to keuangan_transaksi for linking to donasi_transaksi
ALTER TABLE public.keuangan_transaksi ADD COLUMN IF NOT EXISTS donasi_transaksi_id UUID REFERENCES public.donasi_transaksi(id) ON DELETE SET NULL;

-- Create function to insert keuangan_transaksi (for use by API with service role)
CREATE OR REPLACE FUNCTION public.create_keuangan_transaksi(
    p_kabinet_id UUID,
    p_division_id UUID,
    p_type TEXT,
    p_kategori TEXT,
    p_amount DECIMAL,
    p_description TEXT,
    p_tanggal TEXT,
    p_bukti_url TEXT DEFAULT NULL,
    p_donasi_transaksi_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.keuangan_transaksi (
        kabinet_id,
        division_id,
        type,
        kategori,
        amount,
        description,
        tanggal,
        created_by,
        bukti_url,
        donasi_transaksi_id
    ) VALUES (
        p_kabinet_id,
        p_division_id,
        p_type::keuangan_transaksi_type,
        p_kategori,
        p_amount,
        p_description,
        p_tanggal,
        NULL,
        p_bukti_url,
        p_donasi_transaksi_id
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.create_keuangan_transaksi TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_keuangan_transaksi TO anon;

-- Grant akses
GRANT SELECT ON public.vw_donasi_admin TO authenticated;
