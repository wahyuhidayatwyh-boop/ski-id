// Data kabinet SKI - tambahkan kabinet baru di sini

export interface Member {
  name: string;
  nim?: string;
  prodi?: string;
  photo?: string;
}

export interface ProgramKerja {
  name: string;
  photo: string;
  description: string;
}

export interface Division {
  slug: string; // url-friendly identifier
  name: string;
  ketua: Member;
  anggota?: Member[];
  programs?: ProgramKerja[];
}

export interface Cabinet {
  id: string;
  name: string;
  period: string;
  logo: string;
  tagline?: string;
  description: string;
  visi: string;
  misi: string[];
  dpo?: Member[];
  ketuum: Member;
  wakilketum?: Member;
  sekretaris1?: Member;
  sekretaris2?: Member;
  bendahara1?: Member;
  bendahara2?: Member;
  lsos?: Division[];
  divisions: Division[];
  structureImageUrl?: string;
}

export const cabinets: Cabinet[] = [
  {
    id: "al-istiqomah-2025",
    name: "Al - Istiqomah",
    period: "2025 / 2026",
    logo: "/Logo%20SKI%20TEL-U%20P.png",
    tagline: "Istiqomah dalam Dakwah, Unggul dalam Prestasi",
    description: "Kabinet Al - Istiqomah dibentuk dengan komitmen kuat untuk menjaga konsistensi syiar dakwah di lingkungan kampus Universitas Telkom Purwokerto. Menekankan profesionalitas organisasi, kolaborasi inklusif, dan pengabdian tulus untuk melahirkan kader-kader rabbani yang unggul.",
    visi: "Menjadikan Sentral Kerohanian Islam (SKI) sebagai wadah utama pembinaan karakter Islami mahasiswa yang istiqomah, adaptif, kolaboratif, serta berdaya guna tinggi bagi almamater dan masyarakat.",
    misi: [
      "Mengoptimalkan sistem kaderisasi yang berkelanjutan and terstruktur guna melahirkan generasi Robbani.",
      "Menggalakkan syiar dakwah yang kreatif, moderat, dan bersahabat bagi seluruh sivitas akademika.",
      "Mempererat ukhuwah islamiyah dan kolaborasi aktif lintas organisasi di kampus maupun luar kampus.",
      "Mengembangkan layanan kemahasiswaan berbasis kepedulian sosial dan pemberdayaan umat.",
      "Meningkatkan tata kelola organisasi yang profesional, transparan, dan berbasis teknologi informasi."
    ],
    dpo: [
      { name: "Dewan Pertimbangan Organisasi", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" }
    ],
    ketuum: { name: "Wahyu Hidayat", nim: "2311102178", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop" },
    wakilketum: { name: "Zulfan Hanif Ihsani", nim: "103112430221", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" },
    sekretaris1: { name: "Fatimah Dewi Wulansari", nim: "104062430014", prodi: "S1 Bisnis Digital", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" },
    sekretaris2: { name: "Citra Kumala Dewi", nim: "2311103052", prodi: "S1 Sistem Informasi", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" },
    bendahara1: { name: "Putri Rahma Wati", nim: "103112400138", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" },
    bendahara2: { name: "Destina Bekti Setyaningsih", nim: "2311110018", prodi: "S1 Sains Data", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" },
    lsos: [
      {
        slug: "muslimah-center",
        name: "Muslimah Center",
        ketua: { name: "Resita Istania Purwanto", nim: "2311104037", prodi: "S1 Rekayasa Perangkat Lunak", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop" },
        anggota: [
          { name: "Aulia Isnaeni Azkatunnisa", nim: "2311101087", prodi: "S1 Teknik Telekomunikasi", photo: "https://images.unsplash.com/photo-1614644147724-2d4785d69962?q=80&w=150&auto=format&fit=crop" },
          { name: "Yumna Nuria Kasih Ilahi", nim: "102102430023", prodi: "S1 Teknik Logistik", photo: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=150&auto=format&fit=crop" },
          { name: "Qonita Syafa Qotrunnada", nim: "106082400066", prodi: "S1 Desain Komunikasi Visual", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" },
          { name: "Galuh Prameswari", nim: "106082400074", prodi: "S1 Desain Komunikasi Visual", photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&auto=format&fit=crop" }
        ],
        programs: [
          {
            name: "Kamulah (Kajian Muslimah)",
            photo: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop",
            description: "Kajian khusus berkala bagi kemahasiswaan akhwat membahas tema fiqih, akhlak, dan keputrian."
          },
          {
            name: "Muslimah Day & Talkshow",
            photo: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=400&auto=format&fit=crop",
            description: "Acara akbar tahunan khusus muslimah yang menghadirkan narasumber inspiratif serta workshop keterampilan."
          }
        ]
      },
      {
        slug: "quran-center",
        name: "Qur'an Center",
        ketua: { name: "Raihan Dzaky Muflih", nim: "103112430029", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop" },
        anggota: [
          { name: "Danishara Nurunnisa", nim: "2311111086", prodi: "S1 Bisnis Digital", photo: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=150&auto=format&fit=crop" },
          { name: "Fatma Aulia Chaniago", nim: "103112400205", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?q=80&w=150&auto=format&fit=crop" },
          { name: "Ghulam Manar Ishakan", nim: "2311101031", prodi: "S1 Teknik Telekomunikasi", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop" },
          { name: "Nasywa Na'ilah Husna", nim: "101132400015", prodi: "S1 Teknik Biomedis", photo: "https://images.unsplash.com/photo-1598550476439-6847785fce6e?q=80&w=150&auto=format&fit=crop" }
        ],
        programs: [
          {
            name: "Tahsin & Tahfidz Bimbingan",
            photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop",
            description: "Kelas pembinaan baca tulis Al-Qur'an serta bimbingan menyetorkan hafalan bagi mahasiswa umum."
          },
          {
            name: "Semarak Nuzulul Qur'an",
            photo: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=400&auto=format&fit=crop",
            description: "Peringatan hari besar Islam berisikan perlombaan musabaqah tilawatil Qur'an dan seminar tadabbur."
          }
        ]
      },
      {
        slug: "asistensi-agama-islam",
        name: "Asistensi Agama Islam",
        ketua: { name: "Afif Rijal Azzami", nim: "2311102235", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop" },
        anggota: [
          { name: "Muhammad Faizul Humam", nim: "2311102310", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop" },
          { name: "Muhammad Azzam Satria", nim: "103112400112", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=150&auto=format&fit=crop" },
          { name: "Dinda Silviani", nim: "2311111045", prodi: "S1 Bisnis Digital", photo: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=150&auto=format&fit=crop" },
          { name: "Putri Suria Lestari", nim: "2311103077", prodi: "S1 Sistem Informasi", photo: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=150&auto=format&fit=crop" },
          { name: "Irhas Agung Nur M. A.", nim: "2311111069", prodi: "S1 Bisnis Digital", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop" }
        ],
        programs: [
          {
            name: "Pendampingan PAI (Praktikum)",
            photo: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=400&auto=format&fit=crop",
            description: "Mentoring materi dasar ibadah dan praktik keislaman sebagai pendukung mata kuliah PAI wajib."
          },
          {
            name: "Ujian Kelulusan Praktikum PAI",
            photo: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop",
            description: "Evaluasi dan penilaian kelayakan pemahaman cara wudhu, sholat, membaca Al-Qur'an bagi mahasiswa."
          }
        ]
      }
    ],
    divisions: [
      {
        slug: "syiar",
        name: "Syiar",
        ketua: { name: "M Hamka Zainul Ardhi", nim: "2311103156", prodi: "S1 Sistem Informasi", photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&auto=format&fit=crop" },
        anggota: [
          { name: "Dinda Natasya Artaviana", nim: "2311109007", prodi: "S1 Teknik Logistik", photo: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=150&auto=format&fit=crop" },
          { name: "Muhammad Andhika Zakaria", nim: "102092400094", prodi: "S1 Sistem Informasi", photo: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=150&auto=format&fit=crop" }
        ],
        programs: [
          {
            name: "Kajian Rutin Kampus",
            photo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop",
            description: "Majelis ilmu berkala mendalami pemikiran Islam kontemporer yang relevan bagi kehidupan perkuliahan."
          },
          {
            name: "Tabligh Akbar Telkom Purwokerto",
            photo: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop",
            description: "Kajian besar memperingati hari keislaman nasional dengan mengundang pemateri tersohor."
          }
        ]
      },
      {
        slug: "kaderisasi",
        name: "Kaderisasi",
        ketua: { name: "Faiqotul Izzah", nim: "2311108035", prodi: "S1 Teknik Biomedis", photo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=150&auto=format&fit=crop" },
        anggota: [
          { name: "Yulia Rahman Pasaribu", nim: "2311109018", prodi: "S1 Teknik Logistik", photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=150&auto=format&fit=crop" },
          { name: "Eka Permata Sari", nim: "102102430007", prodi: "S1 Teknik Logistik", photo: "https://images.unsplash.com/photo-1557555187-23d685287bc3?q=80&w=150&auto=format&fit=crop" },
          { name: "M. Zidane Radin Daffa", nim: "102092430004", prodi: "S1 Sistem Informasi", photo: "https://images.unsplash.com/photo-1542343633-ce4856b411f2?q=80&w=150&auto=format&fit=crop" },
          { name: "Arif Fadlil Hasibuan", nim: "103112400220", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=150&auto=format&fit=crop" },
          { name: "Hijriah enjelika br S.", nim: "101112430049", prodi: "S1 Teknik Telekomunikasi", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop" }
        ],
        programs: [
          {
            name: "LKID (Latihan Kepemimpinan Dasar)",
            photo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400&auto=format&fit=crop",
            description: "Pembekalan mental kepemimpinan rabbani, ukhuwah, dan keorganisasian bagi calon penerus SKI."
          },
          {
            name: "Upgrading & Rihlah Pengurus",
            photo: "https://images.unsplash.com/photo-1526976775908-f6a9b9f54b1a?q=80&w=400&auto=format&fit=crop",
            description: "Kegiatan bonding pengurus tengah tahun guna me-refresh ukhuwah serta membakar motivasi berdakwah."
          }
        ]
      },
      {
        slug: "humas",
        name: "Humas",
        ketua: { name: "Qumillaila Nur Izzati", nim: "102092430121", prodi: "S1 Sistem Informasi", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" },
        anggota: [
          { name: "Shania Finka Dewi", nim: "2311103063", prodi: "S1 Sistem Informasi", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" },
          { name: "Riefka Febina Parastika", nim: "2311111012", prodi: "S1 Bisnis Digital", photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=150&auto=format&fit=crop" },
          { name: "Dini Shafira Kristi K.", nim: "102092430099", prodi: "S1 Sistem Informasi", photo: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=150&auto=format&fit=crop" },
          { name: "Zaki Farhan Rifai", nim: "102092430002", prodi: "S1 Sistem Informasi", photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&auto=format&fit=crop" },
          { name: "Rizky Wassyifa", nim: "2311106007", prodi: "S1 Teknik Industri", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop" }
        ],
        programs: [
          {
            name: "Bakti Sosial (Peduli Masyarakat)",
            photo: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop",
            description: "Penyaluran zakat fitrah, sembako, dan santunan anak yatim di sekitar Purwokerto Selatan."
          },
          {
            name: "Studi Banding LDK",
            photo: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=400&auto=format&fit=crop",
            description: "Kunjungan ukhuwah dan bertukar wawasan program kerja dengan Lembaga Dakwah Kampus luar universitas."
          }
        ]
      },
      {
        slug: "kewirausahaan",
        name: "Kewirausahaan",
        ketua: { name: "Argia Rajessa Rizarr", nim: "2311111074", prodi: "S1 Bisnis Digital", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" },
        anggota: [
          { name: "Ibtida Zada Utomo", nim: "103112430037", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop" },
          { name: "Jundi Amru Abbas D.", nim: "103112400143", prodi: "S1 Teknik Informatika", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" }
        ],
        programs: [
          {
            name: "Penyediaan Merchandise Resmi",
            photo: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400&auto=format&fit=crop",
            description: "Produksi dan penjualan baju koko, ID Card holder, PIN dakwah dan tumbler untuk operasional SKI."
          },
          {
            name: "Seminar Kewirausahaan Muda",
            photo: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=400&auto=format&fit=crop",
            description: "Webinar/talkshow interaktif mengenai tips sukses bisnis syariah bagi kalangan mahasiswa."
          }
        ]
      },
      {
        slug: "media-komunikasi",
        name: "Media Komunikasi",
        ketua: { name: "Merliana Cahya Amalia", nim: "2311106081", prodi: "S1 Teknik Industri", photo: "https://images.unsplash.com/photo-1534751516642-a131ffd473fd?q=80&w=150&auto=format&fit=crop" },
        anggota: [
          { name: "Fauzan Aliim", nim: "104062400120", prodi: "S1 Bisnis Digital", photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=150&auto=format&fit=crop" },
          { name: "Fauzaan Rofi Radytya", nim: "106082430003", prodi: "S1 Desain Komunikasi Visual", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop" },
          { name: "Muhammad Mahrus Ali", nim: "2311104006", prodi: "S1 Rekayasa Perangkat Lunak", photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop" }
        ],
        programs: [
          {
            name: "Penyebaran Media Dakwah Digital",
            photo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop",
            description: "Pembuatan konten grafis dakwah dan reels dakwah kreatif harian di media sosial Instagram SKI."
          },
          {
            name: "Dokumentasi Kegiatan & Event",
            photo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop",
            description: "Peliputan fotografi dan videografi di setiap rangkaian program kerja kabinet Al-Istiqomah."
          }
        ]
      }
    ],
    structureImageUrl: "/elemen1.png"
  },
  {
    id: "kabinet-sebelumnya-2024",
    name: "Al - Fatih",
    period: "2024 / 2025",
    logo: "/Logo%20SKI%20TEL-U%20P.png",
    tagline: "Bergerak Bersama, Berdampak Nyata",
    description: "Kabinet Al - Fatih membawa misi pembaharuan dakwah yang adaptif terhadap dinamika mahasiswa, berfokus pada integrasi ilmu akademis dengan pemahaman spiritual yang moderat.",
    visi: "Terwujudnya Sentral Kerohanian Islam sebagai lokomotif dakwah inspiratif yang mencetak insan akademis berkarakter Robbani.",
    misi: [
      "Menyelenggarakan kajian intensif berorientasi pada pemecahan masalah mahasiswa modern.",
      "Menguatkan jejaring alumni untuk kolaborasi peningkatan soft skill pengurus.",
      "Menginisiasi aksi sosial rutin di lingkungan masyarakat sekitar kampus."
    ],
    ketuum: { name: "Ahmad Faris", nim: "Ketua Umum", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" },
    wakilketum: { name: "Zahra Aulia", nim: "Wakil Ketua", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" },
    sekretaris1: { name: "Sarah Nabila", nim: "Sekretaris", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" },
    bendahara1: { name: "Irfan Rosyadi", nim: "Bendahara", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop" },
    divisions: [
      {
        slug: "syiar-kreatif",
        name: "Syiar Kreatif",
        ketua: { name: "Habib Rahman", nim: "Koor", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop" },
        anggota: [
          { name: "Ali Akbar", nim: "Staff", photo: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=150&auto=format&fit=crop" },
          { name: "Salma Salsabila", nim: "Staff", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" }
        ],
        programs: [
          {
            name: "Kajian Senja Mahasiswa",
            photo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop",
            description: "Diskusi ringan membahas akhlak sehari-hari mahasiswa muslim."
          }
        ]
      },
      {
        slug: "pengembangan-sdm",
        name: "Pengembangan SDM",
        ketua: { name: "Fatima Az Zahra", nim: "Koor", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" },
        anggota: [
          { name: "Taufik Hidayat", nim: "Staff", photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop" },
          { name: "Siti Humairah", nim: "Staff", photo: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=150&auto=format&fit=crop" }
        ],
        programs: [
          {
            name: "Pelatihan Dasar Keorganisasian",
            photo: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=400&auto=format&fit=crop",
            description: "Upgrading soft skill manajemen waktu dan kepemimpinan."
          }
        ]
      }
    ]
  }
];
