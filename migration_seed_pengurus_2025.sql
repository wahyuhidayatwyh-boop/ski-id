-- ============================================================
-- SEED DATA PENGURUS SKI - KABINET AL-ISTIQOMAH 2025/2026
-- Jalankan di Supabase Dashboard → SQL Editor
-- Data ini akan mengisi struktur organisasi lengkap
-- ============================================================

-- Pertama, pastikan kabinet sudah ada
INSERT INTO kabinets (name, period, logo_url, tagline, description, visi, misi, is_active)
VALUES (
    'Al-Istiqomah',
    '2025 / 2026',
    '/Logo%20SKI%20TEL-U%20P.png',
    'Istiqomah dalam Dakwah, Unggul dalam Prestasi',
    'Kabinet Al-Istiqomah dibentuk dengan komitmen kuat untuk menjaga konsistensi syiar dakwah.',
    'Menjadikan SKI sebagai wadah utama pembinaan karakter Islami mahasiswa.',
    '["Mengoptimalkan sistem kaderisasi yang berkelanjutan.", "Menggalakkan syiar dakwah yang kreatif.", "Mempererat ukhuwah islamiyah."]'::jsonb,
    true
) ON CONFLICT DO NOTHING;

-- Dapatkan ID kabinet yang baru dibuat atau yang sudah ada
DO $$
DECLARE
    kabinet_uuid UUID;
    syiar_div_id UUID;
    kaderisasi_div_id UUID;
    humas_div_id UUID;
    kewirausahaan_div_id UUID;
    medkom_div_id UUID;
    quran_center_id UUID;
    muslimah_center_id UUID;
    asistensi_id UUID;
