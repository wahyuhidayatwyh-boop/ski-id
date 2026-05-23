export interface DocumentationItem {
  id: number;
  title: string;
  date: string;
  division: string; // Divisi penyelenggara
  image: string; // Main image
  gallery: string[]; // Additional gallery photos
  description: string;
}

export const documentations: DocumentationItem[] = [
  {
    id: 1,
    title: "Dokumentasi Latihan Kepemimpinan Islam Dasar (LKID) 2025",
    date: "14 April 2025",
    division: "Kaderisasi",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Keseruan dan antusiasme para peserta LKID 2025 dalam mengikuti serangkaian pemaparan materi kepemimpinan, FGD (Focus Group Discussion), serta outbound training di alam terbuka guna memupuk ukhuwah dan jiwa kepemimpinan rabbani."
  },
  {
    id: 2,
    title: "Rihlah & Family Gathering SKI 2025",
    date: "20 Mei 2025",
    division: "Pengurus Harian",
    image: "https://images.unsplash.com/photo-1526976775908-f6a9b9f54b1a?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Kegiatan penyegaran dan rekreasi bersama seluruh pengurus Kabinet Al-Istiqomah di Baturraden. Acara ini diisi dengan games keakraban, bakar-bakar bersama, serta sesi evaluasi santai tengah tahun kepengurusan."
  },
  {
    id: 3,
    title: "Semarak Ramadhan di Kampus (RDK) 1446 H",
    date: "12 Maret 2025",
    division: "Syiar",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Dokumentasi rangkaian kegiatan Ramadhan di Kampus (RDK) yang meliputi pembagian takjil gratis, kajian menjelang berbuka puasa di Masjid Kampus, tarawih berjamaah, hingga penyaluran zakat fitrah kepada yang berhak."
  },
  {
    id: 4,
    title: "Tabligh Akbar Hijrah & Kebangkitan Pemuda",
    date: "05 Oktober 2024",
    division: "Syiar",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Dokumentasi tabligh akbar yang dihadiri oleh ratusan mahasiswa dari berbagai jurusan. Acara ini mengupas tuntas urgensi peran pemuda islam dalam berkontribusi nyata bagi peradaban dan kemajuan bangsa."
  }
];
