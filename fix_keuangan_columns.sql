-- Fix: Add missing columns to keuangan_transaksi table
-- Jalankan di Supabase SQL Editor

-- Add bukti_url column for storing proof of transaction images
ALTER TABLE keuangan_transaksi 
ADD COLUMN IF NOT EXISTS bukti_url TEXT;

-- Add donasi_transaksi_id column for linking to donasi_transaksi table
ALTER TABLE keuangan_transaksi 
ADD COLUMN IF NOT EXISTS donasi_transaksi_id UUID REFERENCES donasi_transaksi(id) ON DELETE SET NULL;

-- Create function to update keuangan_transaksi with donasi_transaksi_id
CREATE OR REPLACE FUNCTION update_keuangan_donasi_link()
RETURNS TRIGGER AS $$
BEGIN
    -- Update keuangan_transaksi with the donasi_transaksi_id
    UPDATE keuangan_transaksi 
    SET donasi_transaksi_id = NEW.id
    WHERE bukti_url = NEW.bukti_transfer_url 
      AND created_at >= NEW.created_at - INTERVAL '1 minute'
      AND created_at <= NEW.created_at + INTERVAL '1 minute';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';