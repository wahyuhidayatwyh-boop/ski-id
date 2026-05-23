"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Loader2 } from "lucide-react";

interface Division {
    id: string;
    name: string;
}

export default function EditMemberPage() {
    const router = useRouter();
    const params = useParams();
    const memberId = params.id as string;
    const role = "admin1";
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [form, setForm] = useState({
        full_name: "",
        jabatan: "",
        nim: "",
        prodi: "",
        photo_url: "",
        division_id: "",
        status: "active",
    });

    useEffect(() => {
        Promise.all([
            supabase.from("divisions").select("id, name").order("name"),
            supabase.from("pengurus").select("*").eq("id", memberId).single(),
        ]).then(([{ data: divData }, { data: memberData }]) => {
            setDivisions(divData || []);
            if (memberData) {
                setForm({
                    full_name: memberData.full_name || "",
                    jabatan: memberData.jabatan || "",
                    nim: memberData.nim || "",
                    prodi: memberData.prodi || "",
                    photo_url: memberData.photo_url || "",
                    division_id: memberData.division_id || "",
                    status: memberData.status || "active",
                });
            }
            setLoading(false);
        });
    }, [memberId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from("pengurus").update({
                full_name: form.full_name,
                jabatan: form.jabatan,
                nim: form.nim,
                prodi: form.prodi,
                photo_url: form.photo_url,
                division_id: form.division_id || null,
                status: form.status,
            }).eq("id", memberId);
            if (error) throw error;
            alert("Berhasil memperbarui anggota!");
            router.push(`/admin/${role}/profil`);
        } catch (err) {
            console.error(err);
            alert("Gagal memperbarui data.");
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-sky-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar role={role} />
            <main className="ml-64 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => router.push(`/admin/${role}/profil`)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Edit Anggota</h1>
                            <p className="text-gray-500 text-sm">Perbarui data pengurus/anggota SKI</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <h2 className="text-lg font-bold text-gray-800">Data Anggota</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Nama Lengkap *</label>
                                    <input type="text" required className={inputClass}
                                        value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Jabatan *</label>
                                    <input type="text" required className={inputClass} placeholder="Contoh: Ketua Divisi"
                                        value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>NIM</label>
                                    <input type="text" className={inputClass}
                                        value={form.nim} onChange={(e) => setForm({ ...form, nim: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Program Studi</label>
                                    <input type="text" className={inputClass}
                                        value={form.prodi} onChange={(e) => setForm({ ...form, prodi: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Divisi</label>
                                    <select className={inputClass} value={form.division_id} onChange={(e) => setForm({ ...form, division_id: e.target.value })}>
                                        <option value="">-- Pilih Divisi --</option>
                                        {divisions.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Non-Aktif</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>URL Foto</label>
                                <input type="text" className={inputClass} placeholder="https://..."
                                    value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} />
                                {form.photo_url && (
                                    <img src={form.photo_url} alt="Preview" className="mt-3 w-20 h-20 rounded-full object-cover border-2 border-sky-200" />
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => router.push(`/admin/${role}/profil`)} className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">
                                {saving ? <><Loader2 className="animate-spin" size={18} />Menyimpan...</> : <><Save size={18} />Simpan Perubahan</>}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
