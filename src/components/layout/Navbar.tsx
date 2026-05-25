"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Profil SKI", href: "/profil" },
    { name: "Acara", href: "/acara" },
    { name: "Dokumentasi", href: "/dokumentasi" },
    { name: "Katalog Produk", href: "/katalog" },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/Logo%20SKI%20TEL-U%20P.png" alt="Logo SKI" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm md:text-base text-[#1e293b] leading-tight">
                SENTRAL KEROHANIAN ISLAM
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                Telkom University Purwokerto
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center h-full">
            <ul className="flex items-center gap-8 h-full">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.name} className="h-full flex items-center">
                    <Link
                      href={link.href}
                      className={`h-full flex items-center gap-1 text-[13px] font-semibold transition-colors relative ${
                        isActive ? "text-[#0ea5e9]" : "text-gray-500 hover:text-[#0f172a]"
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9] rounded-t-sm"></span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right Action */}
          <div className="hidden lg:flex items-center pl-6 border-l border-gray-200 h-8 ml-4">
            <Link
              href="/portal/login"
              className="text-[13px] font-semibold bg-[#0ea5e9] text-white px-5 py-2 rounded-full hover:bg-[#0284c7] transition-colors"
            >
              Portal Anggota
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-lg z-40 flex flex-col px-6 py-4 max-h-[calc(100vh-80px)] overflow-y-auto">
          <ul className="flex flex-col">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-3 border-b border-gray-50 text-sm font-semibold ${
                      isActive ? "text-[#0ea5e9]" : "text-gray-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex flex-col gap-3 pb-4">
            <Link
              href="/portal/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center font-semibold bg-[#0ea5e9] text-white py-2.5 rounded-full text-sm"
            >
              Portal Anggota
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
