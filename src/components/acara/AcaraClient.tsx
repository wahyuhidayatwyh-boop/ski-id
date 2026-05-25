"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Search, ArrowRight, LayoutGrid, ChevronLeft, ChevronRight, Loader2, MapPin, Users } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail_url: string;
  start_date: string;
  end_date: string;
  location: string;
  quota: number;
  status: "upcoming" | "ongoing" | "finished";
  is_registration_open: boolean;
  registration_link: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-sky-50 text-sky-600 border-sky-200",
  ongoing: "bg-emerald-50 text-emerald-600 border-emerald-200",
  finished: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Akan Datang",
  ongoing: "Sedang Berlangsung",
  finished: "Selesai",
};

export default function AcaraClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const statuses = ["Semua", "upcoming", "ongoing", "finished"];

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const filteredEvents = events.filter((event) => {
    const matchesStatus = statusFilter === "Semua" || event.status === statusFilter;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

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
          <p className="text-gray-500 font-medium">Memuat data acara...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1e293b] mb-4">
            Acara & Kegiatan SKI
          </h1>
          <p className="text-gray-600 text-lg">
            Ikuti berbagai keseruan acara dan program kerja bermanfaat yang diselenggarakan oleh Sentral Kerohanian Islam.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center mb-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full lg:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Cari acara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-[#1e293b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === status
                  ? "bg-[#0ea5e9] text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {status === "Semua" ? "Semua" : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          <AnimatePresence mode="popLayout">
            {paginatedEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/acara/${event.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 group flex flex-col h-full hover:border-[#0ea5e9]/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    {event.thumbnail_url ? (
                      <img
                        src={event.thumbnail_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                        <Calendar className="text-[#0ea5e9]" size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border ${STATUS_COLORS[event.status] ?? "bg-white text-gray-700 border-gray-200"}`}>
                        {STATUS_LABELS[event.status]}
                      </span>
                    </div>
                    {event.is_registration_open && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        Buka Pendaftaran
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400 text-xs mb-2 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#0ea5e9]" />
                        {formatDate(event.start_date)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#0ea5e9]" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-[#1e293b] leading-snug group-hover:text-[#0ea5e9] transition-colors mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-grow line-clamp-2">
                      {event.description}
                    </p>

                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center mt-auto">
                      {event.quota > 0 && (
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                          <Users size={12} /> Kuota: {event.quota}
                        </span>
                      )}
                      <span className="text-xs font-bold text-[#0ea5e9] flex items-center gap-1 group-hover:translate-x-1 transition-transform ml-auto">
                        Detail <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <LayoutGrid className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-[#1e293b] mb-1">
              {events.length === 0 ? "Belum Ada Acara" : "Acara Tidak Ditemukan"}
            </h3>
            <p className="text-gray-500 text-sm">
              {events.length === 0
                ? "Belum ada acara yang ditambahkan. Pantau terus ya!"
                : "Tidak ada acara yang cocok dengan pencarian Anda."}
            </p>
          </motion.div>
        )}

        {/* Pagination Bar */}
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
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${currentPage === page
                  ? "bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/20"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
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

      </div>
    </div>
  );
}
