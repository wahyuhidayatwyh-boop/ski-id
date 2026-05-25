"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    Calendar,
    Plus,
    Edit,
    Trash2,
    Search,
    Loader2,
    Eye,
    MapPin,
    Users,
} from "lucide-react";

interface Event {
    id?: string;
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
    created_at?: string;
}

export default function Admin1Acara() {
    const router = useRouter();
    const role = "admin1";
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus acara ini?")) return;

        try {
            const { error } = await supabase.from("events").delete().eq("id", id);
            if (error) throw error;
            setEvents(events.filter((e) => e.id !== id));
            alert("Berhasil menghapus acara!");
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Gagal menghapus acara.");
        }
    };

    const filteredEvents = events.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "upcoming":
                return "bg-blue-100 text-blue-700";
            case "ongoing":
                return "bg-green-100 text-green-700";
            case "finished":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "upcoming":
                return "Akan Datang";
            case "ongoing":
                return "Berlangsung";
            case "finished":
                return "Selesai";
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                    <p className="text-gray-500">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar role={role} />

            <main className="lg:ml-64 p-4 md:p-5 lg:p-6 pt-16 lg:pt-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Kelola Acara</h1>
                        <p className="text-gray-500 text-sm">
                            {filteredEvents.length} dari {events.length} acara
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/admin/${role}/acara/new`)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm md:text-base"
                    >
                        <Plus size={18} />
                        Tambah Acara
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari acara..."
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                        />
                    </div>
                </div>

                {/* Events Grid - Instagram Feed Style Cards */}
                {filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                whileHover={{ y: -4 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group"
                            >
                                {/* Poster Image - 4:5 Aspect Ratio (Instagram Feed Style) */}
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    {event.thumbnail_url ? (
                                        <img
                                            src={event.thumbnail_url}
                                            alt={event.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                            <Calendar size={48} className="text-gray-400" />
                                        </div>
                                    )}
                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusBadge(
                                                event.status
                                            )}`}
                                        >
                                            {getStatusText(event.status)}
                                        </span>
                                    </div>
                                    {/* Registration Badge */}
                                    {event.is_registration_open && (
                                        <div className="absolute top-3 left-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-sm flex items-center gap-1">
                                                <Users size={12} />
                                                Terbuka
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm" title={event.title}>
                                        {event.title}
                                    </h3>

                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                                            <span className="truncate">
                                                {formatDate(event.start_date)} - {formatDate(event.end_date)}
                                            </span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => router.push(`/admin/${role}/acara/${event.id}/edit`)}
                                            className="flex-1 flex items-center justify-center gap-1.5 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium"
                                            title="Edit"
                                        >
                                            <Edit size={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => router.push(`/acara/${event.id}`)}
                                            className="flex-1 flex items-center justify-center gap-1.5 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-xs font-medium"
                                            title="Lihat"
                                        >
                                            <Eye size={14} />
                                            Lihat
                                        </button>
                                        <button
                                            onClick={() => handleDelete(event.id!)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Calendar size={36} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {events.length === 0
                                ? "Belum ada acara"
                                : "Tidak ada acara ditemukan"}
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {events.length === 0
                                ? "Mulai tambahkan acara baru untuk kegiatan SKI"
                                : "Coba ubah kata kunci pencarian"}
                        </p>
                        {events.length === 0 && (
                            <button
                                onClick={() => router.push(`/admin/${role}/acara/new`)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                <Plus size={20} />
                                Tambah Acara Pertama
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}