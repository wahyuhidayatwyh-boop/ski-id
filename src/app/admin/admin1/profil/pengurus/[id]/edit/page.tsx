"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Loader2, X } from "lucide-react";
import { handleImageUpload } from "@/lib/upload";

interface Division { id: string; name: string; }
interface Kabinet { id: string; name: string; period: string; is_active?: boolean; }

export default function EditPengurusPage() {
    const router = useRouter();
    const params = useParams();
    const penId = params.id as string;
    const role = "admin1";
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
    const [kabinets, setKabinets] = useState<Kabinet[]>([]);
    const [form, setForm] = useState({
        full_name: "", jabatan: "", nim: "", prodi: "",
        photo_url: "", division_id: "", kabinet_id: "",
        role_level: "staff", status: "active",
    });
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        Promise.all([
            supabase.from("kabinets").select("id, name, period, is_active").order("created_at", { ascending: false }),
            supabase.from("pengurus").select("*").eq("id", penId).single(),
        ]).then(([{ data: kabData }, { data: penData }]) => {
            setKabinets(kabData || []);
            if (penData) {
                const kabId = penData.kabinet_id || "";
                setForm({
                    full_name: penData.full_name || "",
                    jabatan: penData.jabatan || "",
                    nim: penData.nim || "",
                    prodi: penData.prodi || "",
                    photo_url: penData.photo_url || "",
                    division_id: penData.division_id || "",
                    kabinet_id: kabId,
                    role_level: penData.role_level || "staff",
                    status: penData.status || "active",
                });
                // Load divisi sesuai kabinet saat ini
                if (kabId) {
                    supabase.from("divisions").select("id, name").eq("kabinet_id", kabId).order("name")
                        .then(({ data }) => setFilteredDivisions(data || []));
                }
            }
            setLoading(false);
        });
    }, [penId]);

    // Load divisi ketika kabinet berubah
    useEffect(() => {
        if (!form.kabinet_id) { setFilteredDivisions([]); return; }
        supabase.from("divisions").select("id, name").eq("kabinet_id", form.kabinet_id).order("name")
            .then(({ data }) => setFilteredDivisions(data || []));
    }, [form.kabinet_id]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPhoto(true);
        try {
            const url = await handleImageUpload(file);
            if (url) {
                setForm({ ...form, photo_url: url });
            }
        } catch (error) {
            alert("Gagal upload foto: " + error);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from("pengurus").update({
                ...form,
                division_id: form.division_id || null,
                kabinet_id: form.kabinet_id || null,
            }).eq("id", penId);
            if (error) throw error;
            alert("Berhasil memperbarui data pengurus!");
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
                            <h1 className="text-2xl font-bold text-gray-800">Edit Pengurus</h1>
                            <p className="text-gray-500 text-sm">Perbarui data pengurus/anggota SKI</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <h2 className="text-lg font-bold text-gray-800">Data Pengurus</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={lc}>Nama Lengkap *</label>
                                    <input type="text" required className={ic}
                                        value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className={lc}>Jabatan *</label>
                                    <input type="text" required className={ic} placeholder="Contoh: Ketua Umum"
                                        value={form.jabatan} onChange={e => setForm({ ...form, jabatan: e.target.value })} />
                                </div>
                                <div>
                                    <label className={lc}>Role Level</label>
                                    <select className={ic} value={form.role_level} onChange={e => setForm({ ...form, role_level: e.target.value })}>
                                        <option value="ketuum">Ketua Umum</option>
                                        <option value="wakil">Wakil Ketua</option>
                                        <option value="sekretaris1">Sekretaris 1</option>
                                        <option value="sekretaris2">Sekretaris 2</option>
                                        <option value="bendahara1">Bendahara 1</option>
                                        <option value="bendahara2">Bendahara 2</option>
                                        <option value="dpo">DPO</option>
                                        <option value="lso_ketua">Koordinator LSO</option>
                                        <option value="div_ketua">Koordinator Divisi</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={lc}>Kabinet</label>
                                    <select className={ic} value={form.kabinet_id} onChange={e => setForm({ ...form, kabinet_id: e.target.value, division_id: "" })}>
                                        <option value="">-- Pilih Kabinet --</option>
                                        {kabinets.map(k => <option key={k.id} value={k.id}>{k.name} ({k.period}){k.is_active ? " ✓ Aktif" : ""}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={lc}>Divisi</label>
                                    <select className={ic} value={form.division_id} onChange={e => setForm({ ...form, division_id: e.target.value })} disabled={!form.kabinet_id}>
                                        <option value="">{form.kabinet_id ? "-- Pilih Divisi --" : "-- Pilih Kabinet dulu --"}</option>
                                        {filteredDivisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    {!form.kabinet_id && <p className="text-xs text-amber-500 mt-1">Pilih kabinet terlebih dahulu</p>}
                                </div>
                                <div>
                                    <label className={lc}>NIM</label>
                                    <input type="text" className={ic} value={form.nim} onChange={e => setForm({ ...form, nim: e.target.value })} />
                                </div>
                                <div>
                                    <label className={lc}>Program Studi</label>
                                    <input type="text" className={ic} value={form.prodi} onChange={e => setForm({ ...form, prodi: e.target.value })} />
                                </div>
                                <div>
                                    <label className={lc}>Status</label>
                                    <select className={ic} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Non-Aktif</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={lc}>Foto Profil</label>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        disabled={uploadingPhoto}
                                        ref={photoInputRef}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-sm"
                                    />
                                    {form.photo_url && (
                                        <div className="relative">
                                            <img
                                                src={form.photo_url}
                                                alt="Preview"
                                                className="w-20 h-20 rounded-full object-cover border-2 border-sky-200"
                                                onError={e => (e.currentTarget.style.display = "none")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setForm({ ...form, photo_url: "" });
                                                    if (photoInputRef.current) photoInputRef.current.value = "";
                                                }}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {uploadingPhoto && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-sky-600">
                                        <Loader2 className="animate-spin" size={16} />
                                        Mengupload foto...
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    Format: JPG, PNG, WebP (Max 5MB)
                                </p>
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
