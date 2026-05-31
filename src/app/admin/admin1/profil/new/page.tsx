"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Loader2, Plus, X, Upload, Image } from "lucide-react";
import { handleImageUpload, uploadFile } from "@/lib/upload";

interface Division { id: string; name: string; }
interface Kabinet { id: string; name: string; period: string; }

function NewProfilContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = "admin1";
    const tab = searchParams.get("tab") || "kabinet";
    const [saving, setSaving] = useState(false);
    const [allDivisions, setAllDivisions] = useState<Division[]>([]);
    const [kabinets, setKabinets] = useState<(Kabinet & { is_active?: boolean })[]>([]);

    // Kabinet form
    const [kabinetForm, setKabinetForm] = useState({
        name: "", period: "", logo_url: "", tagline: "", description: "", visi: "", structure_image_url: "", hero_image_url: "", is_active: false,
    });
    const [misiList, setMisiList] = useState<string[]>([""]);

    // Divisi form
    const [divisiForm, setDivisiForm] = useState({ name: "", description: "", icon: "", kabinet_id: "" });

    // Fetch divisi saat kabinet berubah (untuk form pengurus)
    useEffect(() => {
        if (!pengurusForm.kabinet_id) { setAllDivisions([]); return; }
        supabase.from("divisions").select("id, name").eq("kabinet_id", pengurusForm.kabinet_id).order("name")
            .then(({ data }) => setAllDivisions(data || []));
    }, [pengurusForm.kabinet_id]);

    // Pengurus form
    const [pengurusForm, setPengurusForm] = useState({
        full_name: "", jabatan: "", nim: "", prodi: "", photo_url: "",
        division_id: "", kabinet_id: "", role_level: "staff", status: "active",
    });
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingStructure, setUploadingStructure] = useState(false);
    const [uploadingHero, setUploadingHero] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const structureInputRef = useRef<HTMLInputElement>(null);
    const heroInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        supabase.from("kabinets").select("id, name, period, is_active").order("created_at", { ascending: false })
            .then(({ data: k }) => {
                setKabinets(k || []);
                // Auto-pilih kabinet aktif
                const active = (k || []).find((kb: any) => kb.is_active);
                if (active) {
                    setDivisiForm(prev => ({ ...prev, kabinet_id: active.id }));
                    setPengurusForm(prev => ({ ...prev, kabinet_id: active.id }));
                }
            });
    }, []);

    // ===== SUBMIT KABINET =====
    const handleSubmitKabinet = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...kabinetForm, misi: misiList.filter(m => m.trim() !== "") };
            if (payload.is_active) {
                await supabase.from("kabinets").update({ is_active: false }).neq("id", "none");
            }
            const { error } = await supabase.from("kabinets").insert([payload]);
            if (error) throw error;
            alert("Berhasil menambah kabinet!");
            router.push(`/admin/${role}/profil?tab=kabinet`);
        } catch (err: any) {
            alert("Gagal: " + (err?.message || err));
        } finally { setSaving(false); }
    };

    // ===== SUBMIT DIVISI =====
    const handleSubmitDivisi = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!divisiForm.kabinet_id) {
            alert("Pilih kabinet terlebih dahulu!");
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase.from("divisions").insert([{
                ...divisiForm,
                kabinet_id: divisiForm.kabinet_id || null,
            }]);
            if (error) throw error;
            alert("Berhasil menambah divisi!");
            router.push(`/admin/${role}/profil?tab=divisi`);
        } catch (err: any) {
            alert("Gagal: " + (err?.message || err));
        } finally { setSaving(false); }
    };

    // ===== HANDLE LOGO UPLOAD =====
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
                setKabinetForm({ ...kabinetForm, logo_url: url });
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

    // ===== HANDLE HERO UPLOAD =====
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
                setKabinetForm({ ...kabinetForm, hero_image_url: url });
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

    // ===== HANDLE STRUCTURE UPLOAD =====
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
                setKabinetForm({ ...kabinetForm, structure_image_url: url });
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

    // ===== HANDLE PHOTO UPLOAD =====
    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPhoto(true);
        try {
            const url = await handleImageUpload(file);
            if (url) {
                setPengurusForm({ ...pengurusForm, photo_url: url });
            }
        } catch (error) {
            alert("Gagal upload foto: " + error);
        } finally {
            setUploadingPhoto(false);
        }
    };

    // ===== SUBMIT PENGURUS =====
    const handleSubmitPengurus = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...pengurusForm,
                division_id: pengurusForm.division_id || null,
                kabinet_id: pengurusForm.kabinet_id || null,
            };
            const { error } = await supabase.from("pengurus").insert([payload]);
            if (error) throw error;
            alert("Berhasil menambah pengurus!");
            router.push(`/admin/${role}/profil`);
        } catch (err: any) {
            alert("Gagal: " + (err?.message || err));
        } finally { setSaving(false); }
    };

    const ic = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white";
    const lc = "block text-sm font-semibold text-gray-700 mb-2";

    const tabTitles: Record<string, string> = { kabinet: "Tambah Kabinet Baru", divisi: "Tambah Divisi Baru", pengurus: "Tambah Pengurus Baru" };

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
                            <h1 className="text-2xl font-bold text-gray-800">{tabTitles[tab] || "Tambah Data"}</h1>
                            <p className="text-gray-500 text-sm mt-0.5">Isi form di bawah lalu simpan</p>
                        </div>
                    </div>

                    {/* ===== FORM KABINET ===== */}
                    {tab === "kabinet" && (
                        <form onSubmit={handleSubmitKabinet} className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                                <h2 className="text-lg font-bold text-gray-800">Informasi Kabinet</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={lc}>Nama Kabinet *</label>
                                        <input type="text" required className={ic} placeholder="Contoh: Al-Istiqomah"
                                            value={kabinetForm.name} onChange={e => setKabinetForm({ ...kabinetForm, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={lc}>Periode *</label>
                                        <input type="text" required className={ic} placeholder="Contoh: 2025 / 2026"
                                            value={kabinetForm.period} onChange={e => setKabinetForm({ ...kabinetForm, period: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className={lc}>Tagline / Motto</label>
                                    <input type="text" className={ic} placeholder="Contoh: Istiqomah dalam Dakwah..."
                                        value={kabinetForm.tagline} onChange={e => setKabinetForm({ ...kabinetForm, tagline: e.target.value })} />
                                </div>
                                <div>
                                    <label className={lc}>Deskripsi Kabinet</label>
                                    <textarea rows={3} className={ic} placeholder="Deskripsi singkat tentang kabinet..."
                                        value={kabinetForm.description} onChange={e => setKabinetForm({ ...kabinetForm, description: e.target.value })} />
                                </div>
                                <div>
                                    <label className={lc}>Visi Kabinet</label>
                                    <textarea rows={2} className={ic} placeholder="Visi kabinet..."
                                        value={kabinetForm.visi} onChange={e => setKabinetForm({ ...kabinetForm, visi: e.target.value })} />
                                </div>

                                {/* Misi List */}
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
                                                    className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => setMisiList([...misiList, ""])}
                                            className="flex items-center gap-2 text-sm text-sky-600 font-semibold hover:text-sky-700 transition-colors">
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
                                    <input type="text" className={`${ic} mt-2`} placeholder="Atau masukkan URL hero image..."
                                        value={kabinetForm.hero_image_url} onChange={e => setKabinetForm({ ...kabinetForm, hero_image_url: e.target.value })} />
                                    {kabinetForm.hero_image_url && (
                                        <div className="mt-2">
                                            <img src={kabinetForm.hero_image_url} alt="Hero preview" className="h-32 w-full object-cover rounded-lg border border-gray-100"
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
                                        <input type="text" className={`${ic} mt-2`} placeholder="Atau masukkan URL logo..."
                                            value={kabinetForm.logo_url} onChange={e => setKabinetForm({ ...kabinetForm, logo_url: e.target.value })} />
                                        {kabinetForm.logo_url && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <img src={kabinetForm.logo_url} alt="Logo preview" className="h-16 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1"
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
                                        <input type="text" className={`${ic} mt-2`} placeholder="Atau masukkan URL gambar..."
                                            value={kabinetForm.structure_image_url} onChange={e => setKabinetForm({ ...kabinetForm, structure_image_url: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <input type="checkbox" id="is_active" checked={kabinetForm.is_active}
                                        onChange={e => setKabinetForm({ ...kabinetForm, is_active: e.target.checked })}
                                        className="w-5 h-5 accent-green-600 rounded" />
                                    <label htmlFor="is_active" className="text-sm font-semibold text-green-800">
                                        Jadikan kabinet aktif (tampil di halaman profil website)
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => router.push(`/admin/${role}/profil`)} className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">
                                    {saving ? <><Loader2 className="animate-spin" size={18} />Menyimpan...</> : <><Save size={18} />Simpan Kabinet</>}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ===== FORM DIVISI ===== */}
                    {tab === "divisi" && (
                        <form onSubmit={handleSubmitDivisi} className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                                <h2 className="text-lg font-bold text-gray-800">Informasi Divisi</h2>

                                <div>
                                    <label className={lc}>Kabinet *</label>
                                    <select
                                        className={ic}
                                        value={divisiForm.kabinet_id}
                                        onChange={e => setDivisiForm({ ...divisiForm, kabinet_id: e.target.value })}
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
                                    <input type="text" required className={ic} placeholder="Contoh: Divisi Syiar"
                                        value={divisiForm.name} onChange={e => setDivisiForm({ ...divisiForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className={lc}>Deskripsi</label>
                                    <textarea rows={4} className={ic} placeholder="Deskripsi tentang divisi ini..."
                                        value={divisiForm.description} onChange={e => setDivisiForm({ ...divisiForm, description: e.target.value })} />
                                </div>
                                <div>
                                    <label className={lc}>Icon (emoji atau URL)</label>
                                    <input type="text" className={ic} placeholder="Contoh: 📚"
                                        value={divisiForm.icon} onChange={e => setDivisiForm({ ...divisiForm, icon: e.target.value })} />
                                    {divisiForm.icon && divisiForm.icon.length <= 2 && (
                                        <p className="text-2xl mt-2">{divisiForm.icon}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => router.push(`/admin/${role}/profil?tab=divisi`)} className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">
                                    {saving ? <><Loader2 className="animate-spin" size={18} />Menyimpan...</> : <><Save size={18} />Simpan Divisi</>}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ===== FORM PENGURUS ===== */}
                    {tab === "pengurus" && (
                        <form onSubmit={handleSubmitPengurus} className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                                <h2 className="text-lg font-bold text-gray-800">Data Pengurus</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={lc}>Nama Lengkap *</label>
                                        <input type="text" required className={ic}
                                            value={pengurusForm.full_name} onChange={e => setPengurusForm({ ...pengurusForm, full_name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={lc}>Jabatan *</label>
                                        <input type="text" required className={ic} placeholder="Contoh: Ketua Umum, Sekretaris 1"
                                            value={pengurusForm.jabatan} onChange={e => setPengurusForm({ ...pengurusForm, jabatan: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={lc}>Role Level</label>
                                        <select className={ic} value={pengurusForm.role_level} onChange={e => setPengurusForm({ ...pengurusForm, role_level: e.target.value })}>
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
                                        <select className={ic} value={pengurusForm.kabinet_id} onChange={e => { setPengurusForm({ ...pengurusForm, kabinet_id: e.target.value, division_id: "" }); }}>
                                            <option value="">-- Pilih Kabinet --</option>
                                            {kabinets.map(k => <option key={k.id} value={k.id}>{k.name} ({k.period}){(k as any).is_active ? " ✓ Aktif" : ""}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lc}>Divisi</label>
                                        <select className={ic} value={pengurusForm.division_id} onChange={e => setPengurusForm({ ...pengurusForm, division_id: e.target.value })} disabled={!pengurusForm.kabinet_id}>
                                            <option value="">{pengurusForm.kabinet_id ? "-- Pilih Divisi --" : "-- Pilih Kabinet dulu --"}</option>
                                            {allDivisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                        {!pengurusForm.kabinet_id && <p className="text-xs text-amber-500 mt-1">Pilih kabinet terlebih dahulu untuk memuat daftar divisi</p>}
                                    </div>
                                    <div>
                                        <label className={lc}>NIM</label>
                                        <input type="text" className={ic} placeholder="Nomor Induk Mahasiswa"
                                            value={pengurusForm.nim} onChange={e => setPengurusForm({ ...pengurusForm, nim: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={lc}>Program Studi</label>
                                        <input type="text" className={ic} placeholder="Contoh: S1 Teknik Informatika"
                                            value={pengurusForm.prodi} onChange={e => setPengurusForm({ ...pengurusForm, prodi: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={lc}>Status</label>
                                        <select className={ic} value={pengurusForm.status} onChange={e => setPengurusForm({ ...pengurusForm, status: e.target.value })}>
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
                                        {pengurusForm.photo_url && (
                                            <div className="relative">
                                                <img
                                                    src={pengurusForm.photo_url}
                                                    alt="Preview"
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-sky-200"
                                                    onError={e => (e.currentTarget.style.display = "none")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPengurusForm({ ...pengurusForm, photo_url: "" });
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
                                <button type="button" onClick={() => router.push(`/admin/${role}/profil`)} className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50">
                                    {saving ? <><Loader2 className="animate-spin" size={18} />Menyimpan...</> : <><Save size={18} />Simpan Pengurus</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function NewProfilPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewProfilContent />
        </Suspense>
    );
}