BEGIN
    -- Get kabinet ID
    SELECT id INTO kabinet_uuid FROM kabinets WHERE name = 'Al-Istiqomah' AND period = '2025 / 2026' LIMIT 1;

    -- Pastikan divisi ada
    INSERT INTO divisions (name, description, icon) VALUES
    ('Syiar', 'Mengelola kajian, ceramah, dan kegiatan dakwah kampus', '🕌'),
    ('Kaderisasi', 'Mengelola program pendidikan dan kaderisasi anggota', '📚'),
    ('Humas', 'Menjalin hubungan dengan pihak eksternal dan internal', '🤝'),
    ('Kewirausahaan', 'Mengelola usaha dana usaha dan kewirausahaan', '💰'),
    ('Media Komunikasi', 'Mengelola media sosial, website, dan publikasi', '📱')
    ON CONFLICT DO NOTHING;

    -- Get division IDs
    SELECT id INTO syiar_div_id FROM divisions WHERE name = 'Syiar' LIMIT 1;
    SELECT id INTO kaderisasi_div_id FROM divisions WHERE name = 'Kaderisasi' LIMIT 1;
    SELECT id INTO humas_div_id FROM divisions WHERE name = 'Humas' LIMIT 1;
    SELECT id INTO kewirausahaan_div_id FROM divisions WHERE name = 'Kewirausahaan' LIMIT 1;
    SELECT id INTO medkom_div_id FROM divisions WHERE name = 'Media Komunikasi' LIMIT 1;

    -- ============================================================
    -- INTI PENGURUS (KETUA, WAKIL, SEKRETARIS, BENDAHARA)
    -- ============================================================

    -- Ketua Umum
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, kabinet_id, status)
    VALUES ('Wahyu Hidayat', '2311102178', 'S1 Teknik Informatika', 'Ketua Umum', 'ketuum', kabinet_uuid, 'active');

    -- Wakil Ketua Umum
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, kabinet_id, status)
    VALUES ('Zulfan Hanif Ihsani', '103112430221', 'S1 Teknik Informatika', 'Wakil Ketua Umum', 'wakil', kabinet_uuid, 'active');

    -- Sekretaris I
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, kabinet_id, status)
    VALUES ('Fatimah Dewi Wulansari', '104062430014', 'S1 Bisnis Digital', 'Sekretaris I', 'sekretaris1', kabinet_uuid, 'active');

    -- Sekretaris II
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, kabinet_id, status)
    VALUES ('Citra Kumala Dewi', '2311103052', 'S1 Sistem Informasi', 'Sekretaris II', 'sekretaris2', kabinet_uuid, 'active');

    -- Bendahara I
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, kabinet_id, status)
    VALUES ('Putri Rahma Wati', '103112400138', 'S1 Teknik Informatika', 'Bendahara I', 'bendahara1', kabinet_uuid, 'active');

    -- Bendahara II
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, kabinet_id, status)
    VALUES ('Destina Bekti Setyaningsih', '2311110018', 'S1 Sains Data', 'Bendahara II', 'bendahara2', kabinet_uuid, 'active');

    -- ============================================================
    -- DIVISI SYIAR
    -- ============================================================

    -- Koordinator Divisi Syiar
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('M Hamka Zainul Ardhi', '2311103156', 'S1 Sistem Informasi', 'Koordinator Divisi Syiar', 'div_ketua', syiar_div_id, kabinet_uuid, 'active');

    -- Anggota Divisi Syiar
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Dinda Natasya Artaviana', '2311109007', 'S1 Teknik Logistik', 'Anggota Divisi Syiar', 'staff', syiar_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Muhammad Andhika Zakaria', '102092400094', 'S1 Sistem Informasi', 'Anggota Divisi Syiar', 'staff', syiar_div_id, kabinet_uuid, 'active');

    -- ============================================================
    -- DIVISI KADERISASI
    -- ============================================================

    -- Koordinator Divisi Kaderisasi
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Faiqotul Izzah', '2311108035', 'S1 Teknik Biomedis', 'Koordinator Divisi Kaderisasi', 'div_ketua', kaderisasi_div_id, kabinet_uuid, 'active');

    -- Anggota Divisi Kaderisasi
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Yulia Rahman Pasaribu', '2311109018', 'S1 Teknik Logistik', 'Anggota Divisi Kaderisasi', 'staff', kaderisasi_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Eka Permata Sari', '102102430007', 'S1 Teknik Logistik', 'Anggota Divisi Kaderisasi', 'staff', kaderisasi_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Muhammad Zidane Radin Daffa', '102092430004', 'S1 Sistem Informasi', 'Anggota Divisi Kaderisasi', 'staff', kaderisasi_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Arif Fadlil Hasibuan', '103112400220', 'S1 Teknik Informatika', 'Anggota Divisi Kaderisasi', 'staff', kaderisasi_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Hijriah enjelika br Sembiring', '101112430049', 'S1 Teknik Telekomunikasi', 'Anggota Divisi Kaderisasi', 'staff', kaderisasi_div_id, kabinet_uuid, 'active');

    -- ============================================================
    -- DIVISI HUMAS
    -- ============================================================

    -- Koordinator Divisi Humas
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Qumillaila Nur Izzati', '102092430121', 'S1 Sistem Informasi', 'Koordinator Divisi Humas', 'div_ketua', humas_div_id, kabinet_uuid, 'active');

    -- Anggota Divisi Humas
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Shania Finka Dewi', '2311103063', 'S1 Sistem Informasi', 'Anggota Divisi Humas', 'staff', humas_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Riefka Febina Parastika', '2311111012', 'S1 Bisnis Digital', 'Anggota Divisi Humas', 'staff', humas_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Dini Shafira Kristi Kuway', '102092430099', 'S1 Sistem Informasi', 'Anggota Divisi Humas', 'staff', humas_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Zaki Farhan Rifai', '102092430002', 'S1 Sistem Informasi', 'Anggota Divisi Humas', 'staff', humas_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Rizky Wassyifa', '2311106007', 'S1 Teknik Industri', 'Anggota Divisi Humas', 'staff', humas_div_id, kabinet_uuid, 'active');

    -- ============================================================
    -- DIVISI KEWIRAUSAHAAN
    -- ============================================================

    -- Koordinator Divisi Kewirausahaan
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Argia Rajessa Rizarr', '2311111074', 'S1 Bisnis Digital', 'Koordinator Divisi Kewirausahaan', 'div_ketua', kewirausahaan_div_id, kabinet_uuid, 'active');

    -- Anggota Divisi Kewirausahaan
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Ibtida Zada Utomo', '103112430037', 'S1 Teknik Informatika', 'Anggota Divisi Kewirausahaan', 'staff', kewirausahaan_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Jundi Amru Abbas Difaullah', '103112400143', 'S1 Teknik Informatika', 'Anggota Divisi Kewirausahaan', 'staff', kewirausahaan_div_id, kabinet_uuid, 'active');

    -- ============================================================
    -- DIVISI MEDIA KOMUNIKASI
    -- ============================================================

    -- Koordinator Divisi Media Komunikasi
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Merliana Cahya Amalia', '2311106081', 'S1 Teknik Industri', 'Koordinator Divisi Media Komunikasi', 'div_ketua', medkom_div_id, kabinet_uuid, 'active');

    -- Anggota Divisi Media Komunikasi
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Fauzan Aliim', '104062400120', 'S1 Bisnis Digital', 'Anggota Divisi Media Komunikasi', 'staff', medkom_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Fauzaan Rofi Radytya', '106082430003', 'S1 Desain Komunikasi Visual', 'Anggota Divisi Media Komunikasi', 'staff', medkom_div_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Muhammad Mahrus Ali', '2311104006', 'S1 Rekayasa Perangkat Lunak', 'Anggota Divisi Media Komunikasi', 'staff', medkom_div_id, kabinet_uuid, 'active');

    -- ============================================================
    -- LSO QUR'AN CENTER
    -- ============================================================

    -- Get/Create LSO division
    INSERT INTO divisions (name, description, icon) VALUES
    ('LSO Qur''an Center', 'Lembaga Semi Otonom fokus pada kajian dan pembelajaran Al-Qur''an', '📖')
    ON CONFLICT DO NOTHING;

    SELECT id INTO quran_center_id FROM divisions WHERE name = 'LSO Qur''an Center' LIMIT 1;

    -- Koordinator LSO Qur'an Center
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Raihan Dzaky Muflih', '103112430029', 'S1 Teknik Informatika', 'Koordinator LSO Qur''an Center', 'lso_ketua', quran_center_id, kabinet_uuid, 'active');

    -- Anggota LSO Qur'an Center
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Danishara Nurunnisa', '2311111086', 'S1 Bisnis Digital', 'Anggota LSO Qur''an Center', 'staff', quran_center_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Fatma Aulia Chaniago', '103112400205', 'S1 Teknik Informatika', 'Anggota LSO Qur''an Center', 'staff', quran_center_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Ghulam Manar Ishakan', '2311101031', 'S1 Teknik Telekomunikasi', 'Anggota LSO Qur''an Center', 'staff', quran_center_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Nasywa Na''ilah Husna', '101132400015', 'S1 Teknik Biomedis', 'Anggota LSO Qur''an Center', 'staff', quran_center_id, kabinet_uuid, 'active');

    -- ============================================================
    -- LSO MUSLIMAH CENTER
    -- ============================================================

    INSERT INTO divisions (name, description, icon) VALUES
    ('LSO Muslimah Center', 'Lembaga Semi Otonom fokus pada pemberdayaan muslimah', '🧕')
    ON CONFLICT DO NOTHING;

    SELECT id INTO muslimah_center_id FROM divisions WHERE name = 'LSO Muslimah Center' LIMIT 1;

    -- Koordinator LSO Muslimah Center
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Resita istania purwanto', '2311104037', 'S1 Rekayasa Perangkat Lunak', 'Koordinator LSO Muslimah Center', 'lso_ketua', muslimah_center_id, kabinet_uuid, 'active');

    -- Anggota LSO Muslimah Center
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Aulia Isnaeni Azkatunnisa', '2311101087', 'S1 Teknik Telekomunikasi', 'Anggota LSO Muslimah Center', 'staff', muslimah_center_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Yumna Nuria Kasih Ilahi', '102102430023', 'S1 Teknik Logistik', 'Anggota LSO Muslimah Center', 'staff', muslimah_center_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Qonita syafa qotrunnada', '106082400066', 'S1 Desain Komunikasi Visual', 'Anggota LSO Muslimah Center', 'staff', muslimah_center_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Galuh Prameswari', '106082400074', 'S1 Desain Komunikasi Visual', 'Anggota LSO Muslimah Center', 'staff', muslimah_center_id, kabinet_uuid, 'active');

    -- ============================================================
    -- LSO ASISTENSI AGAMA ISLAM
    -- ============================================================

    INSERT INTO divisions (name, description, icon) VALUES
    ('LSO Asistensi Agama Islam', 'Lembaga Semi Otonom fokus pada bantuan pembelajaran agama Islam', '🕌')
    ON CONFLICT DO NOTHING;

    SELECT id INTO asistensi_id FROM divisions WHERE name = 'LSO Asistensi Agama Islam' LIMIT 1;

    -- Koordinator LSO Asistensi Agama Islam
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Afif Rijal Azzami', '2311102235', 'S1 Teknik Informatika', 'Koordinator LSO Asistensi Agama Islam', 'lso_ketua', asistensi_id, kabinet_uuid, 'active');

    -- Anggota LSO Asistensi Agama Islam
    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Muhammad Faizul Humam', '2311102310', 'S1 Teknik Informatika', 'Anggota LSO Asistensi Agama Islam', 'staff', asistensi_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Muhammad Azzam Satria', '103112400112', 'S1 Teknik Informatika', 'Anggota LSO Asistensi Agama Islam', 'staff', asistensi_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Dinda Silviani', '2311111045', 'S1 Bisnis Digital', 'Anggota LSO Asistensi Agama Islam', 'staff', asistensi_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Putri Suria Lestari', '2311103077', 'S1 Sistem Informasi', 'Anggota LSO Asistensi Agama Islam', 'staff', asistensi_id, kabinet_uuid, 'active');

    INSERT INTO pengurus (full_name, nim, prodi, jabatan, role_level, division_id, kabinet_id, status)
    VALUES ('Irhas Agung Nur Muhammad Al-Hafidz', '2311111069', 'S1 Bisnis Digital', 'Anggota LSO Asistensi Agama Islam', 'staff', asistensi_id, kabinet_uuid, 'active');

END $$;