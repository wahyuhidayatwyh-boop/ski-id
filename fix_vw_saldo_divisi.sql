-- =============================================
-- FIX: vw_saldo_divisi
-- Masalah: CROSS JOIN menyebabkan setiap divisi
-- muncul di SEMUA kabinet, bukan hanya kabinet
-- tempat divisi tersebut terdaftar.
--
-- Solusi: Ganti CROSS JOIN dengan JOIN berdasarkan
-- kabinet_id yang tersimpan di tabel divisions.
-- =============================================

CREATE OR REPLACE VIEW vw_saldo_divisi AS
SELECT 
    d.id AS division_id,
    d.name AS division_name,
    d.kabinet_id AS kabinet_id,
    k.name AS kabinet_name,
    COALESCE(SUM(CASE WHEN t.type = 'IN' THEN t.amount ELSE 0 END), 0) AS total_pemasukan,
    COALESCE(SUM(CASE WHEN t.type = 'OUT' THEN t.amount ELSE 0 END), 0) AS total_pengeluaran,
    COALESCE(SUM(CASE WHEN t.type = 'IN' THEN t.amount ELSE -t.amount END), 0) AS saldo_akhir
FROM 
    divisions d
INNER JOIN 
    kabinets k ON k.id = d.kabinet_id
LEFT JOIN 
    keuangan_transaksi t ON t.division_id = d.id AND t.kabinet_id = d.kabinet_id
GROUP BY 
    d.id, d.name, d.kabinet_id, k.name;

NOTIFY pgrst, 'reload schema';
