"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText } from "lucide-react";
import Link from "next/link";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Siapa saja yang boleh bergabung dengan kepengurusan SKI?",
      a: "Seluruh mahasiswa aktif beragama Islam di universitas dari berbagai jurusan dan fakultas dipersilakan untuk bergabung. Kami mengadakan Open Recruitment (Oprec) pada awal semester ganjil setiap tahunnya."
    },
    {
      q: "Apakah perlu memiliki kemampuan bahasa Arab atau hafalan Al-Qur'an?",
      a: "Tidak diwajibkan. SKI adalah tempat untuk belajar bersama. Yang terpenting adalah komitmen dan kemauan untuk berproses menjadi lebih baik, baik dalam pemahaman agama maupun kapasitas organisasi."
    },
    {
      q: "Bagaimana sistem pembagian divisi kerja di SKI?",
      a: "Pembagian divisi disesuaikan dengan minat dan bakat pendaftar. Terdapat berbagai divisi seperti Syiar (Kajian), Media (Desain/Video), Humas, Danus (Kewirausahaan), dan Kaderisasi."
    },
    {
      q: "Apakah kegiatan SKI mengganggu jadwal perkuliahan?",
      a: "Kami selalu menjunjung tinggi prinsip profesionalitas. Jadwal rapat dan kegiatan selalu disesuaikan agar di luar jam perkuliahan, karena kami percaya kewajiban akademik mahasiswa adalah prioritas utama."
    }
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-white relative -mt-6 rounded-t-[3rem] z-20">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* FAQ Text & Button */}
          <div className="lg:w-1/3">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Pertanyaan & Jawaban</h4>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] leading-tight mb-4">
              Pertanyaan Umum <span className="text-[#0ea5e9]">Seputar SKI</span>
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Di sini Anda dapat menemukan jawaban atas berbagai pertanyaan umum seputar program dan inisiatif kami dalam meningkatkan spiritual mahasiswa. Untuk pertanyaan lainnya, silakan hubungi kami.
            </p>
            
            <Link 
              href="/faq" 
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText size={18} className="text-gray-500" />
              Lihat Semua FAQ
            </Link>
          </div>

          {/* Accordion */}
          <div className="lg:w-2/3 flex flex-col">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`border-b border-gray-200 overflow-hidden transition-colors ${idx === 0 ? 'border-t' : ''}`}
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left py-5 flex items-center justify-between bg-white hover:text-[#0ea5e9] transition-colors group"
                >
                  <span className="font-medium text-[#1e293b] group-hover:text-[#0ea5e9] pr-4">{faq.q}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-gray-400 transition-transform duration-300 shrink-0 ${openIndex === idx ? 'rotate-180 text-[#0ea5e9]' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pb-5 text-gray-600 text-sm leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
