-- View untuk menghitung performa (kehadiran) pengurus berdasarkan absensi di acara_internal
DROP VIEW IF EXISTS vw_performa_pengurus;
CREATE OR REPLACE VIEW vw_performa_pengurus AS
SELECT 
    p.id AS pengurus_id,
    p.full_name,
    p.jabatan,
    p.kabinet_id,
    d.name AS divisi_name,
    COALESCE(ac.total_acara, 0)::int AS total_acara,
    COALESCE(ad.total_hadir, 0)::int AS total_hadir,
    CASE 
        WHEN COALESCE(ac.total_acara, 0) = 0 THEN 0 
        ELSE ROUND((COALESCE(ad.total_hadir, 0)::NUMERIC / COALESCE(ac.total_acara, 0)::NUMERIC) * 100, 2)::float
    END AS persentase_kehadiran,
    CASE 
        WHEN COALESCE(ac.total_acara, 0) = 0 THEN 'Belum Ada Acara'
        WHEN (COALESCE(ad.total_hadir, 0)::NUMERIC / COALESCE(ac.total_acara, 0)::NUMERIC) >= 0.75 THEN 'Sangat Baik'
        WHEN (COALESCE(ad.total_hadir, 0)::NUMERIC / COALESCE(ac.total_acara, 0)::NUMERIC) >= 0.50 THEN 'Baik'
        WHEN (COALESCE(ad.total_hadir, 0)::NUMERIC / COALESCE(ac.total_acara, 0)::NUMERIC) >= 0.25 THEN 'Cukup'
        ELSE 'Perlu Evaluasi'
    END AS status_evaluasi
FROM 
    pengurus p
LEFT JOIN 
    divisions d ON p.division_id = d.id
LEFT JOIN 
    (
        SELECT kabinet_id, COUNT(id) AS total_acara 
        FROM acara_internal 
        GROUP BY kabinet_id
    ) ac ON p.kabinet_id = ac.kabinet_id
LEFT JOIN 
    (
        SELECT pengurus_id, COUNT(id) AS total_hadir 
        FROM absensi_digital 
        WHERE status = 'hadir' 
        GROUP BY pengurus_id
    ) ad ON p.id = ad.pengurus_id;

-- Grant access untuk anon dan authenticated
GRANT SELECT ON vw_performa_pengurus TO anon, authenticated;
