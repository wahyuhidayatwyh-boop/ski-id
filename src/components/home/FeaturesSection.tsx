"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, Image as ImageIcon, BookText, Award, ShoppingBag, UserPlus, ArrowRight } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Program Kerja & Event",
      desc: "Informasi lengkap mengenai kajian, seminar, MABIT, dan event besar lainnya.",
      icon: CalendarDays,
      link: "/event",
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "Galeri Dokumentasi",
      desc: "Momen berharga dalam bentuk foto dan video aftermovie kegiatan SKI.",
      icon: ImageIcon,
      link: "/gallery",
      color: "from-purple-400 to-purple-600",
    },
    {
      title: "Berita & Artikel",
      desc: "Tulisan inspiratif, opini mahasiswa, dan berita terbaru seputar dakwah kampus.",
      icon: BookText,
      link: "/artikel",
      color: "from-emerald-400 to-emerald-600",
    },
    {
      title: "Prestasi Organisasi",
      desc: "Jejak langkah kebanggaan dan pencapaian kader SKI di berbagai bidang.",
      icon: Award,
      link: "/prestasi",
      color: "from-yellow-400 to-orange-500",
    },
    {
      title: "Marketplace SKI",
      desc: "Merchandise resmi, buku islami, dan produk kreatif danusan organisasi.",
      icon: ShoppingBag,
      link: "/marketplace",
      color: "from-pink-400 to-rose-500",
    },
    {
      title: "Open Recruitment",
      desc: "Bergabung bersama kami menjadi bagian dari penggerak kebaikan di kampus.",
      icon: UserPlus,
      link: "/oprec",
      color: "from-primary to-brand-600",
    }
  ];

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-24 bg-brand-50 dark:bg-brand-950">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-brand-900 dark:text-white mb-4">
              Eksplorasi Kegiatan Kami
            </h2>
            <p className="text-brand-900/70 dark:text-brand-100/70 text-lg">
              Temukan berbagai sarana pengembangan diri dan informasi terbaru seputar aktivitas dakwah di kampus.
            </p>
          </motion.div>
        </div>

        <motion.div 
          variants={containerVars}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feat, idx) => (
            <motion.div key={idx} variants={itemVars}>
              <Link href={feat.link} className="block h-full group">
                <div className="bg-white dark:bg-brand-900 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-100 dark:border-brand-800 h-full flex flex-col relative overflow-hidden">
                  
                  {/* Hover Background Effect */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-20 group-hover:scale-150 transition-all duration-500`}></div>
                  
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center mb-6 shadow-md`}>
                    <feat.icon size={28} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-brand-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                    {feat.title}
                  </h3>
                  
                  <p className="text-brand-900/60 dark:text-brand-100/60 leading-relaxed mb-6 flex-grow">
                    {feat.desc}
                  </p>
                  
                  <div className="flex items-center text-primary font-semibold text-sm mt-auto">
                    Jelajahi <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
