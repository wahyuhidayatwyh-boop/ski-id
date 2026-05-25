-- ============================================================
-- DAKWAH-OS MIGRATION V3 (UPDATE FOR POH / BPH DIVISION)
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Buat Divisi khusus untuk POH
INSERT INTO divisions (name, description, icon, hero_image_url, vision, mission) 
VALUES (
    'Pengurus Inti Harian (POH)', 
    'Badan Pengurus Harian yang memimpin, mengatur arah gerak, dan mengoordinasikan seluruh elemen organisasi.', 
    '⭐',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80',
    'Menjadi pionir kepemimpinan yang amanah, profesional, dan berlandaskan ukhuwah Islamiyah.',
    '1. Menjaga harmonisasi internal antar divisi.\n2. Mengontrol dan mengevaluasi kinerja organisasi.\n3. Mewakili organisasi dalam birokrasi eksternal.'
) ON CONFLICT DO NOTHING;

DO $$
DECLARE
    poh_div_id UUID;
BEGIN
    SELECT id INTO poh_div_id FROM divisions WHERE name = 'Pengurus Inti Harian (POH)' LIMIT 1;

    IF poh_div_id IS NOT NULL THEN
        -- 2. Masukkan anggota POH ke dalam divisi ini
        UPDATE pengurus 
        SET division_id = poh_div_id 
        WHERE role_level IN ('ketuum', 'wakil', 'sekretaris1', 'sekretaris2', 'bendahara1', 'bendahara2');
    END IF;
END $$;
