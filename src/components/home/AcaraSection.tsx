"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Event {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  start_date: string;
  status: "upcoming" | "ongoing" | "finished";
  location: string;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-sky-50 text-sky-600 border-sky-200",
  ongoing: "bg-emerald-50 text-emerald-600 border-emerald-200",
  finished: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Akan Datang",
  ongoing: "Berlangsung",
  finished: "Selesai",
};

export default function AcaraSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // First, fetch upcoming and ongoing events
      const { data: activeEvents, error: activeError } = await supabase
        .from("events")
        .select("id, title, description, thumbnail_url, start_date, status, location")
        .in("status", ["upcoming", "ongoing"])
        .order("start_date", { ascending: false });

      if (activeError) throw activeError;

      // If we have less than 4, fetch finished events to fill the gap
      if (activeEvents && activeEvents.length < 4) {
        const remainingSlots = 4 - activeEvents.length;
        const { data: finishedEvents, error: finishedError } = await supabase
          .from("events")
          .select("id, title, description, thumbnail_url, start_date, status, location")
          .eq("status", "finished")
          .order("start_date", { ascending: false })
          .limit(remainingSlots);

        if (finishedError) throw finishedError;

        // Combine active and finished events
        const allEvents = [...(activeEvents || []), ...(finishedEvents || [])];
        setEvents(allEvents);
      } else {
        setEvents(activeEvents || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = events.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      <section className="bg-[#f8fafc] py-16 border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 flex justify-center py-16">
          <Loader2 className="animate-spin text-[#0ea5e9]" size={40} />
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  return (
    <section className="bg-[#f8fafc] py-16 border-y border-gray-100">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">

        {/* Section Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0ea5e9] mb-2 block">Agenda Kegiatan</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b]">Acara & Program SKI</h2>
          </div>
          <Link
            href="/acara"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0ea5e9] text-white rounded-xl text-sm font-semibold hover:bg-[#0284c7] transition-colors group shadow-sm"
          >
            Lihat Semua <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Events Grid - 4 columns to show 8 events (2 rows) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5 mb-10">
          {paginatedEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/acara/${event.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-[#0ea5e9]/30 transition-all duration-300 flex flex-col h-full group"
              >
                {/* Image - 4:3 aspect ratio */}
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
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border shadow-sm ${STATUS_COLORS[event.status] ?? "bg-white text-gray-700 border-gray-200"}`}>
                      {STATUS_LABELS[event.status]}
                    </span>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-2">
                    <Calendar size={12} className="text-[#0ea5e9]" />
                    <span>{formatDate(event.start_date)}</span>
                  </div>

                  <h3 className="font-bold text-[#1e293b] text-sm leading-snug group-hover:text-[#0ea5e9] transition-colors mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-500 text-xs leading-relaxed flex-grow line-clamp-2">
                    {event.description}
                  </p>

                  <div className="pt-2 border-t border-gray-50 mt-3 flex items-center justify-between">
                    <span className="text-xs text-[#0ea5e9] font-bold flex items-center gap-0.5 group-hover:gap-1 transition-all">
                      Lihat Detail <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
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
    </section>
  );
}