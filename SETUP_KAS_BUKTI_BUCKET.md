# Setup Bucket "kas-bukti" untuk Pembayaran Kas

## Masalah
Fitur pembayaran kas tidak berfungsi karena upload bukti pembayaran gagal. Ini terjadi karena bucket `kas-bukti` di Supabase Storage belum dibuat atau belum dikonfigurasi dengan benar.

## Solusi

### Opsi 1: Buat Bucket Secara Manual (Rekomendasi)

1. **Buka Supabase Dashboard**
   - Pergi ke https://app.supabase.com
   - Pilih project SKI Anda

2. **Buka Storage**
   - Klik menu **Storage** di sidebar kiri
   - Klik **"New bucket"**

3. **Buat Bucket Baru**
   - **Name**: `kas-bukti`
   - **Public**: ✅ (centang)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - `application/pdf`
   - Klik **"Save"**

4. **Setup RLS Policies**
   - Setelah bucket dibuat, klik bucket `kas-bukti`
   - Pergi ke tab **"Policies"**
   - Klik **"New policy"**
   - Pilih **"INSERT"** policy
   - Pilih **"For full customization"**
   - Isi policy name: `Allow authenticated users to upload`
   - Policy definition:
     ```sql
     auth.role() = 'authenticated'
     ```
   - Klik **"Review"** lalu **"Save policy"**

5. **Tambah Policy untuk SELECT (Read)**
   - Klik **"New policy"** lagi
   - Pilih **"SELECT"** 
   - Pilih **"For full customization"**
   - Policy name: `Allow public to read`
   - Policy definition:
     ```sql
     true
     ```
   - Klik **"Review"** lalu **"Save policy"**

### Opsi 2: Gunakan Migration SQL

Jalankan SQL berikut di **SQL Editor**:

```sql
-- Buat bucket kas-bukti
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kas-bukti',
    'kas-bukti',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy untuk upload (authenticated users saja)
CREATE POLICY "Allow authenticated users to upload to kas-bukti"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kas-bukti');

-- Policy untuk read (public)
CREATE POLICY "Allow public to read kas-bukti"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'kas-bukti');

-- Policy untuk delete (authenticated users)
CREATE POLICY "Allow authenticated users to delete from kas-bukti"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'kas-bukti');
```

## Verifikasi

Setelah setup, test dengan cara:

1. Login ke portal sebagai pengurus biasa
2. Buka tab **"Transparansi Keuangan"**
3. Klik **"Bayar Kas"**
4. Pilih file bukti pembayaran (foto/PDF)
5. Isi jumlah dan bulan/tahun
6. Klik **"Kirim Pembayaran"**

Jika berhasil, akan muncul notifikasi:
> ✅ Berhasil! Pembayaran kas [Bulan] [Tahun] sebesar Rp [Nominal] telah dikirim dan menunggu verifikasi.

## Troubleshooting

### Error: "bucket not found"
- Bucket `kas-bukti` belum dibuat. Ikuti langkah setup di atas.

### Error: "permission denied for table storage.objects"
- RLS policies belum dikonfigurasi. Tambahkan policies seperti di atas.

### Upload berhasil tapi `bukti_url` kosong
- Cek console browser untuk error detail
- Pastikan user sudah login (authenticated)

### File terupload tapi tidak bisa diakses
- Pastikan bucket di-set sebagai **Public**
- Cek policy SELECT sudah benar

## Catatan Penting

1. **Ukuran File**: Maksimal 10MB per file
2. **Format File**: JPG, PNG, WebP, atau PDF
3. **Struktur Folder**: File akan disimpan dengan struktur `{pengurus_id}/{bulan}-{tahun}/{filename}`
4. **Keamanan**: Hanya user yang terautentikasi yang bisa upload

## Jika Masih Bermasalah

1. Buka **Browser Console** (F12)
2. Lihat error detail di tab **Console**
3. Screenshot error dan hubungi developer

---

**File Terkait**: 
- `src/app/portal/page.tsx` (fungsi `handleKasFileUpload`)
- `src/lib/upload.ts` (fungsi `uploadFile`)
- `migration_storage_buckets.sql` (migration bucket)