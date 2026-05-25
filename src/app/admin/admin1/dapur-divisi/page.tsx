"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Briefcase, Edit, Plus, Trash2, X, ChevronLeft, Target as TargetIcon, Flag as FlagIcon, Users, Loader2
} from "lucide-react";

interface Kabinet { id: string; name: string; period: string; is_active: boolean; }
interface Proker { id: string; division_id: string; name: string; description: string; image_url: string; status: string; created_at: string; }
interface DivisionData { id: string; name: string; description: string; icon: string; hero_image_url: string; vision: string; mission: string; coordinator?: { photo_url: string, full_name: string, jabatan: string }; staffs: { photo_url: string, full_name: string, jabatan: string }[] }

export default function AdminDapurDivisi() {
    const role = "admin1";
    const [loading, setLoading] = useState(true);
    
    // Multi-Kabinet State
    const [kabinets, setKabinets] = useState<Kabinet[]>([]);
    const [selectedKabinetId, setSelectedKabinetId] = useState<string>("");

    // View States
    const [activeDivisiId, setActiveDivisiId] = useState<string | null>(null);
    const [divisiSubTab, setDivisiSubTab] = useState<"profil" | "proker">("profil");
    
    // Data States
    const [allDivisions, setAllDivisions] = useState<DivisionData[]>([]);
    const [prokers, setProkers] = useState<Proker[]>([]);
    
    // Form States
    const [showProkerForm, setShowProkerForm] = useState(false);
    const [newProker, setNewProker] = useState({ name: "", description: "", image_url: "" });

    // Edit Division & Proker States
    const [isEditingDivision, setIsEditingDivision] = useState(false);
    const [editDivisionData, setEditDivisionData] = useState({ description: "", hero_image_url: "", vision: "", mission: "" });
    const [editingProkerId, setEditingProkerId] = useState<string | null>(null);
    const [editProkerData, setEditProkerData] = useState({ name: "", description: "", image_url: "" });

    // Upload State
    const [isUploading, setIsUploading] = useState(false);

    const uploadFileToSupabase = async (file: File) => {
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;
            const { error } = await supabase.storage.from('public_assets').upload(filePath, file);
            if (error) throw error;
            const { data } = supabase.storage.from('public_assets').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error: any) {
            alert("Gagal mengunggah gambar: " + error.message);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => { fetchInitialData(); }, []);
    useEffect(() => { if (selectedKabinetId) fetchDashboardData(selectedKabinetId); }, [selectedKabinetId]);

    const fetchInitialData = async () => {
        const { data: kData } = await supabase.from("kabinets").select("*").order("created_at", { ascending: false });
        if (kData && kData.length > 0) {
            setKabinets(kData);
            const active = kData.find(k => k.is_active) || kData[0];
            setSelectedKabinetId(active.id);
        } else {
            setLoading(false);
        }
    };

    const fetchDashboardData = async (kabinet_id: string) => {
        setLoading(true);
        try {
            // Fetch Divisions & Structure
            const { data: divData } = await supabase.from("divisions").select("*");
            if (divData) {
                const enrichedDivs = await Promise.all(divData.map(async (div) => {
                    const { data: pData } = await supabase.from("pengurus").select("full_name, jabatan, role_level, photo_url").eq("division_id", div.id).eq("kabinet_id", kabinet_id);
                    const coordinator = pData?.find(p => ["div_ketua", "lso_ketua", "ketuum"].includes(p.role_level));
                    const staffs = pData?.filter(p => !["div_ketua", "lso_ketua", "ketuum"].includes(p.role_level)) || [];
                    return { ...div, coordinator, staffs };
                }));
                setAllDivisions(enrichedDivs as any);
            }

            // Fetch Prokers
            const { data: prData } = await supabase.from("prokers").select("*").eq("kabinet_id", kabinet_id).order("created_at", { ascending: false });
            if (prData) setProkers(prData);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveDivisionEdit = async () => {
        if (!activeDivisiId) return;
        await supabase.from("divisions").update(editDivisionData).eq("id", activeDivisiId);
        setIsEditingDivision(false);
        fetchDashboardData(selectedKabinetId);
        alert("Profil divisi berhasil diperbarui!");
    };

    const submitProker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProker.name || !activeDivisiId) return;
        await supabase.from("prokers").insert([{ kabinet_id: selectedKabinetId, division_id: activeDivisiId, name: newProker.name, description: newProker.description, image_url: newProker.image_url }]);
        setShowProkerForm(false);
        setNewProker({ name: "", description: "", image_url: "" });
        fetchDashboardData(selectedKabinetId);
        alert("Program kerja berhasil ditambahkan!");
    };

    const updateProker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProkerId) return;
        await supabase.from("prokers").update(editProkerData).eq("id", editingProkerId);
        setEditingProkerId(null);
        fetchDashboardData(selectedKabinetId);
        alert("Program kerja berhasil diupdate!");
    };

    const deleteProker = async (id: string) => {
        if (!confirm("Yakin ingin menghapus program kerja ini beserta semua data turunannya?")) return;
        await supabase.from("prokers").delete().eq("id", id);
        fetchDashboardData(selectedKabinetId);
    };

    const activeDivisionData = allDivisions.find(d => d.id === activeDivisiId);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar role={role} />
            <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">SuperAdmin Dapur Divisi</h1>
                        <p className="text-sm text-slate-500 mt-1">Akses penuh CRUD untuk seluruh Profil Divisi dan Program Kerja.</p>
                    </div>
                    <select 
                        value={selectedKabinetId} 
                        onChange={(e) => { setSelectedKabinetId(e.target.value); setActiveDivisiId(null); }}
                        className="bg-white border border-slate-200 text-sm font-bold rounded-xl px-4 py-2.5 w-full sm:w-auto focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-sm"
                    >
                        {kabinets.map(k => <option key={k.id} value={k.id}>{k.name} {k.period}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-sky-500" size={40} />
                    </div>
                ) : (
                    <>
                        {/* VIEW: DAFTAR DIVISI */}
                        {!activeDivisiId && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {allDivisions.map(div => (
                                        <div key={div.id} onClick={() => { 
                                            setActiveDivisiId(div.id); 
                                            setDivisiSubTab("profil"); 
                                            setEditDivisionData({ description: div.description || "", hero_image_url: div.hero_image_url || "", vision: div.vision || "", mission: div.mission || "" });
                                        }} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-300 transition-all cursor-pointer group">
                                            <div className="h-32 bg-slate-200 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${div.hero_image_url || 'https://via.placeholder.com/600x200'})` }} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                                    <h3 className="text-xl font-black drop-shadow-md">{div.name}</h3>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <p className="text-sm text-slate-600 font-medium line-clamp-2 mb-4">{div.description || "Belum ada deskripsi"}</p>
                                                <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-t border-slate-100 pt-3">
                                                    <span>{div.staffs.length} Staff</span>
                                                    <span className="text-sky-500">Kelola Divisi →</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* DIVISION DETAILS */}
                        {activeDivisiId && activeDivisionData && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pb-10">
                                {/* Back Button */}
                                <button onClick={() => setActiveDivisiId(null)} className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                                    <ChevronLeft size={16} /> Kembali ke Daftar Divisi
                                </button>

                                {/* Hero Section */}
                                <div className="rounded-[2rem] overflow-hidden bg-slate-900 relative h-64 sm:h-80 mb-8 shadow-xl border border-slate-800">
                                    <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${activeDivisionData.hero_image_url || 'https://via.placeholder.com/1200x400'})` }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-8">
                                        <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 drop-shadow-lg">{activeDivisionData.name}</h1>
                                        <p className="text-sky-200 font-medium max-w-2xl text-sm sm:text-base drop-shadow-md">{activeDivisionData.description}</p>
                                    </div>
                                </div>

                                {/* Divisi Sub-Tabs */}
                                <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
                                    {[
                                        { id: "profil", icon: <Briefcase size={16}/>, label: "Profil Divisi" },
                                        { id: "proker", icon: <TargetIcon size={16}/>, label: "Program Kerja" }
                                    ].map(tab => (
                                        <button key={tab.id} onClick={() => setDivisiSubTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${divisiSubTab === tab.id ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                            {tab.icon} {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* SUB-TAB 1: PROFIL DIVISI */}
                                {divisiSubTab === "profil" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
                                                <button onClick={() => setIsEditingDivision(!isEditingDivision)} className="absolute top-6 right-6 text-sky-500 hover:text-sky-700 bg-sky-50 p-2 rounded-lg transition-colors">
                                                    {isEditingDivision ? <X size={18} /> : <Edit size={18} />}
                                                </button>
                                                
                                                {isEditingDivision ? (
                                                    <div className="space-y-4">
                                                        <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Edit size={18}/> Edit Profil Divisi (SuperAdmin)</h3>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 mb-1">Upload Cover/Banner Divisi</label>
                                                            <input type="file" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" 
                                                                onChange={async (e) => { if(e.target.files && e.target.files[0]) { const url = await uploadFileToSupabase(e.target.files[0]); setEditDivisionData({...editDivisionData, hero_image_url: url}); } }} 
                                                            />
                                                        </div>
                                                        <textarea rows={3} placeholder="Deskripsi Singkat Divisi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={editDivisionData.description} onChange={e => setEditDivisionData({...editDivisionData, description: e.target.value})} />
                                                        <textarea rows={3} placeholder="Visi Divisi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={editDivisionData.vision} onChange={e => setEditDivisionData({...editDivisionData, vision: e.target.value})} />
                                                        <textarea rows={3} placeholder="Misi Divisi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={editDivisionData.mission} onChange={e => setEditDivisionData({...editDivisionData, mission: e.target.value})} />
                                                        <button disabled={isUploading} onClick={saveDivisionEdit} className="bg-sky-500 text-white font-black px-6 py-2.5 rounded-xl text-sm hover:bg-sky-600 transition-colors disabled:bg-slate-400">{isUploading ? 'Mengunggah...' : 'Simpan Perubahan'}</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <h3 className="font-black text-slate-900 mb-2 flex items-center gap-2"><TargetIcon size={16}/> Visi Divisi</h3>
                                                            <p className="text-slate-600 text-sm leading-relaxed">{activeDivisionData.vision || "Belum ada visi yang ditulis."}</p>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-slate-900 mb-2 flex items-center gap-2"><FlagIcon size={16}/> Misi Divisi</h3>
                                                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{activeDivisionData.mission || "Belum ada misi yang ditulis."}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            {/* Koordinator */}
                                            <div className="bg-sky-900 text-white p-6 rounded-3xl shadow-lg flex items-center gap-5">
                                                <img src={activeDivisionData.coordinator?.photo_url || 'https://via.placeholder.com/100'} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20" />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-sky-300 tracking-widest mb-1">Koordinator Divisi</p>
                                                    <h4 className="text-xl font-black">{activeDivisionData.coordinator?.full_name || "Belum ditunjuk"}</h4>
                                                    <p className="text-sm font-medium text-slate-300">{activeDivisionData.coordinator?.jabatan}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Staffs */}
                                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                                <h4 className="font-black text-slate-900 mb-4">Staff Divisi ({activeDivisionData.staffs.length})</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {activeDivisionData.staffs.map((staff, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                            <img src={staff.photo_url || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-full object-cover" />
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 line-clamp-1">{staff.full_name}</p>
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase">{staff.jabatan}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {activeDivisionData.staffs.length === 0 && <p className="text-sm text-slate-400 font-medium">Belum ada staff.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SUB-TAB 2: PROGRAM KERJA */}
                                {divisiSubTab === "proker" && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
                                            <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Plus size={18}/> Tambah Program Kerja Baru (SuperAdmin)</h4>
                                            <form onSubmit={submitProker} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nama Proker</label>
                                                        <input required type="text" placeholder="Nama Proker" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={newProker.name} onChange={e => setNewProker({...newProker, name: e.target.value})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Upload Foto/Infografis Proker</label>
                                                        <input type="file" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" 
                                                            onChange={async (e) => { if(e.target.files && e.target.files[0]) { const url = await uploadFileToSupabase(e.target.files[0]); setNewProker({...newProker, image_url: url}); } }} 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <textarea required rows={3} placeholder="Deskripsi Makro Proker..." className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium mt-6" value={newProker.description} onChange={e => setNewProker({...newProker, description: e.target.value})} />
                                                    <button disabled={isUploading} type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl text-sm transition-colors disabled:bg-slate-400">{isUploading ? 'Mengunggah...' : 'Simpan Proker'}</button>
                                                </div>
                                            </form>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {prokers.filter(p => p.division_id === activeDivisiId).length === 0 && <div className="col-span-full text-center py-12"><p className="text-slate-400 font-bold">Belum ada Program Kerja terdaftar.</p></div>}
                                            {prokers.filter(p => p.division_id === activeDivisiId).map(p => (
                                                editingProkerId === p.id ? (
                                                    <div key={p.id} className="bg-white p-6 rounded-3xl border border-sky-300 shadow-lg mb-8">
                                                        <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Edit size={18}/> Edit Program Kerja</h4>
                                                        <form onSubmit={updateProker} className="space-y-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Proker</label>
                                                                <input required type="text" placeholder="Nama Proker" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={editProkerData.name} onChange={e => setEditProkerData({...editProkerData, name: e.target.value})} />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-500 mb-1">Upload Foto/Infografis Proker</label>
                                                                <input type="file" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium" 
                                                                    onChange={async (e) => { if(e.target.files && e.target.files[0]) { const url = await uploadFileToSupabase(e.target.files[0]); setEditProkerData({...editProkerData, image_url: url}); } }} 
                                                                />
                                                            </div>
                                                            <textarea required rows={3} placeholder="Deskripsi Makro Proker..." className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium mt-2" value={editProkerData.description} onChange={e => setEditProkerData({...editProkerData, description: e.target.value})} />
                                                            <div className="flex gap-3">
                                                                <button disabled={isUploading} type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors disabled:bg-slate-400">{isUploading ? 'Mengunggah...' : 'Update Proker'}</button>
                                                                <button type="button" onClick={() => setEditingProkerId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black px-5 py-2.5 rounded-xl text-sm transition-colors">Batal</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                ) : (
                                                    <div key={p.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative group">
                                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            <button onClick={() => { setEditingProkerId(p.id); setEditProkerData({ name: p.name, description: p.description, image_url: p.image_url || "" }); }} className="bg-white p-2 rounded-lg text-sky-500 hover:bg-sky-50 shadow-sm"><Edit size={16} /></button>
                                                            <button onClick={() => deleteProker(p.id)} className="bg-white p-2 rounded-lg text-red-500 hover:bg-red-50 shadow-sm"><Trash2 size={16} /></button>
                                                        </div>
                                                        {p.image_url && <div className="h-40 bg-cover bg-center border-b border-slate-100" style={{ backgroundImage: `url(${p.image_url})` }} />}
                                                        <div className="p-6 flex-1 flex flex-col">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-black text-xl text-slate-900 pr-16">{p.name}</h4>
                                                                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{p.status || "Aktif"}</span>
                                                            </div>
                                                            <p className="text-sm text-slate-500 font-medium flex-1">{p.description}</p>
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
