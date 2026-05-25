"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Loader2 } from "lucide-react";

export default function EditEventPage() {
    const params = useParams();
    const router = useRouter();
    const role = "admin1";
    const eventId = params.id as string;
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        content: "",
        thumbnail_url: "",
        start_date: "",
        end_date: "",
        location: "",
        quota: 0,
        status: "upcoming" as "upcoming" | "ongoing" | "finished",
        is_registration_open: false,
        registration_link: "",
        contact_phone: "",
    });

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    const fetchEvent = async () => {
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", eventId)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    title: data.title || "",
                    slug: data.slug || "",
                    description: data.description || "",
                    content: data.content || "",
                    thumbnail_url: data.thumbnail_url || "",
                    start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : "",
                    end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : "",
                    location: data.location || "",
                    quota: data.quota || 0,
                    status: data.status || "upcoming",
                    is_registration_open: data.is_registration_open || false,
                    registration_link: data.registration_link || "",
                    contact_phone: data.contact_phone || "",
                });
            }
        } catch (error) {
            console.error("Error fetching event:", error);
            alert("Gagal memuat data acara.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
        } else if (type === "number") {
            setFormData({ ...formData, [name]: parseInt(value) || 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        setFormData({ ...formData, title, slug });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from("events")
                .update(formData)
                .eq("id", eventId);

            if (error) throw error;
            alert("Berhasil memperbarui acara!");
            router.push(`/admin/${role}/acara`);
        } catch (error) {
            console.error("Error updating event:", error);
            alert("Gagal memperbarui acara.");
        } finally {
            setSaving(false);
        }
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
            <AdminSidebar role={role as "admin1" | "admin2"} />

            <main className="ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => router.push(`/admin/${role}/acara`)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Acara</h1>
                            <p className="text-gray-500">Perbarui informasi acara</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Informasi Acara</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Acara *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Slug *</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Singkat</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Konten Lengkap</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">URL Thumbnail</label>
                                    <input
                                        type="text"
                                        name="thumbnail_url"
                                        value={formData.thumbnail_url}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                    {formData.thumbnail_url && (
                                        <img
                                            src={formData.thumbnail_url}
                                            alt="Preview"
                                            className="mt-4 w-full h-48 object-cover rounded-xl"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Detail Acara</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Mulai *</label>
                                    <input
                                        type="datetime-local"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Selesai *</label>
                                    <input
                                        type="datetime-local"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kuota Peserta</label>
                                    <input
                                        type="number"
                                        name="quota"
                                        value={formData.quota}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    >
                                        <option value="upcoming">Akan Datang</option>
                                        <option value="ongoing">Berlangsung</option>
                                        <option value="finished">Selesai</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="is_registration_open"
                                        checked={formData.is_registration_open}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-sky-500 rounded focus:ring-sky-500"
                                    />
                                    <label className="text-sm font-semibold text-gray-700">Pendaftaran Dibuka</label>
                                </div>

                                {formData.is_registration_open && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Link Pendaftaran</label>
                                        <input
                                            type="text"
                                            name="registration_link"
                                            value={formData.registration_link}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        />
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor WhatsApp Narahubung</label>
                                    <input
                                        type="tel"
                                        name="contact_phone"
                                        value={formData.contact_phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        placeholder="628123456789 (format: 628xxxxxxxxxx)"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Nomor ini akan ditampilkan di halaman detail acara untuk kontak via WhatsApp
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.push(`/admin/${role}/acara`)}
                                className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}