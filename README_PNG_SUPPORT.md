# Fix: Support Upload PNG untuk Dokumentasi

## Masalah
Sistem upload dokumentasi sebelumnya hanya menerima file JPEG, sehingga file PNG tidak bisa diupload.

## Solusi yang Diterapkan

### 1. Update Validasi Frontend
File yang diubah:
- `src/lib/upload.ts`
- `src/app/admin/admin1/dokumentasi/new/page.tsx`
- `src/app/admin/admin1/dokumentasi/[id]/edit/page.tsx`

Perubahan:
- Validasi file type sekarang eksplisit menerima: `image/jpeg`, `image/png`, `image/webp`
- File input `accept` attribute diupdate ke: `accept="image/jpeg,image/png,image/webp"`
- Pesan error lebih informatif: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP."

### 2. Konfigurasi Supabase Storage Bucket

**PENTING**: Pastikan bucket `galleries-images` di Supabase sudah dikonfigurasi untuk menerima PNG.

#### Cara Cek & Update Konfigurasi Bucket:

1. **Login ke Supabase Dashboard**
   - Buka https://supabase.com
   - Pilih project SKI Website Anda

2. **Cek Storage Bucket**
   - Klik **Storage** di sidebar kiri
   - Cari bucket bernama `galleries-images`
   - Klik bucket tersebut

3. **Update Allowed MIME Types**
   - Klik tab **Settings**
   - Di bagian **Allowed MIME types**, pastikan ada:
     - `image/jpeg`
     - `image/png` ✅ (tambahkan jika belum ada)
     - `image/webp`
   - Klik **Save**

#### Alternatif: Via SQL Editor

Jalankan query ini di SQL Editor untuk update bucket:

```sql
-- Update bucket configuration untuk menerima PNG dan ukuran 10MB
UPDATE storage.buckets 
SET 
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'],
    file_size_limit = 10485760  -- 10MB
WHERE id = 'galleries-images';
```

Atau jalankan file `migration_storage_buckets.sql` yang sudah tersedia di project.

**Catatan:** Jika bucket sudah dibuat sebelumnya, Anda perlu update manual size limit-nya ke 10MB.

## Testing

Setelah update, test dengan:
1. Buka halaman admin: `/admin/admin1/dokumentasi/new`
2. Coba upload file PNG
3. Pastikan upload berhasil dan preview muncul

## Format File yang Didukung

✅ **Diterima:**
- JPG/JPEG (`image/jpeg`)
- PNG (`image/png`)
- WebP (`image/webp`)

❌ **Ditolak:**
- GIF
- BMP
- TIFF
- Format lainnya

## Ukuran File Maksimal

- **10 MB** per file
- Jika lebih, akan muncul pesan error

## Troubleshooting

### Error: "Format file tidak didukung"
- Pastikan file benar-benar berformat JPG, PNG, atau WebP
- Cek MIME type file di properties file

### Error: "Permission denied" dari Supabase
- Pastikan bucket `galleries-images` sudah ada
- Pastikan bucket sudah public
- Cek RLS policies di bucket

### Upload berhasil tapi gambar tidak muncul
- Clear browser cache
- Cek apakah URL gambar valid
- Pastikan bucket public

## Catatan Penting

1. **Backend sudah support PNG** - Konfigurasi bucket di `migration_storage_buckets.sql` sudah benar
2. **Frontend sudah diupdate** - Validasi sekarang eksplisit menerima PNG
3. **Database tidak ada batasan** - Kolom `image_url` di tabel `galleries` adalah TEXT, bisa menyimpan URL apapun

Jika masih ada masalah setelah mengikuti panduan ini, kemungkinan ada konfigurasi di Supabase yang perlu disesuaikan.