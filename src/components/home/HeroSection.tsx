"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";

export default function HeroSection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className="relative w-full">
      {/* Video / Image Banner Area */}
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-brand-500 opacity-60 mix-blend-multiply z-10"></div>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/skividio.mp4" type="video/mp4" />
        </video>
        
        {/* Text overlay similar to template */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight mb-6 drop-shadow-lg"
          >
            Sinergi Dakwah Membangun Peradaban Kampus
          </motion.h1>
          
          {/* Play Video Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center gap-2 cursor-pointer group mt-4"
            onClick={() => setIsVideoModalOpen(true)}
          >
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-500 group-hover:scale-110 group-hover:bg-brand-100 transition-all shadow-lg">
              <Play size={24} className="ml-1" fill="currentColor" />
            </div>
            <span className="text-white font-bold tracking-widest uppercase text-sm group-hover:underline drop-shadow-md">Tonton Video Profil</span>
          </motion.div>
        </div>
      </div>

      {/* Video Modal (Instagram Embed) */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center"
            >
              <div className="w-full bg-brand-500 flex justify-between items-center p-4">
                <span className="text-white font-bold text-sm tracking-widest uppercase">Video Profil SKI</span>
                <button 
                  onClick={() => setIsVideoModalOpen(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="w-full bg-white flex items-center justify-center pt-4 pb-2">
                {/* Instagram Reels Iframe */}
                <iframe 
                  src="https://www.instagram.com/reel/DU24_zsAXj0/embed/" 
                  width="400" 
                  height="480" 
                  frameBorder="0" 
                  scrolling="no" 
                  allowTransparency={true}
                  allow="encrypted-media"
                  className="max-w-full rounded-xl"
                ></iframe>
              </div>
              <p className="text-xs text-slate-500 pb-4 px-6 text-center">
                Memuat video langsung dari Instagram Resmi SKI
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
