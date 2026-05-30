# Panduan Instalasi Modul Pembayaran Kas Pengurus

## Masalah yang Diperbaiki

File `migration_pembayaran_kas.sql` yang lama tidak bisa dijalankan karena:
1. Mengandalkan tabel `kabinets` yang belum tentu ada
2. Mengandalkan tabel `pengurus` dengan struktur yang sudah diupdate
3. Tidak ada handling untuk `CREATE TABLE IF NOT EXISTS` yang proper

## Solusi

Gunakan file **`migration_pembayaran_kas_complete.sql`** yang sudah menggabungkan semua dependency.

## Cara Instalasi

### Langkah 1: Buka Supabase Dashboard
1. Pergi ke https://app.supabase.com
2. Pilih project SKI Anda
3. Buka **SQL Editor**

### Langkah 2: Jalankan Migration
1. Copy seluruh isi file `migration_pembayaran_kas_complete.sql`
2. Paste ke SQL Editor
3. Klik **Run**

### Langkah 3: Verifikasi
Setelah berhasil dijalankan, pastikan tabel-tabel berikut muncul di **Table Editor**:
- `divisions` (jika belum ada)
- `pengurus` (jika belum ada)
- `kabinets` (jika belum ada)
- `pembayaran_kas` (tabel utama modul ini)

### Langkah 4: Cek Views
Dua views juga akan dibuat:
- `vw_status_kas_pengurus` - Untuk melihat status kas per pengurus
- `vw_rekap_kas_bulanan` - Untuk rekap total kas per bulan

## Struktur Tabel pembayaran_kas

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| pengurus_id | UUID | Foreign key ke pengurus |
| kabinet_id | UUID | Foreign key ke kabinets |
| division_id | UUID | Foreign key ke divisions |
| amount | DECIMAL(12,2) | Jumlah pembayaran |
| bulan | INTEGER | Bulan (1-12) |
| tahun | INTEGER | Tahun (min 2020) |
| bukti_url | TEXT | URL bukti pembayaran |
| status | VARCHAR(20) | PENDING / VERIFIED / REJECTED |
| catatan | TEXT | Catatan dari bendahara |
| created_at | TIMESTAMP | Waktu pembuatan |
| verified_at | TIMESTAMP | Waktu verifikasi |
| verified_by | UUID | Pengurus yang memverifikasi |

## Row Level Security (RLS)

### Pengurus Biasa
- Bisa **INSERT** pembayaran kas mereka sendiri
- Bisa **SELECT** pembayaran kas mereka sendiri

### POH / Bendahara
- Bisa **SELECT** semua pembayaran kas
- Bisa **UPDATE** untuk verifikasi (ubah status)

Role POH/Bendahara ditentukan oleh `role_level` di tabel `pengurus`:
- `ketuum` - Ketua Umum
- `wakil` - Wakil Ketua
- `sekretaris1` - Sekretaris 1
- `sekretaris2` - Sekretaris 2
- `bendahara1` - Bendahara 1
- `bendahara2` - Bendahara 2
- `dpo` - Dewan Pengurus Organisasi

## Contoh Query

### Insert Pembayaran Kas Baru
```sql
INSERT INTO pembayaran_kas (
    pengurus_id, 
    kabinet_id, 
    division_id, 
    amount, 
    bulan, 
    tahun, 
    bukti_url
) VALUES (
    'uuid-pengurus',
    'uuid-kabinet',
    'uuid-division',
    50000,
    5,
    2025,
    'https://storage.example.com/bukti-123.jpg'
);
```

### Verifikasi Pembayaran (oleh Bendahara)
```sql
UPDATE pembayaran_kas 
SET 
    status = 'VERIFIED',
    verified_at = NOW(),
    verified_by = 'uuid-bendahara'
WHERE id = 'uuid-pembayaran';
```

### Melihat Status Kas Pengurus
```sql
SELECT * FROM vw_status_kas_pengurus 
WHERE pengurus_id = 'uuid-pengurus';
```

### Rekap Kas Bulanan
```sql
SELECT * FROM vw_rekap_kas_bulanan 
WHERE tahun = 2025 AND bulan = 5;
```

## Troubleshooting

### Error: "relation 'kabinets' does not exist"
Artinya tabel kabinets belum dibuat. Pastikan menggunakan file `migration_pembayaran_kas_complete.sql`, bukan `migration_pembayaran_kas.sql`.

### Error: "column 'user_id' does not exist in table 'pengurus'"
Tabel pengurus yang lama tidak memiliki kolom `user_id`. File migration lengkap sudah menangani ini dengan membuat tabel pengurus baru yang memiliki kolom `user_id`.

### Error: "permission denied for table"
Pastikan Anda login sebagai user yang terautentikasi di Supabase, atau jalankan query di SQL Editor sebagai admin.

## Catatan Penting

1. **Backup Data**: Jika Anda sudah memiliki data di tabel `pengurus` atau `divisions`, backup terlebih dahulu sebelum menjalankan migration ini.

2. **Data Duplikat**: Migration ini menggunakan `CREATE TABLE IF NOT EXISTS` dan `ON CONFLICT DO NOTHING`, jadi aman dijalankan berkali-kali.

3. **Seed Data**: Migration ini akan menambahkan 2 kabinet default (Al-Istiqomah dan Al-Fatih) jika belum ada.

4. **Storage**: Untuk menyimpan bukti pembayaran, pastikan bucket storage sudah dikonfigurasi di Supabase Storage.