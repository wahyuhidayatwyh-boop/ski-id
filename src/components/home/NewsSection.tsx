"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

export default function NewsSection() {
  const news = [
    {
      id: 1,
      title: "Penerimaan Anggota Baru (Open Recruitment) SKI Tahun 2026 Resmi Dibuka",
      category: "Informasi",
      date: "12 Mei 2026",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Tabligh Akbar Menyambut Ramadhan: Meraih Kemenangan Sejati",
      category: "Kajian Besar",
      date: "05 Mar 2026",
      image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Program Bakti Sosial Desa Binaan SKI Sukses Dilaksanakan",
      category: "Kegiatan Sosial",
      date: "20 Feb 2026",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop",
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-900">Berita Terkini</h2>
          <Link href="/acara" className="text-sm font-semibold text-[#0ea5e9] hover:text-[#0284c7] flex items-center gap-1 group">
            Lihat Semua <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group cursor-pointer"
            >
              <div className="relative h-48 md:h-56 rounded-xl overflow-hidden mb-4">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded text-xs font-bold text-brand-900 uppercase tracking-wide shadow-sm">
                  {item.category}
                </div>
              </div>
              <div className="flex items-center gap-2 text-brand-500 text-sm mb-2">
                <Calendar size={14} />
                <span>{item.date}</span>
              </div>
              <h3 className="font-bold text-lg text-brand-900 leading-snug group-hover:text-gold-500 transition-colors">
                {item.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
