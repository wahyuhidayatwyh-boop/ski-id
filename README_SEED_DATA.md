# Panduan Menambahkan Data Pengurus SKI

File `migration_seed_pengurus_2025.sql` berisi data lengkap struktur organisasi SKI Kabinet Al-Istiqomah 2025/2026.

## Cara Menjalankan Migration

### Langkah 1: Buka Supabase Dashboard
1. Login ke [Supabase](https://supabase.com)
2. Pilih project SKI Website Anda
3. Buka **SQL Editor** di sidebar kiri

### Langkah 2: Jalankan Script Migration
1. Copy seluruh isi file `migration_seed_pengurus_2025.sql`
2. Paste ke SQL Editor di Supabase
3. Klik **Run** atau tekan `Ctrl+Enter`

### Langkah 3: Verifikasi Data
Setelah menjalankan script, Anda bisa memverifikasi data dengan query berikut:

```sql
-- Cek jumlah pengurus per kabinet
SELECT k.name, k.period, COUNT(p.id) as jumlah_pengurus
FROM kabinets k
LEFT JOIN pengurus p ON p.kabinet_id = k.id
WHERE k.name = 'Al-Istiqomah'
GROUP BY k.id, k.name, k.period;

-- Lihat struktur lengkap
SELECT p.full_name, p.nim, p.prodi, p.jabatan, p.role_level, d.name as divisi
FROM pengurus p
LEFT JOIN divisions d ON p.division_id = d.id
JOIN kabinets k ON p.kabinet_id = k.id
WHERE k.name = 'Al-Istiqomah' AND p.status = 'active'
ORDER BY 
  CASE p.role_level
    WHEN 'ketuum' THEN 1
    WHEN 'wakil' THEN 2
    WHEN 'sekretaris1' THEN 3
    WHEN 'sekretaris2' THEN 4
    WHEN 'bendahara1' THEN 5
    WHEN 'bendahara2' THEN 6
    WHEN 'div_ketua' THEN 7
    WHEN 'lso_ketua' THEN 8
    WHEN 'staff' THEN 9
  END,
  p.full_name;
```

## Struktur Data yang Ditambahkan

### Inti Pengurus (6 orang)
- Ketua Umum: Wahyu Hidayat
- Wakil Ketua Umum: Zulfan Hanif Ihsani
- Sekretaris I: Fatimah Dewi Wulansari
- Sekretaris II: Citra Kumala Dewi
- Bendahara I: Putri Rahma Wati
- Bendahara II: Destina Bekti Setyaningsih

### Divisi (5 divisi)
1. **Divisi Syiar** (3 orang)
   - Koordinator: M Hamka Zainul Ardhi
   - 2 Anggota

2. **Divisi Kaderisasi** (6 orang)
   - Koordinator: Faiqotul Izzah
   - 5 Anggota

3. **Divisi Humas** (6 orang)
   - Koordinator: Qumillaila Nur Izzati
   - 5 Anggota

4. **Divisi Kewirausahaan** (3 orang)
   - Koordinator: Argia Rajessa Rizarr
   - 2 Anggota

5. **Divisi Media Komunikasi** (4 orang)
   - Koordinator: Merliana Cahya Amalia
   - 3 Anggota

### LSO (3 lembaga)
1. **LSO Qur'an Center** (5 orang)
   - Koordinator: Raihan Dzaky Muflih
   - 4 Anggota

2. **LSO Muslimah Center** (5 orang)
   - Koordinator: Resita istania purwanto
   - 4 Anggota

3. **LSO Asistensi Agama Islam** (6 orang)
   - Koordinator: Afif Rijal Azzami
   - 5 Anggota

**Total: 49 pengurus**

## Jika Ada Masalah

### Data Sudah Ada (Duplicate)
Jika Anda sudah pernah menjalankan script ini dan ingin mengulang, hapus data lama terlebih dahulu:

```sql
-- Hapus semua pengurus dari kabinet Al-Istiqomah
DELETE FROM pengurus 
WHERE kabinet_id IN (
    SELECT id FROM kabinets WHERE name = 'Al-Istiqomah' AND period = '2025 / 2026'
);

-- Hapus divisi yang dibuat script ini (opsional)
DELETE FROM divisions 
WHERE name IN (
    'Syiar', 'Kaderisasi', 'Humas', 'Kewirausahaan', 'Media Komunikasi',
    'LSO Qur''an Center', 'LSO Muslimah Center', 'LSO Asistensi Agama Islam'
);
```

### Data Tidak Muncul di Website
1. Pastikan Anda sudah menjalankan migration `migration_organizational_structure.sql` terlebih dahulu
2. Refresh halaman profil di website
3. Clear browser cache jika perlu
4. Periksa console browser untuk error

### Ingin Menambahkan Foto
Untuk menambahkan foto pengurus, Anda bisa:
1. Upload foto ke storage Supabase atau gunakan URL eksternal
2. Update data pengurus dengan query:
```sql
UPDATE pengurus 
SET photo_url = 'https://example.com/foto.jpg' 
WHERE full_name = 'Nama Pengurus';
```

## Menyesuaikan Data

Jika ingin mengubah data, Anda bisa:
1. Edit file `migration_seed_pengurus_2025.sql` sebelum dijalankan
2. Atau update langsung via SQL Editor setelah data masuk
3. Atau gunakan Admin CMS di halaman `/admin/admin1/profil`

## Struktur Role Level

Berikut adalah nilai `role_level` yang digunakan:
- `ketuum`: Ketua Umum (ditampilkan paling atas dengan style khusus)
- `wakil`: Wakil Ketua Umum
- `sekretaris1`: Sekretaris I
- `sekretaris2`: Sekretaris II
- `bendahara1`: Bendahara I
- `bendahara2`: Bendahara II
- `div_ketua`: Koordinator Divisi
- `lso_ketua`: Koordinator LSO
- `staff`: Anggota biasa

## Tambahan

File migration ini sudah termasuk:
- ✅ Pembuatan kabinet (jika belum ada)
- ✅ Pembuatan divisi (5 divisi + 3 LSO)
- ✅ Insert 49 pengurus dengan data lengkap
- ✅ Penanganan duplicate (ON CONFLICT)
- ✅ Relasi yang benar antara kabinet, divisi, dan pengurus

Setelah menjalankan migration, halaman profil akan otomatis menampilkan struktur organisasi lengkap dengan semua anggota.