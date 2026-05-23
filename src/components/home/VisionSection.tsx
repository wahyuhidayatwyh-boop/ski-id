"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, HeartHandshake, Lightbulb, Star, ShieldCheck } from "lucide-react";

export default function VisionSection() {
  const visions = [
    {
      title: "Akidah yang Lurus",
      desc: "Menanamkan nilai-nilai keislaman yang kuat dan pemahaman agama yang moderat dalam keseharian setiap mahasiswa sebagai modal dasar integritas.",
      icon: <ShieldCheck size={24} className="text-gray-700" />
    },
    {
      title: "Ukhuwah Islamiyah",
      desc: "Membangun ikatan persaudaraan yang erat antar mahasiswa muslim, menjunjung tinggi toleransi, dan menciptakan lingkungan kampus yang harmonis.",
      icon: <HeartHandshake size={24} className="text-gray-700" />
    },
    {
      title: "Prestasi Akademik Tinggi",
      desc: "Menjamin bahwa setiap anggota SKI memiliki semangat belajar yang tinggi dan mampu berprestasi dalam bidang akademiknya masing-masing.",
      icon: <BookOpen size={24} className="text-gray-700" />
    },
    {
      title: "Kaderisasi Berkelanjutan",
      desc: "Mempersiapkan calon-calon pemimpin masa depan melalui program mentoring, pembinaan, dan pelatihan kepemimpinan yang terstruktur.",
      icon: <Users size={24} className="text-gray-700" />
    },
    {
      title: "Inovasi Dakwah",
      desc: "Menggunakan pendekatan yang kreatif, modern, dan relevan dengan zaman dalam menyampaikan syiar Islam kepada seluruh sivitas akademika.",
      icon: <Lightbulb size={24} className="text-gray-700" />
    },
    {
      title: "Kontribusi Sosial",
      desc: "Berperan aktif dalam kegiatan pengabdian masyarakat sebagai bentuk nyata pengamalan ilmu dan wujud kepedulian sosial yang berkelanjutan.",
      icon: <Star size={24} className="text-gray-700" />
    }
  ];

  return (
    <section className="py-20 bg-[#f8fafc] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 relative">
          <div className="relative z-10 max-w-2xl">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Sasaran SKI</h4>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e293b] leading-tight mb-6">
              Misi Sentral Kerohanian Islam (SKI) untuk <span className="text-[#0ea5e9]">Menuju Kampus Madani</span>
            </h2>
            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
              Program komprehensif yang dirancang untuk memastikan setiap mahasiswa mendapatkan pembinaan rohani optimal, mendukung tercapainya generasi kampus yang cerdas dan berakhlak mulia.
            </p>
          </div>
          
          {/* Decorative Right Side Ornament */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 hidden lg:flex justify-end items-center pointer-events-none translate-x-1/4">
             <img src="/elemen1.png" alt="" className="w-96 h-96 object-contain" />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visions.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1e293b] mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm flex-grow">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
