"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/upload";
import { Save, ArrowLeft, Loader2, Plus, X, Upload, Trash2, Image as ImageIcon } from "lucide-react";

interface Kabinet { id: string; name: string; period: string; }
interface ProgramKerja { id: string; name: string; description: string; photo_url: string; }

export default function EditDivisiPage() {
    const router = useRouter();
    const params = useParams();
    const divId = params.id as string;
    const role = "admin1";
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [kabinets, setKabinets] = useState<Kabinet[]>([]);
    const [form, setForm] = useState({
        name: "",
        description: "",
        icon: "",
        kabinet_id: "",
    });
    const [programKerja, setProgramKerja] = useState<ProgramKerja[]>([]);
    const [newProgramKerja, setNewProgramKerja] = useState({ name: "", description: "", photo_url: "" });
    const [uploadingProgramPhoto, setUploadingProgramPhoto] = useState(false);
    const [loadingProgramKerja, setLoadingProgramKerja] = useState(false);
    const programPhotoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        Promise.all([
            supabase.from("kabinets").select("id, name, period").order("created_at", { ascending: false }),
            supabase.from("divisions").select("*").eq("id", divId).single(),
            supabase.from("program_kerja").select("*").eq("division_id", divId).order("created_at", { ascending: false }),
        ]).then(([{ data: kabData }, { data: divData }, { data: progData }]) => {
            setKabinets(kabData || []);
            if (divData) {
                setForm({
                    name: divData.name || "",
                    description: divData.description || "",
                    icon: divData.icon || "",
                    kabinet_id: divData.kabinet_id || "",
                });
            }
            setProgramKerja(progData || []);
            setLoading(false);
        });
    }, [divId]);

    const handleProgramPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Pilih file gambar (PNG, JPG)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB');
            return;
        }

        setUploadingProgramPhoto(true);
        try {
            const url = await uploadFile(file, 'kabinet-logos', 'program-kerja');
            if (url) {
                setNewProgramKerja({ ...newProgramKerja, photo_url: url });
                alert('Foto berhasil diupload!');
            } else {
                alert('Gagal upload foto');
            }
        } catch (err) {
            alert('Error: ' + err);
        } finally {
            setUploadingProgramPhoto(false);
        }
    };

    const addProgramKerja = async () => {
        if (!newProgramKerja.name.trim()) {
            alert('Nama program kerja wajib diisi!');
            return;
        }

        try {
            const { data, error } = await supabase.from("program_kerja").insert([{
                division_id: divId,
                name: newProgramKerja.name,
                description: newProgramKerja.description,
                photo_url: newProgramKerja.photo_url,
            }]).select();

            if (error) throw error;

            if (data) {
                setProgramKerja([data[0], ...programKerja]);
                setNewProgramKerja({ name: "", description: "", photo_url: "" });
                alert('Program kerja berhasil ditambahkan!');
            }
        } catch (err: any) {
            alert('Gagal: ' + (err?.message || err));
        }
    };

    const deleteProgramKerja = async (progId: string) => {
        if (!confirm('Hapus program kerja ini?')) return;

        try {
            const { error } = await supabase.from("program_kerja").delete().eq("id", progId);
            if (error) throw error;

            setProgramKerja(programKerja.filter(p => p.id !== progId));
            alert('Program kerja berhasil dihapus!');
        } catch (err: any) {
            alert('Gagal: ' + (err?.message || err));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from("divisions").update({
                ...form,
                kabinet_id: form.kabinet_id || null,
            }).eq("id", divId);
            if (error) throw error;
            alert("Berhasil memperbarui data divisi!");
            router.push(`/admin/${role}/profil?tab=divisi`);
        } catch (err: any) {
            alert("Gagal: " + (err?.message || err));
        } finally {
            setSaving(false);
        }
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
                        <button onClick={() => router.push(`/admin/${role}/profil?tab=divisi`)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Edit Divisi</h1>
                            <p className="text-gray-500 text-sm">Perbarui data divisi SKI</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <h2 className="text-lg font-bold text-gray-800">Informasi Divisi</h2>

                            <div>
                                <label className={lc}>Kabinet *</label>
                                <select
                                    className={ic}
                                    value={form.kabinet_id}
                                    onChange={e => setForm({ ...form, kabinet_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Kabinet --</option>
                                    {kabinets.map(k => (
                                        <option key={k.id} value={k.id}>{k.name} ({k.period})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">Divisi akan terikat pada kabinet yang dipilih</p>
                            </div>

                            <div>
                                <label className={lc}>Nama Divisi *</label>
                                <input
                                    type="text"
                                    required
                                    className={ic}
                                    placeholder="Contoh: Divisi Syiar"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className={lc}>Deskripsi</label>
                                <textarea
                                    rows={4}
                                    className={ic}
                                    placeholder="Deskripsi tentang divisi ini..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className={lc}>Icon (emoji atau URL)</label>
                                <input
                                    type="text"
                                    className={ic}
                                    placeholder="Contoh: 📚"
                                    value={form.icon}
                                    onChange={e => setForm({ ...form, icon: e.target.value })}
                                />
                                {form.icon && form.icon.length <= 2 && (
                                    <p className="text-2xl mt-2">{form.icon}</p>
                                )}
                            </div>
                        </div>

                        {/* Program Kerja Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <h2 className="text-lg font-bold text-gray-800">Program Kerja</h2>
                            <p className="text-sm text-gray-500">Tambahkan program kerja divisi ini</p>

                            {/* Add New Program */}
                            <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700">Tambah Program Baru</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Nama Program *</label>
                                        <input type="text" className={ic} placeholder="Contoh: Kajian Rutin"
                                            value={newProgramKerja.name} onChange={e => setNewProgramKerja({ ...newProgramKerja, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Foto Program</label>
                                        <div className="flex gap-2">
                                            <input type="file" accept="image/*" ref={programPhotoRef} onChange={handleProgramPhotoUpload}
                                                className="hidden" disabled={uploadingProgramPhoto} />
                                            <button type="button" onClick={() => programPhotoRef.current?.click()}
                                                disabled={uploadingProgramPhoto}
                                                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-100">
                                                {uploadingProgramPhoto ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                                                {uploadingProgramPhoto ? "..." : "Upload"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600">Deskripsi</label>
                                    <textarea rows={2} className={ic} placeholder="Deskripsi program kerja..."
                                        value={newProgramKerja.description} onChange={e => setNewProgramKerja({ ...newProgramKerja, description: e.target.value })} />
                                </div>
                                {newProgramKerja.photo_url && (
                                    <div className="flex items-center gap-2">
                                        <img src={newProgramKerja.photo_url} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                                        <span className="text-xs text-gray-500">Foto terpilih</span>
                                    </div>
                                )}
                                <button type="button" onClick={addProgramKerja}
                                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600">
                                    <Plus size={16} /> Tambah Program
                                </button>
                            </div>

                            {/* Existing Programs List */}
                            {programKerja.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {programKerja.map((prog) => (
                                        <div key={prog.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            {prog.photo_url ? (
                                                <img src={prog.photo_url} alt={prog.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <ImageIcon size={24} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-gray-800 truncate">{prog.name}</h4>
                                                {prog.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{prog.description}</p>
                                                )}
                                            </div>
                                            <button type="button" onClick={() => deleteProgramKerja(prog.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-center">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-6 text-gray-400">
                                    <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Belum ada program kerja</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.push(`/admin/${role}/profil?tab=divisi`)}
                                className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {saving ? (
                                    <><Loader2 className="animate-spin" size={18} /> Menyimpan...</>
                                ) : (
                                    <><Save size={18} /> Simpan Perubahan</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}