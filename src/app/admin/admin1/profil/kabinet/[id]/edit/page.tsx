"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/upload";
import { Save, ArrowLeft, Loader2, Plus, X, Upload, Image } from "lucide-react";

export default function EditKabinetPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const role = "admin1";
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingStructure, setUploadingStructure] = useState(false);
    const [uploadingHero, setUploadingHero] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const structureInputRef = useRef<HTMLInputElement>(null);
    const heroInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({
        name: "", period: "", logo_url: "", tagline: "",
        description: "", visi: "", structure_image_url: "", hero_image_url: "", is_active: false,
    });
    const [misiList, setMisiList] = useState<string[]>([""]);

    useEffect(() => {
        supabase.from("kabinets").select("*").eq("id", id).single().then(({ data }) => {
            if (data) {
                setForm({
                    name: data.name || "",
                    period: data.period || "",
                    logo_url: data.logo_url || "",
                    tagline: data.tagline || "",
                    description: data.description || "",
                    visi: data.visi || "",
                    structure_image_url: data.structure_image_url || "",
                    hero_image_url: data.hero_image_url || "",
                    is_active: data.is_active || false,
                });
                setMisiList(Array.isArray(data.misi) && data.misi.length > 0 ? data.misi : [""]);
            }
            setLoading(false);
        });
    }, [id]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Pilih file gambar (PNG, JPG, SVG)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB');
            return;
        }

        setUploadingLogo(true);
        try {
            const url = await uploadFile(file, 'kabinet-logos', 'logos');
            if (url) {
                setForm({ ...form, logo_url: url });
                alert('Logo berhasil diupload!');
            } else {
                alert('Gagal upload logo');
            }
        } catch (err) {
            alert('Error: ' + err);
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Pilih file gambar (PNG, JPG)');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Ukuran file maksimal 10MB');
            return;
        }

        setUploadingHero(true);
        try {
            const url = await uploadFile(file, 'kabinet-logos', 'heroes');
            if (url) {
                setForm({ ...form, hero_image_url: url });
                alert('Hero image berhasil diupload!');
            } else {
                alert('Gagal upload hero image');
            }
        } catch (err) {
            alert('Error: ' + err);
        } finally {
            setUploadingHero(false);
        }
    };

    const handleStructureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Pilih file gambar (PNG, JPG)');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Ukuran file maksimal 10MB');
            return;
        }

        setUploadingStructure(true);
        try {
            const url = await uploadFile(file, 'kabinet-logos', 'structure');
            if (url) {
                setForm({ ...form, structure_image_url: url });
                alert('Gambar struktur berhasil diupload!');
            } else {
                alert('Gagal upload gambar struktur');
            }
        } catch (err) {
            alert('Error: ' + err);
        } finally {
            setUploadingStructure(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (form.is_active) {
                await supabase.from("kabinets").update({ is_active: false }).neq("id", id);
            }
            const { error } = await supabase.from("kabinets").update({
                ...form,
                misi: misiList.filter(m => m.trim() !== ""),
            }).eq("id", id);
            if (error) throw error;
            alert("Berhasil memperbarui kabinet!");
            router.push(`/admin/${role}/profil`);
        } catch (err: any) {
            alert("Gagal: " + (err?.message || err));
        } finally { setSaving(false); }
    };

    const ic = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white";
    const lc = "block text-sm font-semibold text-gray-700 mb-2";

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-sky-500" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar role={role} />
            <main className="ml-64 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => router.push(`/admin/${role}/profil`)} className="p-2 hover:bg-gray-100 rounded-xl">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Edit Kabinet</h1>
                            <p className="text-gray-500 text-sm mt-0.5">Perbarui data kabinet SKI</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <h2 className="text-lg font-bold text-gray-800">Informasi Kabinet</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lc}>Nama Kabinet *</label>
                                    <input type="text" required className={ic} value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className={lc}>Periode *</label>
                                    <input type="text" required className={ic} placeholder="2025 / 2026" value={form.period}
                                        onChange={e => setForm({ ...form, period: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className={lc}>Tagline / Motto</label>
                                <input type="text" className={ic} value={form.tagline}
                                    onChange={e => setForm({ ...form, tagline: e.target.value })} />
                            </div>
                            <div>
                                <label className={lc}>Deskripsi Kabinet</label>
                                <textarea rows={3} className={ic} value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div>
                                <label className={lc}>Visi Kabinet</label>
                                <textarea rows={2} className={ic} value={form.visi}
                                    onChange={e => setForm({ ...form, visi: e.target.value })} />
                            </div>

                            {/* Misi */}
                            <div>
                                <label className={lc}>Misi Kabinet</label>
                                <div className="space-y-2">
                                    {misiList.map((m, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input type="text" className={ic} placeholder={`Misi ke-${idx + 1}`}
                                                value={m} onChange={e => {
                                                    const updated = [...misiList];
                                                    updated[idx] = e.target.value;
                                                    setMisiList(updated);
                                                }} />
                                            <button type="button" onClick={() => setMisiList(misiList.filter((_, i) => i !== idx))}
                                                className="p-3 text-red-400 hover:bg-red-50 rounded-xl">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setMisiList([...misiList, ""])}
                                        className="flex items-center gap-2 text-sm text-sky-600 font-semibold hover:text-sky-700">
                                        <Plus size={16} /> Tambah Misi
                                    </button>
                                </div>
                            </div>

                            {/* Hero Image Upload */}
                            <div>
                                <label className={lc}>Hero Image / Banner</label>
                                <div className="flex gap-2 items-start">
                                    <input type="file" accept="image/*" ref={heroInputRef} onChange={handleHeroUpload}
                                        className="hidden" disabled={uploadingHero} />
                                    <button type="button" onClick={() => heroInputRef.current?.click()}
                                        disabled={uploadingHero}
                                        className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                                        {uploadingHero ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                        {uploadingHero ? "Uploading..." : "Upload Hero Image"}
                                    </button>
                                </div>
                                <input type="text" className={`${ic} mt-2`} placeholder="Atau masukkan URL hero image..." value={form.hero_image_url}
                                    onChange={e => setForm({ ...form, hero_image_url: e.target.value })} />
                                {form.hero_image_url && (
                                    <div className="mt-2">
                                        <img src={form.hero_image_url} alt="Hero preview" className="h-32 w-full object-cover rounded-lg border border-gray-100"
                                            onError={e => (e.currentTarget.style.display = "none")} />
                                        <p className="text-xs text-gray-400 mt-1">Ukuran rekomendasi: 1600x600px</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lc}>Logo Kabinet</label>
                                    <div className="flex gap-2 items-start">
                                        <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload}
                                            className="hidden" disabled={uploadingLogo} />
                                        <button type="button" onClick={() => logoInputRef.current?.click()}
                                            disabled={uploadingLogo}
                                            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                                            {uploadingLogo ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                            {uploadingLogo ? "Uploading..." : "Upload Logo"}
                                        </button>
                                    </div>
                                    <input type="text" className={`${ic} mt-2`} placeholder="Atau masukkan URL logo..." value={form.logo_url}
                                        onChange={e => setForm({ ...form, logo_url: e.target.value })} />
                                    {form.logo_url && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img src={form.logo_url} alt="Logo preview" className="h-16 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1"
                                                onError={e => (e.currentTarget.style.display = "none")} />
                                            <Image size={16} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className={lc}>Gambar Bagan Struktur</label>
                                    <div className="flex gap-2 items-start">
                                        <input type="file" accept="image/*" ref={structureInputRef} onChange={handleStructureUpload}
                                            className="hidden" disabled={uploadingStructure} />
                                        <button type="button" onClick={() => structureInputRef.current?.click()}
                                            disabled={uploadingStructure}
                                            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                                            {uploadingStructure ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                            {uploadingStructure ? "Uploading..." : "Upload Struktur"}
                                        </button>
                                    </div>
                                    <input type="text" className={`${ic} mt-2`} placeholder="Atau masukkan URL gambar..." value={form.structure_image_url}
                                        onChange={e => setForm({ ...form, structure_image_url: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                                <input type="checkbox" id="is_active" checked={form.is_active}
                                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                    className="w-5 h-5 accent-green-600 rounded" />
                                <label htmlFor="is_active" className="text-sm font-semibold text-green-800">
                                    Jadikan kabinet aktif (tampil di halaman profil website)
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => router.push(`/admin/${role}/profil`)}
                                className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">
                                {saving ? <><Loader2 className="animate-spin" size={18} />Menyimpan...</> : <><Save size={18} />Simpan Perubahan</>}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
