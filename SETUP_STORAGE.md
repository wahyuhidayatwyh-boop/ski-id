# Panduan Setup Supabase Storage untuk Foto Pengurus

Untuk mengupload foto pengurus dari komputer lokal, Anda perlu membuat storage bucket di Supabase.

## Langkah 1: Buat Storage Bucket

1. Login ke [Supabase Dashboard](https://supabase.com)
2. Pilih project SKI Website Anda
3. Klik **Storage** di sidebar kiri
4. Klik **New bucket**
5. Isi nama bucket: `pengurus-photos`
6. Pilih **Public bucket** (agar foto bisa diakses publik)
7. Klik **Save**

## Langkah 2: Setup Storage Policies

Setelah membuat bucket, Anda perlu menambahkan policy agar bisa upload:

1. Di halaman bucket `pengurus-photos`, klik tab **Policies**
2. Klik **New policy**
3. Pilih **For full customization** klik **Create policy**
4. Isi nama policy: `Allow authenticated users to upload images`
5. Pilih operation: `INSERT`
6. Di bagian **Policy definition**, pilih:
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **Check expression**: 
     ```sql
     bucket_id = 'pengurus-photos' AND (auth.uid())::text = owner::text
     ```
7. Klik **Review** lalu **Save policy**

### Policy untuk Read (Membaca)

1. Klik **New policy** lagi
2. Pilih **For full customization** → **Create policy**
3. Isi nama: `Allow public read access`
4. Pilih operation: `SELECT`
5. **Target roles**: `public` (atau `anon`)
6. **Select expression**: 
   ```sql
   bucket_id = 'pengurus-photos'
   ```
7. Klik **Review** → **Save policy**

### Policy untuk Delete (Menghapus)

1. Klik **New policy** lagi
2. Pilih **For full customization** → **Create policy**
3. Isi nama: `Allow authenticated users to delete images`
4. Pilih operation: `DELETE`
5. **Target roles**: `authenticated`
6. **Check expression**: 
   ```sql
   bucket_id = 'pengurus-photos' AND (auth.uid())::text = owner::text
   ```
7. Klik **Review** → **Save policy**

## Langkah 3: Verifikasi Setup

Setelah setup, struktur policy Anda harus seperti ini:

| Policy Name | Operation | Roles |
|-------------|-----------|-------|
| Allow authenticated users to upload images | INSERT | authenticated |
| Allow public read access | SELECT | public |
| Allow authenticated users to delete images | DELETE | authenticated |

## Langkah 4: Gunakan di Admin

Setelah storage bucket siap:

1. Buka halaman admin: `/admin/admin1/profil/new?tab=pengurus`
2. Isi data pengurus
3. Di bagian **Foto Profil**, klik **Choose File**
4. Pilih foto dari komputer Anda
5. Sistem akan otomatis upload ke Supabase Storage
6. URL foto akan tersimpan di database

## Troubleshooting

### Error: "No bucket found"
- Pastikan nama bucket persis `pengurus-photos`
- Cek di file `src/lib/upload.ts` parameter bucket sudah benar

### Error: "Permission denied"
- Pastikan policy sudah dibuat dengan benar
- Pastikan user sudah login (authenticated)
- Cek role user di Supabase

### Foto tidak muncul setelah upload
- Cek apakah bucket sudah public
- Cek policy SELECT sudah ada
- Clear browser cache
- Coba refresh halaman

## Mengganti Bucket Name

Jika ingin mengganti nama bucket, update di dua tempat:

1. **File `src/lib/upload.ts`**:
   ```typescript
   export async function uploadFile(
       file: File,
       bucket: string = 'nama-bucket-baru', // ganti di sini
       folder: string = ''
   ): Promise<string | null> {
   ```

2. **File `src/lib/upload.ts`** fungsi `deleteFile`:
   ```typescript
   export async function deleteFile(
       filePath: string,
       bucket: string = 'nama-bucket-baru' // ganti di sini
   ): Promise<void> {
   ```

## Tips

- **Ukuran Foto**: Sebaiknya foto berukuran maksimal 500x500px untuk performa optimal
- **Format**: Gunakan JPG atau PNG
- **Nama File**: Sistem akan otomatis generate nama file unik (timestamp + random string)
- **Folder**: Foto akan disimpan di folder `profiles/` dalam bucket

## Backup & Restore

Untuk backup foto-foto:
1. Buka Supabase Dashboard → Storage
2. Pilih bucket `pengurus-photos`
3. Download semua file yang diperlukan

Atau gunakan Supabase CLI:
```bash
supabase storage cp -r "pengurus-photos/" ./backup-photos/