"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { handleImageUpload, createPreview } from "@/lib/upload";
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Upload, X } from "lucide-react";

export default function NewEventPage() {
    const router = useRouter();
    const role = "admin1";
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
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

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        setFormData({ ...formData, title, slug });
    };

    // Handle image file selection
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Mohon pilih file gambar');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file harus kurang dari 5MB');
            return;
        }

        setUploadingImage(true);

        try {
            // Create preview
            const preview = await createPreview(file);
            setPreviewImage(preview);

            // Upload file
            const imageUrl = await handleImageUpload(file, 'events-images', 'thumbnails');
            if (imageUrl) {
                setFormData({ ...formData, thumbnail_url: imageUrl });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Gagal mengupload gambar');
        } finally {
            setUploadingImage(false);
        }
    };

    // Remove image
    const removeImage = () => {
        setPreviewImage(null);
        setFormData({ ...formData, thumbnail_url: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase.from("events").insert([formData]);
            if (error) throw error;
            alert("Berhasil menambah acara!");
            router.push(`/admin/${role}/acara`);
        } catch (error) {
            console.error("Error creating event:", error);
            alert("Gagal menambah acara.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar role={role} />

            <main className="lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => router.push(`/admin/${role}/acara`)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tambah Acara Baru</h1>
                            <p className="text-gray-500">Isi form di bawah untuk menambah acara</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Main Info Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Informasi Acara</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Judul Acara *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        placeholder="Contoh: Kajian Rutin Kampus"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Slug (URL-friendly) *
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        placeholder="kajian-rutin-kampus"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Deskripsi Singkat
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        placeholder="Deskripsi singkat tentang acara..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Konten Lengkap
                                    </label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        placeholder="Konten lengkap tentang acara..."
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Thumbnail Acara
                                    </label>
                                    {previewImage ? (
                                        <div className="relative">
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-7 pb-6">
                                                {uploadingImage ? (
                                                    <Loader2 className="animate-spin text-sky-500 mb-3" size={32} />
                                                ) : (
                                                    <>
                                                        <Upload className="text-gray-400 mb-3" size={32} />
                                                        <p className="mb-2 text-sm text-gray-500">
                                                            <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                                                        </p>
                                                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max. 5MB)</p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Detail Acara</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tanggal Mulai *
                                    </label>
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tanggal Selesai *
                                    </label>
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Lokasi
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        placeholder="Contoh: Auditorium Utama"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Kuota Peserta
                                    </label>
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Status *
                                    </label>
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
                                    <label className="text-sm font-semibold text-gray-700">
                                        Pendaftaran Dibuka
                                    </label>
                                </div>

                                {formData.is_registration_open && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Link Pendaftaran
                                        </label>
                                        <input
                                            type="text"
                                            name="registration_link"
                                            value={formData.registration_link}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                            placeholder="https://forms.google.com/..."
                                        />
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nomor WhatsApp Narahubung
                                    </label>
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

                        {/* Submit Button */}
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
                                        Simpan Acara
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