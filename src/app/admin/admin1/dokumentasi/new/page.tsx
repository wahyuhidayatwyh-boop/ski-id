"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { handleImageUpload, createPreview } from "@/lib/upload";
import { Save, ArrowLeft, Loader2, Upload, X } from "lucide-react";

export default function NewDokumentasiPage() {
    const router = useRouter();
    const role = "admin1";
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image_url: "",
        type: "photo" as "photo" | "video",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle image file selection
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type - support JPEG, PNG, and WebP
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Ukuran file harus kurang dari 10MB');
            return;
        }

        setUploadingImage(true);

        try {
            // Create preview
            const preview = await createPreview(file);
            setPreviewImage(preview);

            // Upload file
            const imageUrl = await handleImageUpload(file, 'galleries-images', 'thumbnails');
            if (imageUrl) {
                setFormData({ ...formData, image_url: imageUrl });
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
        setFormData({ ...formData, image_url: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                image_url: formData.image_url,
                type: formData.type,
            };

            const { data, error } = await supabase
                .from("galleries")
                .insert([payload])
                .select();

            if (error) {
                console.error("Supabase error:", JSON.stringify(error, null, 2));
                throw new Error(`${error.code}: ${error.message} — ${error.details || ""}`);
            }

            alert("Berhasil menambah dokumentasi!");
            router.push(`/admin/${role}/dokumentasi`);
        } catch (error: any) {
            console.error("Error creating gallery:", error);
            alert(`Gagal: ${error?.message || "Periksa koneksi dan pastikan tabel galleries sudah dibuat via migration.sql"}`);
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
                            onClick={() => router.push(`/admin/${role}/dokumentasi`)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tambah Dokumentasi</h1>
                            <p className="text-gray-500">Isi form di bawah untuk menambah dokumentasi</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Informasi Dokumentasi</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Judul *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        placeholder="Contoh: Kajian Akbar 2024"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        placeholder="Deskripsi dokumentasi..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tipe *
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    >
                                        <option value="photo">📷 Foto</option>
                                        <option value="video">🎥 Video</option>
                                    </select>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Gambar / Thumbnail *
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
                                                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max. 10MB)</p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.push(`/admin/${role}/dokumentasi`)}
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
                                    <><Loader2 className="animate-spin" size={20} />Menyimpan...</>
                                ) : (
                                    <><Save size={20} />Simpan Dokumentasi</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}