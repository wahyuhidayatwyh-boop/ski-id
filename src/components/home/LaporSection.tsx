import Link from "next/link";
import { MessageSquareWarning } from "lucide-react";

export default function LaporSection() {
  return (
    <section className="bg-[#0284c7] relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
         <img src="/elemen2.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-20 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Suarakan Aspirasimu untuk Layanan SKI yang <span className="text-[#bae6fd]">Lebih Baik!</span>
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-8">
              Sentral Kerohanian Islam kini menyediakan layanan aspirasi untuk menerima saran, masukan, dan pengaduan dari mahasiswa. Laporkan kendala terkait layanan kerohanian secara cepat dan mudah melalui platform resmi kami. Bersama kita wujudkan pelayanan yang lebih responsif dan transparan!
            </p>

            <div className="flex items-center gap-6">
              <Link 
                href="/lapor"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#0284c7] px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
              >
                <MessageSquareWarning size={18} />
                Ajukan Pengaduan
              </Link>
              
              <div className="hidden sm:flex items-center gap-2 text-white border-l border-white/20 pl-6">
                <span className="font-bold text-xl tracking-wider uppercase">LAPOR!</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-end relative h-[300px]">
            {/* Mockup of a large badge/logo on the right */}
            <div className="w-[350px] h-[350px] absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="absolute inset-0 border-[16px] border-[#1e293b] rounded-full"></div>
              <div className="w-[280px] h-[280px] bg-white rounded-full flex items-center justify-center p-8 shadow-2xl relative z-10">
                 <img src="/Logo%20SKI%20TEL-U%20P.png" alt="Logo SKI" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Background Ornament Right */}
      <div className="absolute right-0 top-0 bottom-0 w-[400px] opacity-30 pointer-events-none translate-x-1/4">
        <img src="/elemen1.png" alt="" className="w-full h-full object-contain" />
      </div>
    </section>
  );
}
