"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, LayoutGrid, ArrowRight, Image as ImageIcon, Tag, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Gallery {
  id: string;
  title: string;
  description: string;
  event_id: string;
  image_url: string;
  type: "photo" | "video";
  created_at: string;
}

export default function DokumentasiClient() {
  const [documentations, setDocumentations] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchDocumentations();
  }, []);

  const fetchDocumentations = async () => {
    try {
      const { data, error } = await supabase
        .from("galleries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocumentations(data || []);
    } catch (error) {
      console.error("Error fetching documentations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter]);

  const filteredDocs = documentations.filter((doc) => {
    const matchesType = typeFilter === "Semua" || doc.type === typeFilter;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = filteredDocs.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-[#0ea5e9]" size={48} />
          <p className="text-gray-500 font-medium">Memuat dokumentasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1e293b] mb-4">Dokumentasi Kegiatan SKI</h1>
          <p className="text-gray-600 text-lg">Kumpulan momen, arsip foto, dan dokumentasi keseruan program kerja Sentral Kerohanian Islam.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-12 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Cari dokumentasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-[#1e293b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] text-sm"
            />
          </div>
          <div className="flex gap-2">
            {["Semua", "photo", "video"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  typeFilter === type ? "bg-[#0ea5e9] text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {type === "Semua" ? "Semua" : type === "photo" ? "📷 Foto" : "🎥 Video"}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {paginatedDocs.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 group flex flex-col h-full hover:border-[#0ea5e9]/30 transition-all duration-300">
                  {/* Image - aspect-video landscape */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                    {doc.image_url ? (
                      <img src={doc.image_url} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                        <ImageIcon className="text-[#0ea5e9]" size={48} />
                      </div>
                    )}
                    {/* Type badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl shadow-sm border border-gray-100">
                      <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wider flex items-center gap-1">
                        <Tag size={12} /> {doc.type === "photo" ? "Foto" : "Video"}
                      </span>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-3 font-semibold">
                      <Calendar size={14} className="text-[#0ea5e9]" />
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                    <h3 className="font-extrabold text-lg text-[#1e293b] leading-snug group-hover:text-[#0ea5e9] transition-colors mb-3 line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                      {doc.description}
                    </p>
                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center mt-auto">
                      <span className="text-xs text-gray-400 font-medium">Dokumentasi SKI</span>
                      <a
                        href={doc.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#0ea5e9] flex items-center gap-1 hover:translate-x-1 transition-transform"
                      >
                        Lihat {doc.type === "photo" ? "Foto" : "Video"} <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                  currentPage === page ? "bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/20" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Empty state */}
        {filteredDocs.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <LayoutGrid className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-[#1e293b] mb-1">
              {documentations.length === 0 ? "Belum Ada Dokumentasi" : "Tidak ada dokumentasi"}
            </h3>
            <p className="text-gray-500 text-sm">
              {documentations.length === 0 ? "Belum ada dokumentasi yang diunggah." : "Tidak ada arsip yang cocok dengan pencarian Anda."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
