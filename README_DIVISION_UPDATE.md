# Update CRUD Divisi - Terikat Kabinet

## Perubahan yang Dilakukan

### 1. Database Schema Update
File: `migration_divisions_kabinet.sql`

Menambahkan kolom `kabinet_id` ke tabel `divisions`:
```sql
ALTER TABLE divisions 
ADD COLUMN IF NOT EXISTS kabinet_id UUID REFERENCES kabinets(id) ON DELETE CASCADE;
```

**Efek:**
- Setiap divisi sekarang terikat pada kabinet tertentu
- Saat kabinet dihapus, divisi yang terikat juga ikut terhapus (CASCADE)
- Divisi hanya muncul di kabinet yang dipilih

### 2. Edit Page untuk Divisi
File: `src/app/admin/admin1/profil/divisi/[id]/edit/page.tsx`

Fitur:
- ✅ Form edit divisi lengkap
- ✅ Pilih kabinet (dropdown)
- ✅ Edit nama, deskripsi, icon
- ✅ Preview icon emoji
- ✅ Tombol batal dan simpan

### 3. Update Form Tambah Divisi
File: `src/app/admin/admin1/profil/new/page.tsx`

Perubahan:
- ✅ Tambah dropdown pilihan kabinet (required)
- ✅ Validasi kabinet harus dipilih
- ✅ Preview icon emoji
- ✅ Redirect ke tab divisi setelah simpan

### 4. Update Main Profil Page
File: `src/app/admin/admin1/profil/page.tsx`

Perubahan:
- ✅ Fetch data divisi dengan relasi kabinet
- ✅ Tampilkan badge kabinet di setiap divisi
- ✅ Fix link edit: `/admin/${role}/profil/divisi/${div.id}/edit`
- ✅ Tambah tombol "Tambah Divisi Pertama" jika kosong

## Cara Menggunakan

### Langkah 1: Update Database
Jalankan migration di Supabase Dashboard:
```bash
# Copy isi file migration_divisions_kabinet.sql
# Paste ke SQL Editor di Supabase
# Klik Run
```

### Langkah 2: Tambah Divisi Baru
1. Buka `/admin/admin1/profil/new?tab=divisi`
2. Pilih **Kabinet** (wajib)
3. Isi nama divisi
4. Isi deskripsi (opsional)
5. Isi icon (emoji)
6. Klik **Simpan Divisi**

### Langkah 3: Edit Divisi
1. Di halaman `/admin/admin1/profil?tab=divisi`
2. Klik tombol **Edit** pada divisi yang ingin diubah
3. Update data yang diperlukan
4. Klik **Simpan Perubahan**

### Langkah 4: Hapus Divisi
1. Di halaman `/admin/admin1/profil?tab=divisi`
2. Klik tombol **Hapus** (icon trash)
3. Konfirmasi penghapusan

## Struktur Data Divisi

```typescript
interface Division {
    id: string;              // UUID
    name: string;            // Nama divisi (wajib)
    description?: string;    // Deskripsi (opsional)
    icon?: string;           // Icon emoji atau URL
    kabinet_id?: string;     // UUID kabinet (wajib untuk divisi baru)
    kabinets?: {             // Relasi ke kabinet
        name: string;
        period: string;
    }[] | null;
}
```

## Contoh Penggunaan

### Tambah Divisi untuk Kabinet Al-Istiqomah
```sql
INSERT INTO divisions (name, description, icon, kabinet_id)
VALUES (
    'Divisi Syiar',
    'Mengelola kajian dan dakwah kampus',
    '🕌',
    (SELECT id FROM kabinets WHERE name = 'Al-Istiqomah' AND period = '2025 / 2026')
);
```

### Lihat Semua Divisi dengan Kabinet
```sql
SELECT 
    d.name,
    d.description,
    d.icon,
    k.name as kabinet_name,
    k.period
FROM divisions d
LEFT JOIN kabinets k ON d.kabinet_id = k.id
ORDER BY k.period DESC, d.name;
```

### Update Kabinet Divisi
```sql
UPDATE divisions 
SET kabinet_id = (SELECT id FROM kabinets WHERE name = 'Al-Istiqomah' AND period = '2025 / 2026')
WHERE name = 'Divisi Syiar';
```

## Fitur Lengkap

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Tambah divisi | ✅ | Dengan pilihan kabinet wajib |
| Edit divisi | ✅ | Halaman edit khusus |
| Hapus divisi | ✅ | Dengan konfirmasi |
| Lihat divisi | ✅ | Dengan badge kabinet |
| Filter per kabinet | ✅ | Otomatis sesuai kabinet |
| Icon emoji | ✅ | Preview langsung |
| Deskripsi | ✅ | Optional, line-clamp-2 |

## Troubleshooting

### Error: "null value in column 'kabinet_id'"
- Pastikan memilih kabinet saat menambah divisi baru
- Untuk divisi yang sudah ada tanpa kabinet_id, jalankan:
  ```sql
  UPDATE divisions 
  SET kabinet_id = (SELECT id FROM kabinets WHERE is_active = true LIMIT 1)
  WHERE kabinet_id IS NULL;
  ```

### Divisi tidak muncul setelah tambah
- Cek apakah kabinet_id sudah terisi
- Refresh halaman admin
- Pastikan kabinet yang dipilih sudah dibuat

### Edit link tidak berfungsi
- Pastikan route `/admin/admin1/profil/divisi/[id]/edit` sudah dibuat
- Cek console browser untuk error

### Badge kabinet tidak muncul
- Pastikan query fetch divisi sudah include relasi kabinets
- Cek data di database apakah kabinet_id sudah benar

## Best Practices

1. **Satu kabinet, banyak divisi**: Setiap kabinet bisa punya divisi sendiri
2. **Kabinet berbeda, divisi bisa sama**: Divisi "Syiar" bisa ada di kabinet 2024 dan 2025
3. **Hapus kabinet hati-hati**: Semua divisi terhapus (CASCADE)
4. **Gunakan icon emoji**: Lebih ringan dan konsisten
5. **Deskripsi singkat**: Max 2 baris di tampilan

## Update Selanjutnya (Opsional)

Untuk pengalaman yang lebih baik, bisa ditambahkan:
- [ ] Filter divisi berdasarkan kabinet di halaman admin
- [ ] Bulk edit divisi (pindah kabinet)
- [ ] Export/import divisi antar kabinet
- [ ] Validasi nama divisi unik per kabinet
- [ ] Upload icon sebagai gambar (bukan hanya emoji)