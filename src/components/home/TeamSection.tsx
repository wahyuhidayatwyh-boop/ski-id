"use client";

import Link from "next/link";
import { Info } from "lucide-react";

export default function TeamSection() {
  return (
    <section className="bg-[#0284c7] text-white py-20 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
         <img src="/elemen2.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        <div className="max-w-3xl">
          <h4 className="text-sm font-semibold text-gray-300 mb-4">Tim SKI</h4>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-8">
            Tim kami terdiri dari <span className="text-[#bae6fd]">berbagai elemen kampus</span>, yang semuanya berdedikasi untuk mencapai visi SKI
          </h2>
          
          <Link 
            href="/profil" 
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-400 rounded-full hover:bg-white/10 transition-colors"
          >
            <Info size={18} />
            Pelajari Lebih Lanjut
          </Link>
        </div>

      </div>

      {/* Right side ornament */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 md:w-1/4 hidden sm:block pointer-events-none">
         <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-40">
            <img src="/elemen1.png" alt="" className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] object-contain" />
         </div>
      </div>
    </section>
  );
}
