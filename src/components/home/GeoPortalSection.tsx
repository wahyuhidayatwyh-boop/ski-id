"use client";

import Link from "next/link";
import { Globe } from "lucide-react";

export default function GeoPortalSection() {
  return (
    <section className="pb-20 bg-[#f8fafc] px-4 md:px-8 lg:px-12">
      <div className="container mx-auto">
        <div className="bg-[#f1f5f9] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border border-[#e2e8f0]">
          
          {/* Background Decorative Patterns */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none -translate-x-1/2">
            <img src="/elemen1.png" alt="" className="w-[300px] h-[300px] object-contain" />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none translate-x-1/2">
            <img src="/elemen1.png" alt="" className="w-[300px] h-[300px] object-contain" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#e2e8f0]">
              <Globe size={24} className="text-[#475569]" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-4">
              Portal Data & Sistem Informasi SKI
            </h2>
            
            <p className="text-[#475569] mb-8 leading-relaxed">
              Temukan data keanggotaan dan dokumentasi kegiatan SKI secara komprehensif. Halaman ini mengarahkan Anda ke portal resmi sistem informasi internal kami yang menyajikan data aktivitas harian dan peta persebaran kader.
            </p>
            
            <Link 
              href="/portal" 
              className="px-8 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              Akses Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
