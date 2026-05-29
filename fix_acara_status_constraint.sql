-- FIX: Sinkronkan nilai status acara_internal
-- Database pakai: upcoming, live, finished
-- Kode portal pakai: upcoming, live, completed
-- Solusi: izinkan kedua nilai 'finished' dan 'completed'

-- Hapus constraint lama jika ada
ALTER TABLE acara_internal DROP CONSTRAINT IF EXISTS acara_internal_status_check;

-- Tambah constraint baru yang menerima semua nilai yang dipakai
ALTER TABLE acara_internal ADD CONSTRAINT acara_internal_status_check
    CHECK (status IN ('upcoming', 'live', 'completed', 'finished'));

-- Sinkronkan data lama yang pakai 'finished' -> 'completed' agar konsisten
UPDATE acara_internal SET status = 'completed' WHERE status = 'finished';

NOTIFY pgrst, 'reload schema';
