"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    Image,
    Plus,
    Edit,
    Trash2,
    Search,
    Loader2,
    Eye,
    Video,
    Calendar,
} from "lucide-react";

interface Gallery {
    id?: string;
    title: string;
    description: string;
    event_id: string;
    image_url: string;
    type: "photo" | "video";
    created_at?: string;
}

export default function Admin1Dokumentasi() {
    const router = useRouter();
    const role = "admin1";
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchGalleries();
    }, []);

    const fetchGalleries = async () => {
        try {
            const { data, error } = await supabase
                .from("galleries")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setGalleries(data || []);
        } catch (error) {
            console.error("Error fetching galleries:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus dokumentasi ini?")) return;

        try {
            const { error } = await supabase.from("galleries").delete().eq("id", id);
            if (error) throw error;
            setGalleries(galleries.filter((g) => g.id !== id));
            alert("Berhasil menghapus dokumentasi!");
        } catch (error) {
            console.error("Error deleting gallery:", error);
            alert("Gagal menghapus dokumentasi.");
        }
    };

    const filteredGalleries = galleries.filter((gallery) =>
        gallery.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Dokumentasi</h1>
                        <p className="text-gray-500">Kelola foto dan video kegiatan SKI</p>
                    </div>
                    <button
                        onClick={() => router.push(`/admin/${role}/dokumentasi/new`)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <Plus size={20} />
                        Tambah Dokumentasi
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari dokumentasi..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGalleries.map((gallery) => (
                        <motion.div
                            key={gallery.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video">
                                <img
                                    src={gallery.image_url}
                                    alt={gallery.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${gallery.type === "photo"
                                            ? "bg-blue-500 text-white"
                                            : "bg-red-500 text-white"
                                            }`}
                                    >
                                        {gallery.type === "photo" ? (
                                            <span className="flex items-center gap-1">
                                                <Image size={12} /> Foto
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Video size={12} /> Video
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{gallery.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {gallery.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Calendar size={14} />
                                        {gallery.created_at
                                            ? new Date(gallery.created_at).toLocaleDateString("id-ID")
                                            : "-"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => router.push(`/admin/${role}/dokumentasi/${gallery.id}/edit`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => window.open(gallery.image_url, "_blank")}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Lihat"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(gallery.id!)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredGalleries.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <Image size={64} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada dokumentasi</h3>
                        <p className="text-gray-500 mb-6">Mulai tambahkan foto dan video kegiatan SKI</p>
                        <button
                            onClick={() => router.push(`/admin/${role}/dokumentasi/new`)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            <Plus size={20} />
                            Tambah Dokumentasi Pertama
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}