"use client";

import { UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function CtaSection() {
  return (
    <section className="bg-brand-500 text-white relative overflow-hidden py-16">
      {/* Decorative Islamic Background Elements */}
      <div className="absolute inset-0 bg-ornament-blue opacity-50 z-0"></div>
      
      {/* Large faint logo behind */}
      <div className="absolute -right-20 -bottom-20 opacity-10 z-0 pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full border-[40px] border-white"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          
          <div className="max-w-2xl text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bergabung Bersama <span className="text-gold-500">Keluarga Besar SKI</span>
            </h2>
            <p className="text-brand-300 text-lg leading-relaxed">
              Jadilah bagian dari lebih dari 1.200 mahasiswa penggerak kebaikan. Mari bersama-sama menebarkan manfaat dan mengembangkan potensi dirimu bersama organisasi muslim terbesar di kampus.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gold-500 text-brand-900 font-bold px-8 py-4 rounded-md shadow-lg flex items-center gap-2 hover:bg-yellow-400 transition-colors"
            >
              <UserPlus size={20} />
              Daftar Sekarang
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-white/30 text-white font-semibold px-8 py-4 rounded-md hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              Pelajari Lebih Lanjut
            </motion.button>
          </div>

        </div>
      </div>
    </section>
  );
}
