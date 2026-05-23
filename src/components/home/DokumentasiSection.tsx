"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, ArrowRight, Image as ImageIcon, Tag, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Gallery {
  id: string;
  title: string;
  description: string;
  image_url: string;
  type: "photo" | "video";
  created_at: string;
}

export default function DokumentasiSection() {
  const [documentations, setDocumentations] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentations();
  }, []);

  const fetchDocumentations = async () => {
    try {
      const { data, error } = await supabase
        .from("galleries")
        .select("id, title, description, image_url, type, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setDocumentations(data || []);
    } catch (error) {
      console.error("Error fetching documentations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="py-20 bg-white relative border-b border-gray-100">
        <div className="container mx-auto px-4 flex justify-center py-16">
          <Loader2 className="animate-spin text-[#0ea5e9]" size={40} />
        </div>
      </section>
    );
  }

  if (documentations.length === 0) return null;

  return (
    <section className="py-20 bg-white relative border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0ea5e9] mb-2 block">Kilas Balik Momen</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] leading-tight">
              Galeri Dokumentasi SKI
            </h2>
          </div>
          <Link
            href="/dokumentasi"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-[#0ea5e9] rounded-xl text-sm font-semibold hover:border-[#0ea5e9]/30 transition-all group shadow-sm"
          >
            Lihat Semua Galeri <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {documentations.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 hover:border-[#0ea5e9]/30 group flex flex-col h-full transition-all duration-300">
                {/* Photo container */}
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  {doc.image_url ? (
                    <img
                      src={doc.image_url}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-icon w-full h-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center';
                          fallback.innerHTML = `<svg class="text-[#0ea5e9]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                      <ImageIcon className="text-[#0ea5e9]" size={48} />
                    </div>
                  )}
                  {/* Type badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl shadow-sm border border-gray-100">
                    <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wider flex items-center gap-1">
                      <Tag size={12} />
                      {doc.type === "photo" ? "Foto" : "Video"}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-3 font-semibold">
                    <Calendar size={14} className="text-[#0ea5e9]" />
                    <span>{formatDate(doc.created_at)}</span>
                  </div>

                  <h3 className="font-extrabold text-base sm:text-lg text-[#1e293b] leading-snug group-hover:text-[#0ea5e9] transition-colors mb-3 line-clamp-2">
                    {doc.title}
                  </h3>

                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
                    {doc.description}
                  </p>

                  <a
                    href={doc.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#0ea5e9] flex items-center gap-1 mt-auto pt-3 border-t border-gray-50 hover:translate-x-1 transition-transform"
                  >
                    Buka {doc.type === "photo" ? "Foto" : "Video"} <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
