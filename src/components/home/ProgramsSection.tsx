"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Calendar, Image as ImageIcon } from "lucide-react";

type Program = {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  image: string;
  gallery: string[];
  pic: string;
  schedule: string;
};

export default function ProgramsSection() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const programs: Program[] = [
    {
      id: "1",
      title: "Profil Kajian Rutin & Tahsin Akbar",
      shortDesc: "Pusat pembelajaran Al-Qur'an dan ilmu syar'i secara berkesinambungan bagi seluruh mahasiswa muslim.",
      fullDesc: "Program Kajian Rutin dan Tahsin ini dirancang untuk memfasilitasi mahasiswa dalam memperbaiki bacaan Al-Qur'an sekaligus memperdalam ilmu agama. Mendatangkan pemateri dan ustadz/ustadzah berkompeten untuk membina kelompok belajar (halaqah) setiap pekannya.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1609599006353-e629aaab31f7?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1576484963503-49d7990ce064?q=80&w=400&auto=format&fit=crop",
      ],
      pic: "Divisi Syiar & Keilmuan",
      schedule: "Setiap Jumat Sore & Ahad Pagi",
    },
    {
      id: "2",
      title: "Mentoring & Kaderisasi",
      shortDesc: "Pendampingan halaqah untuk membina kepribadian islami.",
      fullDesc: "Program Mentoring merupakan tulang punggung kaderisasi SKI untuk mahasiswa baru. Tujuan utamanya adalah menjaga ukhuwah dan memonitor ibadah harian.",
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517048676732-d65af93c5f20?q=80&w=400&auto=format&fit=crop",
      ],
      pic: "Divisi Kaderisasi (Biro HRD)",
      schedule: "Fleksibel setiap pekan",
    },
    {
      id: "3",
      title: "Festival Kampus Islami",
      shortDesc: "Event besar tahunan seperti Islamic Book Fair.",
      fullDesc: "Festival Kampus Islami (FKI) adalah mega-proyek tahunan SKI. Acara ini mencakup berbagai perlombaan tingkat nasional, bazar buku islami, hingga Tabligh Akbar.",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=400&auto=format&fit=crop",
      ],
      pic: "Kepanitiaan Khusus (Divisi Acara)",
      schedule: "Bulan November",
    },
    {
      id: "4",
      title: "Bakti Sosial Desa Binaan",
      shortDesc: "Kepedulian sosial melalui pengabdian desa binaan.",
      fullDesc: "Bentuk nyata kontribusi sosial SKI kepada masyarakat. Kami menyalurkan santunan untuk yatim piatu, program qurban di desa terpelosok, serta aksi tanggap bencana.",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1593113580332-628dd5098198?q=80&w=400&auto=format&fit=crop",
      ],
      pic: "Divisi Hubungan Masyarakat",
      schedule: "Semesteran",
    },
    {
      id: "5",
      title: "Podcast & Dakwah Digital",
      shortDesc: "Penyebaran syiar Islam melalui media sosial kekinian.",
      fullDesc: "Pembuatan konten dakwah digital yang kreatif dan relevan dengan gaya hidup mahasiswa saat ini, seperti podcast inspiratif dan desain grafis.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=400&auto=format&fit=crop",
      ],
      pic: "Divisi Media & Komunikasi",
      schedule: "Rutin Harian",
    }
  ];

  const featuredProgram = programs[0];
  const subPrograms = programs.slice(1);

  return (
    <section className="py-20 bg-brand-50 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* Top Profile (Featured Program) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-brand-900 mb-6 border-b border-brand-200 pb-3 inline-block">Profil Program Unggulan</h2>
          
          <div 
            onClick={() => setSelectedProgram(featuredProgram)}
            className="w-full lg:w-4/5 h-[400px] md:h-[500px] rounded-3xl overflow-hidden relative cursor-pointer group shadow-lg"
          >
            <img 
              src={featuredProgram.image} 
              alt={featuredProgram.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="bg-gold-500 text-brand-900 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm mb-3 inline-block">Sorotan Utama</span>
              <h3 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">{featuredProgram.title}</h3>
              <p className="text-brand-100 max-w-2xl text-lg hidden md:block">{featuredProgram.shortDesc}</p>
            </div>
            
            {/* Click Indicator */}
            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
              Klik untuk Detail
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Photo Cards */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-900">Program Kerja Lainnya</h2>
            <button className="text-sm font-semibold text-brand-600 hover:text-brand-900 border border-brand-300 px-4 py-2 rounded-full hover:bg-brand-100 transition-colors">
              Lihat Semua
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subPrograms.map((prog, idx) => (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                onClick={() => setSelectedProgram(prog)}
                className="h-64 rounded-2xl overflow-hidden relative cursor-pointer group shadow-sm hover:shadow-md"
              >
                <img 
                  src={prog.image} 
                  alt={prog.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-bold leading-snug mb-1">{prog.title}</h4>
                  <p className="text-brand-100 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                    {prog.shortDesc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedProgram(null)}
              className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col"
            >
              <button 
                onClick={() => setSelectedProgram(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 text-white backdrop-blur-md rounded-full flex items-center justify-center transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="w-full h-64 md:h-80 relative shrink-0">
                <img 
                  src={selectedProgram.image} 
                  alt={selectedProgram.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 md:left-10 right-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedProgram.title}</h2>
                  <p className="text-brand-100">{selectedProgram.shortDesc}</p>
                </div>
              </div>

              <div className="p-6 md:p-10 flex flex-col lg:flex-row gap-10">
                <div className="lg:w-2/3">
                  <h3 className="text-xl font-bold text-brand-900 mb-4">Deskripsi Lengkap</h3>
                  <p className="text-brand-700 leading-relaxed text-lg mb-8">
                    {selectedProgram.fullDesc}
                  </p>

                  <h3 className="text-xl font-bold text-brand-900 mb-4 flex items-center gap-2">
                    <ImageIcon size={20} className="text-brand-500" />
                    Galeri & Dokumentasi
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProgram.gallery.map((img, i) => (
                      <div key={i} className="rounded-xl overflow-hidden h-40 shadow-sm border border-brand-100">
                        <img src={img} alt="Dokumentasi" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:w-1/3 flex flex-col gap-6 bg-brand-50 p-6 rounded-2xl border border-brand-100 shrink-0 h-fit">
                  <div>
                    <h4 className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Users size={16} /> PIC / Divisi
                    </h4>
                    <p className="text-brand-900 font-bold text-lg">{selectedProgram.pic}</p>
                  </div>
                  <div className="w-full h-px bg-brand-200"></div>
                  <div>
                    <h4 className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Calendar size={16} /> Jadwal
                    </h4>
                    <p className="text-brand-900 font-bold">{selectedProgram.schedule}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
