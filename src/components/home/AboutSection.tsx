"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 grid grid-cols-3 grid-rows-3 gap-0.5 opacity-20">
                 {[...Array(9)].map((_, i) => <div key={i} className="bg-gray-400 rounded-sm"></div>)}
               </div>
               <span className="text-sm font-semibold text-gray-500">Tentang Kami</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e293b] leading-tight mb-6">
              Sentral Kerohanian Islam: <span className="font-medium text-[#334155]">Lembaga yang Berkomitmen pada</span> Pembangunan Karakter Mahasiswa
            </h2>
            
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              Sentral Kerohanian Islam (SKI) merupakan unit kegiatan mahasiswa tingkat universitas yang bertugas memastikan terpenuhinya kebutuhan rohani seluruh mahasiswa. Kami berfokus pada peningkatan kualitas ibadah dan ukhuwah melalui program yang terstruktur, terukur, dan berkelanjutan.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
              <span className="text-gray-400">📄</span>
              SK Rektor No. 12 Tahun 2024
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex justify-center relative"
          >
            {/* Logo */}
            <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] relative z-10 p-8 rounded-full bg-white shadow-xl border border-gray-50 flex items-center justify-center">
              <img src="/Logo%20SKI%20TEL-U%20P.png" alt="Logo SKI" className="w-full h-full object-contain" />
            </div>
            
            {/* Background Pattern Decoration */}
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-20 hidden md:block pointer-events-none">
               <img src="/elemen1.png" alt="" className="w-full h-full object-contain" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
