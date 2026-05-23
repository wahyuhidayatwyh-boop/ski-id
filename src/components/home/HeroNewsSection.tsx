"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroNewsSection() {
  const mainNews = {
    title: "Sinergi Dakwah Membangun Peradaban Kampus, SKI Sukses Gelar Tabligh Akbar",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
  };

  const sideNews = [
    {
      title: "Pelantikan Pimpinan Tinggi Pratama SKI",
      date: "18 Mei 2026",
      tag: "SKI",
      image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=200&auto=format&fit=crop",
    },
    {
      title: "\"Kalau Bahannya Aman, Bukan Hanya Senang Tapi Juga Tenang\"",
      date: "17 Mei 2026",
      tag: "SKI",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=200&auto=format&fit=crop",
    },
    {
      title: "Dari Kebun Sederhana ke Dapur Umum: Harapan Tumbuh di Tangan Pak Nardi",
      date: "17 Mei 2026",
      tag: "SKI",
      image: "https://images.unsplash.com/photo-1517048676732-d65af93c5f20?q=80&w=200&auto=format&fit=crop",
    },
    {
      title: "Benih, Tumbuh, dan Harapan: Ada Tangan-Tangan Kecil di Balik Seporsi...",
      date: "17 Mei 2026",
      tag: "SKI",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop",
    },
  ];

  const bottomNews = [
    {
      title: "SKI Jadi Investasi Jangka Panjang Pemerintah untuk SDM Indonesia",
      source: "dpr.co.id",
      date: "20 Mei 2026",
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "Prabowo: Program SKI Akan Diteruskan, Tak Boleh Ada...",
      source: "KOMPAS",
      date: "16 Mei 2026",
      image: "https://images.unsplash.com/photo-1593113580332-628dd5098198?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "Program Bakti Sosial Gratis: Bukan Sekedar Kebijakan",
      source: "TribunNews",
      date: "12 Mei 2026",
      image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=600&auto=format&fit=crop",
    },
  ];

  return (
    <section className="bg-slate-50 py-10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Top Split Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Main Hero News */}
          <div className="lg:col-span-8 relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group cursor-pointer shadow-md">
            <img 
              src={mainNews.image} 
              alt="Main News" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {mainNews.title}
              </h2>
              {/* Fake carousel indicators */}
              <div className="flex gap-2 mt-4">
                <div className="h-1.5 w-10 bg-white/40 rounded-full overflow-hidden">
                   <div className="h-full w-1/2 bg-[#0ea5e9]"></div>
                </div>
                <div className="h-1.5 w-10 bg-white/40 rounded-full"></div>
                <div className="h-1.5 w-10 bg-white/40 rounded-full"></div>
                <div className="h-1.5 w-10 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Side News List */}
          <div className="lg:col-span-4 flex flex-col">
            <h3 className="text-2xl font-bold text-[#0f172a] mb-6">Berita SKI</h3>
            <div className="flex flex-col gap-6">
              {sideNews.map((news, idx) => (
                <div key={idx} className="flex gap-4 group cursor-pointer">
                  <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden shadow-sm">
                    <img 
                      src={news.image} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-[#0f172a] text-sm leading-snug group-hover:text-[#0ea5e9] transition-colors line-clamp-3">
                      {news.title}
                    </h4>
                    <p className="text-xs text-[#0ea5e9] mt-2 font-medium flex items-center gap-1">
                      {news.tag} <span className="text-gray-400 font-normal ml-1">• {news.date}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Area */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-[#0f172a]">Berita Nasional</h3>
            <Link href="/berita" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <span className="flex items-center justify-center w-4 h-4 text-gray-500 border border-gray-400 rounded-sm leading-none text-[10px]">📰</span> 
              Lihat Cerita Kami
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bottomNews.map((news, idx) => (
              <div key={idx} className="relative h-48 md:h-56 rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
                <img 
                  src={news.image} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-bold leading-snug text-sm md:text-base">
                    {news.title}
                  </h4>
                  <p className="text-gray-300 text-xs mt-1">
                    {news.source} • {news.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
