# PANDUAN SETUP DATABASE SUPABASE

## Langkah-langkah:

### 1. Buka Supabase Dashboard
Pergi ke: https://app.supabase.com → Pilih project SKI → SQL Editor

### 2. Jalankan file `migration.sql`
Salin dan tempel seluruh isi file `migration.sql` ke SQL Editor, lalu klik **Run**.

File ini akan membuat tabel:
- ✅ `events` — Acara & Kegiatan
- ✅ `galleries` — Dokumentasi / Galeri Foto
- ✅ `products` — Katalog Merchandise
- ✅ `pengurus` — Data Pengurus/Anggota (tanpa dependency auth)

Dan mengaktifkan RLS policies agar:
- Publik (tanpa login) bisa **baca** semua data
- Admin (logged in) bisa **CRUD** semua data

### 3. Verifikasi Tabel Dibuat
Pergi ke: Supabase → Table Editor — pastikan 4 tabel baru muncul.

### 4. Tambah Data Percobaan
Bisa langsung lewat admin CMS di:
- `/admin/admin1/acara` → Tambah Acara
- `/admin/admin1/dokumentasi` → Tambah Dokumentasi
- `/admin/admin2/katalog` → Tambah Produk
- `/admin/admin1/profil` → Tab Pengurus → Tambah Pengurus

---

## Jika ada error "relation does not exist"
Pastikan semua tabel di `cms_schema.sql` sudah dijalankan terlebih dahulu,
karena `pengurus` bergantung pada tabel `divisions`.

Urutan eksekusi yang benar:
1. `cms_schema.sql` (sudah dijalankan sebelumnya — ada tabel divisions, roles, users)
2. `migration.sql` (jalankan sekarang)
