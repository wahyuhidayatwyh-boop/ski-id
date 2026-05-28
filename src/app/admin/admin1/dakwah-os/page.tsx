"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { 
    Calendar, Users, Activity, FileText, Plus, 
    CheckCircle, AlertCircle, Clock, Search, X, Loader2, Trash2
} from "lucide-react";
import Link from "next/link";

interface Kabinet { id: string; name: string; period: string; }
interface Acara { id: string; title: string; start_time: string; location: string; status: string; jwt_secret_token: string; absensi_count?: number; }
interface Evaluasi { pengurus_id: string; full_name: string; jabatan: string; divisi_name: string; total_acara: number; total_hadir: number; persentase_kehadiran: number; status_evaluasi: string; }

export default function DakwahOSAdmin() {
    const role = "admin1";
    const [activeTab, setActiveTab] = useState<"acara" | "evaluasi">("acara");
    const [loading, setLoading] = useState(true);
    
    const [kabinets, setKabinets] = useState<Kabinet[]>([]);
    const [activeKabinet, setActiveKabinet] = useState<Kabinet | null>(null);
    
    // Acara State
    const [acaras, setAcaras] = useState<Acara[]>([]);
    const [showAcaraModal, setShowAcaraModal] = useState(false);
    const [newAcara, setNewAcara] = useState({ title: "", description: "", start_time: "", end_time: "", location: "", attachment_url: "", meeting_link: "" });
    const [selectedQR, setSelectedQR] = useState<string | null>(null);
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
            alert("Gagal mengunggah file: " + error.message);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };
    

    // Evaluasi State
    const [evaluasiList, setEvaluasiList] = useState<Evaluasi[]>([]);
    const [evalFilter, setEvalFilter] = useState("ALL");
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        setBaseUrl(typeof window !== "undefined" ? window.location.origin : "");
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        // Get Active Kabinet
        const { data: kabData } = await supabase.from("kabinets").select("*").eq("is_active", true).single();
        
        if (kabData) {
            setActiveKabinet(kabData);
            await fetchAcaras(kabData.id);
            await fetchEvaluasi(kabData.id);
        }
        setLoading(false);
    };

    const fetchAcaras = async (kabId: string) => {
        const { data: acaraData } = await supabase.from("acara_internal").select("*").eq("kabinet_id", kabId).order("start_time", { ascending: false });
        if (acaraData) {
            // Fetch absensi counts for each acara
            const acarasWithCounts = await Promise.all(acaraData.map(async (acara) => {
                const { count } = await supabase.from("absensi_digital").select("*", { count: "exact", head: true }).eq("acara_id", acara.id);
                return { ...acara, absensi_count: count || 0 };
            }));
            setAcaras(acarasWithCounts);
        }
    };

    const handleSelesaikanAcara = async (acaraId: string) => {
        if (!confirm("Yakin ingin menyelesaikan acara ini? (Hanya acara selesai yang akan dihitung dalam KPI)")) return;
        try {
            const { error } = await supabase.from("acara_internal").update({ status: "completed" }).eq("id", acaraId);
            if (error) throw error;
            if (activeKabinet) {
                fetchAcaras(activeKabinet.id);
                fetchEvaluasi(activeKabinet.id); // Refresh KPI
            }
            alert("Acara berhasil diselesaikan!");
        } catch (err: any) {
            alert("Gagal: " + err.message);
        }
    };

    const fetchEvaluasi = async (kabId: string) => {
        const { data } = await supabase.from("vw_performa_pengurus").select("*").eq("kabinet_id", kabId);
        if (data) setEvaluasiList(data);
    };

    const handleDeleteAcara = async (acaraId: string) => {
        if (!confirm("Yakin ingin menghapus acara ini? Semua data terkait absensi juga akan terhapus.")) return;
        try {
            const { error } = await supabase.from("acara_internal").delete().eq("id", acaraId);
            if (error) throw error;
            if (activeKabinet) {
                fetchAcaras(activeKabinet.id);
                fetchEvaluasi(activeKabinet.id);
            }
            alert("Acara berhasil dihapus!");
        } catch (err: any) {
            alert("Gagal menghapus acara: " + err.message);
        }
    };

    const handleCreateAcara = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeKabinet) return;
        
        // Generate random JWT-like string for QR Code verification
        const randomToken = "SKI-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now();
        
        try {
            const { error } = await supabase.from("acara_internal").insert([{
                title: newAcara.title,
                description: newAcara.description,
                start_time: new Date(newAcara.start_time).toISOString(),
                end_time: new Date(newAcara.end_time).toISOString(),
                location: newAcara.location,
                attachment_url: newAcara.attachment_url,
                meeting_link: newAcara.meeting_link,
                kabinet_id: activeKabinet.id,
                jwt_secret_token: randomToken
            }]);
            
            if (error) throw error;
            setShowAcaraModal(false);
            setNewAcara({ title: "", description: "", start_time: "", end_time: "", location: "", attachment_url: "", meeting_link: "" });
            fetchAcaras(activeKabinet.id);
            alert("Agenda internal berhasil dibuat!");
        } catch (err: any) {
            alert("Gagal: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar role={role} />
            <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
                
                {/* HEADER DAKWAH-OS */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <Activity size={200} />
                    </div>
                    <div className="relative z-10">
                        <span className="bg-sky-500/20 text-sky-400 font-bold px-3 py-1 rounded-full text-xs tracking-widest uppercase mb-4 inline-block border border-sky-500/30">
                            Enterprise Command Center
                        </span>
                        <h1 className="text-3xl font-extrabold mb-2">Dakwah-OS Dashboard</h1>
                        <p className="text-slate-400 max-w-xl">
                            Pusat kendali utama operasional internal SKI. Kelola agenda, pantau performa pengurus secara real-time, dan distribusikan absensi digital (QR Code).
                        </p>
                        
                        {activeKabinet && (
                            <div className="mt-6 flex items-center gap-3 bg-slate-800/50 w-fit px-4 py-2.5 rounded-xl border border-slate-700 backdrop-blur-sm">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                <span className="font-medium">Kabinet Aktif: <strong className="text-sky-400">{activeKabinet.name} ({activeKabinet.period})</strong></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm w-fit">
                    <button 
                        onClick={() => setActiveTab("acara")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "acara" ? "bg-slate-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        <Calendar size={18} /> Agenda & QR Code
                    </button>
                    <button 
                        onClick={() => setActiveTab("evaluasi")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "evaluasi" ? "bg-slate-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        <Activity size={18} /> Evaluasi Performa (KPI)
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-sky-500" size={40} />
                    </div>
                ) : (
                    <>
                        {/* ================= TAB 1: ACARA & QR CODE ================= */}
                        {activeTab === "acara" && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Daftar Agenda Internal</h2>
                                        <p className="text-gray-500 text-sm">Buat acara untuk diakses di Portal Anggota</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowAcaraModal(true)}
                                        className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all"
                                    >
                                        <Plus size={18} /> Tambah Agenda Baru
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {acaras.map(acara => (
                                        <div key={acara.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">{acara.title}</h3>
                                            <div className="text-sm text-gray-500 space-y-1.5 mb-6">
                                                <p className="flex items-center gap-2"><Clock size={14} className="text-sky-500"/> {new Date(acara.start_time).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(acara.start_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</p>
                                                {acara.location && <p className="flex items-center gap-2"><span className="text-sky-500 font-bold">@</span> {acara.location}</p>}
                                                <p className="flex items-center gap-2"><Users size={14} className="text-sky-500"/> {acara.absensi_count || 0} orang hadir</p>
                                                <p className="flex items-center gap-2 mt-2">
                                                    Status: <span className={`px-2 py-0.5 rounded text-xs font-bold ${acara.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{acara.status}</span>
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={() => setSelectedQR(acara.jwt_secret_token)}
                                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                                                >
                                                    Tampilkan QR Code
                                                </button>
                                                <Link 
                                                    href={`/admin/admin1/dakwah-os/absensi/${acara.id}`}
                                                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 rounded-xl text-sm transition-colors border border-blue-200 text-center block"
                                                >
                                                    Rekap & Edit Absensi
                                                </Link>
                                                <button 
                                                    onClick={() => handleDeleteAcara(acara.id)}
                                                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 size={16} /> Hapus Acara
                                                </button>
                                                {acara.status !== 'completed' && (
                                                    <button 
                                                        onClick={() => handleSelesaikanAcara(acara.id)}
                                                        className="w-full bg-white hover:bg-gray-50 text-slate-900 border border-slate-200 font-bold py-2.5 rounded-xl text-sm transition-colors"
                                                    >
                                                        Tandai Selesai
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {acaras.length === 0 && (
                                        <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                            <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
                                            <p className="text-gray-500 font-medium">Belum ada agenda internal untuk kabinet ini.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ================= TAB 2: EVALUASI KPI ================= */}
                        {activeTab === "evaluasi" && (
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Evaluasi Keaktifan Pengurus</h2>
                                        <p className="text-gray-500 text-sm mt-1">Dihitung otomatis dari total kehadiran acara internal kabinet.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEvalFilter("ALL")} className={`px-4 py-2 rounded-lg text-sm font-bold ${evalFilter==="ALL"?"bg-slate-900 text-white":"bg-white text-gray-600 border"}`}>Semua</button>
                                        <button onClick={() => setEvalFilter("AMAN/AKTIF")} className={`px-4 py-2 rounded-lg text-sm font-bold ${evalFilter==="AMAN/AKTIF"?"bg-green-500 text-white":"bg-white text-gray-600 border"}`}>Aman</button>
                                        <button onClick={() => setEvalFilter("PERLU EVALUASI")} className={`px-4 py-2 rounded-lg text-sm font-bold ${evalFilter==="PERLU EVALUASI"?"bg-red-500 text-white":"bg-white text-gray-600 border"}`}>Perlu Evaluasi</button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white border-b border-gray-100">
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Pengurus</th>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Divisi & Jabatan</th>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Hadir / Total Acara</th>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Persentase</th>
                                                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Status Evaluasi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {evaluasiList.filter(e => evalFilter === "ALL" || e.status_evaluasi === evalFilter).map((ev, i) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 font-bold text-gray-900">{ev.full_name}</td>
                                                    <td className="p-4 text-sm text-gray-600">
                                                        <span className="font-semibold">{ev.divisi_name || "BPH"}</span><br/>
                                                        <span className="text-xs text-gray-400">{ev.jabatan}</span>
                                                    </td>
                                                    <td className="p-4 text-center text-sm font-medium text-gray-700">{ev.total_hadir} / {ev.total_acara}</td>
                                                    <td className="p-4 text-center">
                                                        <span className="font-extrabold text-lg" style={{ color: ev.persentase_kehadiran >= 75 ? '#22c55e' : '#ef4444' }}>
                                                            {ev.persentase_kehadiran}%
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {ev.status_evaluasi === 'AMAN/AKTIF' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                                                                <CheckCircle size={14} /> {ev.status_evaluasi}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                                                                <AlertCircle size={14} /> {ev.status_evaluasi}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {evaluasiList.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada data evaluasi pengurus.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* MODAL: TAMBAH ACARA */}
                <AnimatePresence>
                    {showAcaraModal && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-slate-900">Buat Agenda Baru</h3>
                                    <button onClick={() => setShowAcaraModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                                </div>
                                <form onSubmit={handleCreateAcara} className="p-6 space-y-4 bg-slate-50">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Judul Agenda</label>
                                        <input required type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" value={newAcara.title} onChange={e => setNewAcara({...newAcara, title: e.target.value})} placeholder="Contoh: Rapat Pleno 1" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Waktu Mulai</label>
                                            <input required type="datetime-local" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm" value={newAcara.start_time} onChange={e => setNewAcara({...newAcara, start_time: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Waktu Selesai</label>
                                            <input required type="datetime-local" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm" value={newAcara.end_time} onChange={e => setNewAcara({...newAcara, end_time: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lokasi</label>
                                        <input type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" value={newAcara.location} onChange={e => setNewAcara({...newAcara, location: e.target.value})} placeholder="Ruang Sekretariat SKI" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload Foto/PDF (Opsional)</label>
                                            <input type="file" accept="image/*,.pdf" className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm bg-white" onChange={async (e) => { if(e.target.files && e.target.files[0]) { const url = await uploadFileToSupabase(e.target.files[0]); setNewAcara({...newAcara, attachment_url: url}); } }} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Link GMeet (Opsional)</label>
                                            <input type="url" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" value={newAcara.meeting_link} onChange={e => setNewAcara({...newAcara, meeting_link: e.target.value})} placeholder="https://meet.google.com/..." />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Deskripsi Acara</label>
                                        <textarea rows={3} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" value={newAcara.description} onChange={e => setNewAcara({...newAcara, description: e.target.value})} placeholder="Deskripsi Singkat" />
                                    </div>
                                    <button disabled={isUploading} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl mt-4 transition-colors disabled:bg-slate-400">{isUploading ? 'Mengunggah...' : 'Generate Acara & QR Code'}</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* MODAL: TAMPILKAN QR */}
                <AnimatePresence>
                    {selectedQR && (
                        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedQR(null)}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white p-12 rounded-[2rem] shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Scan Kehadiran</h3>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Gunakan Scanner di Portal Anggota untuk mencatatkan kehadiran secara otomatis.</p>
                                
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 inline-block mb-8">
                                    <QRCodeSVG value={`${baseUrl}/portal?scan=${selectedQR}`} size={250} level="H" includeMargin={false} fgColor="#0f172a" />
                                    <p className="mt-4 text-xs text-gray-500 break-all font-mono bg-gray-100 p-2 rounded-lg border border-gray-200">
                                        URL SCAN: {baseUrl}/portal?scan={selectedQR}
                                    </p>
                                </div>
                                
                                <div>
                                    <button onClick={() => setSelectedQR(null)} className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-full font-bold transition-colors">Selesai</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>



            </main>
        </div>
    );
}
