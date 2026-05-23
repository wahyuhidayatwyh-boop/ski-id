# Fix Delete Functionality - Kabinet, Divisi, Pengurus

## Masalah yang Diperbaiki

Sebelumnya, tombol hapus di admin tidak berfungsi karena:
1. **Foreign key constraints** tanpa `ON DELETE CASCADE`
2. Data child (pengurus, divisi) terikat pada parent (kabinet) 
3. Database menolak menghapus parent karena masih ada child yang mereferensinya

## Solusi

### Migration: `migration_fix_cascade_delete.sql`

Menambahkan `ON DELETE CASCADE` atau `ON DELETE SET NULL` ke semua foreign key:

```sql
-- 1. pengurus -> kabinets: CASCADE
-- Hapus kabinet → pengurus ikut terhapus
ALTER TABLE pengurus 
ADD CONSTRAINT pengurus_kabinet_id_fkey 
FOREIGN KEY (kabinet_id) REFERENCES kabinets(id) ON DELETE CASCADE;

-- 2. pengurus -> divisions: SET NULL
-- Hapus divisi → pengurus tetap ada (tanpa divisi)
ALTER TABLE pengurus 
ADD CONSTRAINT pengurus_division_id_fkey 
FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL;

-- 3. divisions -> kabinets: CASCADE
-- Hapus kabinet → divisi ikut terhapus
ALTER TABLE divisions 
ADD CONSTRAINT divisions_kabinet_id_fkey 
FOREIGN KEY (kabinet_id) REFERENCES kabinets(id) ON DELETE CASCADE;
```

## Cara Menggunakan

### Langkah 1: Jalankan Migration
```sql
-- Di Supabase Dashboard → SQL Editor
-- Copy-paste isi migration_fix_cascade_delete.sql
-- Klik Run
```

### Langkah 2: Verifikasi
Cek apakah constraints sudah benar:
```sql
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confdeltype as delete_behavior
FROM pg_constraint 
WHERE conrelid = 'pengurus'::regclass 
   OR conrelid = 'divisions'::regclass;
```

Expected result:
| constraint_name | constraint_type | delete_behavior |
|----------------|----------------|----------------|
| pengurus_kabinet_id_fkey | f | c (CASCADE) |
| pengurus_division_id_fkey | f | n (SET NULL) |
| divisions_kabinet_id_fkey | f | c (CASCADE) |

### Langkah 3: Test Delete
Sekarang tombol hapus di admin sudah berfungsi:

1. **Hapus Pengurus**:
   - Klik tombol trash di daftar pengurus
   - Konfirmasi
   - Pengurus terhapus

2. **Hapus Divisi**:
   - Klik tombol trash di daftar divisi
   - Konfirmasi
   - Divisi terhapus, pengurus di divisi tersebut tetap ada (tanpa divisi)

3. **Hapus Kabinet**:
   - Klik tombol trash di daftar kabinet
   - Konfirmasi
   - Kabinet terhapus beserta semua pengurus & divisi di dalamnya

## Perilaku Delete

### Hapus Pengurus
```
Before: Pengurus "Budi" di Divisi Syiar, Kabinet Al-Istiqomah
After:  Pengurus "Budi" terhapus dari database
Impact: Tidak ada impact ke data lain
```

### Hapus Divisi
```
Before: Divisi "Syiar" punya 5 anggota
After:  Divisi "Syiar" terhapus
Impact: 5 anggota tetap ada, tapi division_id = NULL
```

### Hapus Kabinet
```
Before: Kabinet "Al-Istiqomah" punya:
        - 10 pengurus inti
        - 5 divisi
        - 50 anggota
After:  Kabinet "Al-Istiqomah" terhapus
Impact: Semua 10 pengurus, 5 divisi, 50 anggota ikut terhapus
```

## Struktur Database Setelah Fix

```
kabinets
├── divisions (ON DELETE CASCADE)
│   └── (terhapus saat kabinet dihapus)
└── pengurus (ON DELETE CASCADE)
    └── (terhapus saat kabinet dihapus)

divisions
└── pengurus (ON DELETE SET NULL)
    └── (division_id jadi NULL saat divisi dihapus)
```

## Troubleshooting

### Error: "update or delete on table 'kabinets' violates foreign key constraint"
- **Penyebab**: Migration belum dijalankan
- **Solusi**: Jalankan `migration_fix_cascade_delete.sql`

### Error: "More than one row returned by subquery"
- **Penyebab**: Ada data duplicate
- **Solusi**: Cek data yang duplikat dan hapus manual dulu

### Delete berhasil tapi data masih muncul
- **Penyebab**: Frontend belum refresh
- **Solusi**: Refresh halaman atau klik tombol refresh

### Data terhapus semua
- **Penyebab**: Salah hapus kabinet yang aktif
- **Solusi**: Restore dari backup atau buat data baru

## Best Practices

1. **Backup sebelum hapus kabinet**:
   ```sql
   -- Export data dulu
   SELECT * FROM kabinets WHERE id = 'xxx';
   SELECT * FROM divisions WHERE kabinet_id = 'xxx';
   SELECT * FROM pengurus WHERE kabinet_id = 'xxx';
   ```

2. **Hapus pengurus satu-satu**, jangan lewat kabinet (kecuali memang mau hapus semua)

3. **Non-aktifkan kabinet** dulu sebelum hapus:
   ```sql
   UPDATE kabinets SET is_active = false WHERE id = 'xxx';
   ```

4. **Cek jumlah data** sebelum hapus kabinet:
   ```sql
   SELECT 
       (SELECT COUNT(*) FROM pengurus WHERE kabinet_id = 'xxx') as total_pengurus,
       (SELECT COUNT(*) FROM divisions WHERE kabinet_id = 'xxx') as total_divisi;
   ```

## Testing Checklist

Setelah menjalankan migration, test:

- [ ] Hapus 1 pengurus → berhasil, pengurus hilang
- [ ] Hapus 1 divisi → berhasil, divisi hilang, anggota tetap ada
- [ ] Hapus 1 kabinet (non-aktif) → berhasil, semua data terkait hilang
- [ ] Coba hapus kabinet yang punya banyak data → berhasil tanpa error

## Rollback (Jika Ada Masalah)

Jika ingin mengembalikan ke kondisi semula (tanpa CASCADE):

```sql
-- Hapus constraints yang baru
ALTER TABLE pengurus DROP CONSTRAINT IF EXISTS pengurus_kabinet_id_fkey;
ALTER TABLE pengurus DROP CONSTRAINT IF EXISTS pengurus_division_id_fkey;
ALTER TABLE divisions DROP CONSTRAINT IF EXISTS divisions_kabinet_id_fkey;

-- Buat constraints tanpa CASCADE (akan error kalau ada child)
ALTER TABLE pengurus 
ADD CONSTRAINT pengurus_kabinet_id_fkey 
FOREIGN KEY (kabinet_id) REFERENCES kabinets(id);

ALTER TABLE pengurus 
ADD CONSTRAINT pengurus_division_id_fkey 
FOREIGN KEY (division_id) REFERENCES divisions(id);

ALTER TABLE divisions 
ADD CONSTRAINT divisions_kabinet_id_fkey 
FOREIGN KEY (kabinet_id) REFERENCES kabinets(id);
```

**Catatan**: Rollback tidak disarankan karena delete akan error lagi.