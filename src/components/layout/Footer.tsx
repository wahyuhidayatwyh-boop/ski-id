import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <>
      <footer className="bg-white border-t border-gray-100 pt-16 pb-12">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">

            {/* Logo Section */}
            <div className="lg:col-span-2 flex items-start gap-4">
              <div className="w-16 h-16 shrink-0">
                <img src="/Logo%20SKI%20TEL-U%20P.png" alt="Logo SKI" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col mt-2">
                <h3 className="font-bold text-lg md:text-xl text-[#0f172a] leading-tight">
                  SENTRAL <br /> KEROHANIAN <br /> ISLAM
                </h3>
              </div>
            </div>

            {/* Navigasi */}
            <div>
              <h4 className="font-bold text-[#0f172a] mb-6">Navigasi</h4>
              <ul className="flex flex-col gap-4 text-[13px] text-gray-600 font-medium">
                <li><Link href="/" className="hover:text-[#0ea5e9]">Beranda</Link></li>
                <li><Link href="/profil" className="hover:text-[#0ea5e9]">Profil SKI</Link></li>
                <li><Link href="/acara" className="hover:text-[#0ea5e9]">Acara</Link></li>
                <li><Link href="/dokumentasi" className="hover:text-[#0ea5e9]">Dokumentasi</Link></li>
                <li><Link href="/katalog" className="hover:text-[#0ea5e9]">Katalog Produk</Link></li>
              </ul>
            </div>

            {/* Profil */}
            <div>
              <h4 className="font-bold text-[#0f172a] mb-6">Profil SKI</h4>
              <ul className="flex flex-col gap-4 text-[13px] text-gray-600 font-medium">
                <li><Link href="/profil" className="hover:text-[#0ea5e9]">Pengurus SKI</Link></li>
                <li><Link href="/profil" className="hover:text-[#0ea5e9]">Visi Misi</Link></li>
                <li><Link href="/profil" className="hover:text-[#0ea5e9]">Arti Logo</Link></li>
              </ul>
            </div>

            {/* Gabung & Hubungi Kami */}
            <div>
              <div className="mb-8">
                <h4 className="font-bold text-[#0f172a] mb-6">Gabung</h4>
                <ul className="flex flex-col gap-4 text-[13px] text-gray-600 font-medium">
                  <li><Link href="/portal/login" className="hover:text-[#0ea5e9]">Portal Anggota</Link></li>
                  <li><Link href="/admin/login" className="hover:text-[#0ea5e9]">Admin Dashboard</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#0f172a] mb-6">Hubungi Kami</h4>
                <ul className="flex flex-col gap-4 text-[13px] text-gray-600 font-medium">
                  <li><Link href="/bantuan" className="hover:text-[#0ea5e9]">Bantuan</Link></li>
                  <li><Link href="/alamat" className="hover:text-[#0ea5e9]">Alamat</Link></li>
                  <li><Link href="/faq" className="hover:text-[#0ea5e9]">FAQ</Link></li>
                </ul>
              </div>
            </div>

            {/* Media Sosial & Kontak */}
            <div>
              <div className="mb-8">
                <h4 className="font-bold text-[#0f172a] mb-6">Media Sosial</h4>
                <div className="flex gap-4">
                  <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-500 cursor-pointer hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors">
                    <span className="text-xs">f</span>
                  </div>
                  <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-500 cursor-pointer hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors">
                    <span className="text-xs">ig</span>
                  </div>
                  <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-500 cursor-pointer hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors">
                    <span className="text-xs">x</span>
                  </div>
                  <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-500 cursor-pointer hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors">
                    <span className="text-xs">tk</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#0f172a] mb-6">Gabung</h4>
                <ul className="flex flex-col gap-4 text-[13px] text-gray-600 font-medium">
                  <li><Link href="/portal/login" className="hover:text-[#0ea5e9]">Portal Anggota</Link></li>
                  <li><Link href="/admin/login" className="hover:text-[#0ea5e9]">Admin Dashboard</Link></li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        <button className="bg-[#0ea5e9] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg hover:bg-[#0284c7] transition-colors">
          Butuh Bantuan? <span>✕</span>
        </button>
        <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
          {/* WhatsApp Icon placeholder */}
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
        </button>
      </div>
    </>
  );
}