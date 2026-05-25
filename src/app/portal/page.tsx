"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
    LogOut, User, Calendar, CheckCircle, 
    Clock, Plus, Briefcase, ChevronRight, Check, X, QrCode, ScanLine, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Session { id: string; full_name: string; jabatan: string; }
interface Acara { id: string; title: string; start_time: string; location: string; status: string; jwt_secret_token: string; }
interface Proker { id: string; judul: string; deskripsi: string; status: string; created_at: string; }

export default function DakwahOSPortal() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"timeline" | "absensi" | "proker">("timeline");
    
    // Data
    const [acaras, setAcaras] = useState<Acara[]>([]);
    const [prokers, setProkers] = useState<Proker[]>([]);
    const [attendedEvents, setAttendedEvents] = useState<string[]>([]);
    
    // Proker Form
    const [showProkerForm, setShowProkerForm] = useState(false);
    const [newProker, setNewProker] = useState({ judul: "", deskripsi: "" });
    const [submittingProker, setSubmittingProker] = useState(false);
    
    // Scanner State
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("portal_session");
        if (!stored) { router.push("/portal/login"); return; }
        try {
            const parsed = JSON.parse(stored);
            setSession(parsed);
            fetchData(parsed.id);
        } catch { router.push("/portal/login"); }
    }, []);

    const fetchData = async (pengurusId: string) => {
        setLoading(true);
        try {
            // Fetch Acara Internal (Dakwah-OS)
            const { data: acaraData } = await supabase.from("acara_internal").select("*").order("start_time", { ascending: true });
            if (acaraData) setAcaras(acaraData);

            // Fetch Proker
            const { data: prokerData } = await supabase.from("program_kerja").select("*").eq("pengurus_id", pengurusId).order("created_at", { ascending: false });
            if (prokerData) setProkers(prokerData);

            // Fetch Absensi Digital
            const { data: absenData } = await supabase.from("absensi_digital").select("acara_id").eq("pengurus_id", pengurusId);
            if (absenData) setAttendedEvents(absenData.map(a => a.acara_id));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initialize Scanner when tab changes to 'absensi' and 'scanning' is true
    useEffect(() => {
        if (activeTab === "absensi" && scanning) {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
            scannerRef.current.render(handleScanSuccess, handleScanFailure);
        } else if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [activeTab, scanning]);

    const handleScanSuccess = async (decodedText: string) => {
        if (verifying) return; // Prevent multiple scans
        
        // Stop scanning
        setScanning(false);
        setVerifying(true);
        
        try {
            // Verifikasi token QR dari tabel acara_internal
            const { data: acara, error: findError } = await supabase
                .from("acara_internal")
                .select("id, title")
                .eq("jwt_secret_token", decodedText)
                .single();
                
            if (findError || !acara) {
                throw new Error("QR Code tidak valid atau acara tidak ditemukan!");
            }
            
            // Catat absensi
            const { error: insertError } = await supabase
                .from("absensi_digital")
                .insert([{ acara_id: acara.id, pengurus_id: session!.id }]);
                
            if (insertError && insertError.code !== '23505') {
                throw insertError;
            }
            
            setScanResult(`Berhasil absen untuk: ${acara.title}`);
            setAttendedEvents([...attendedEvents, acara.id]);
        } catch (error: any) {
            setScanResult(`Gagal: ${error.message}`);
        } finally {
            setVerifying(false);
        }
    };

    const handleScanFailure = (error: any) => {
        // Ignore continuous scan failures (e.g. no QR detected yet)
    };

    const submitProker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || !newProker.judul) return;
        setSubmittingProker(true);
        try {
            const { error } = await supabase.from("program_kerja").insert([{ pengurus_id: session.id, judul: newProker.judul, deskripsi: newProker.deskripsi, status: "Rencana" }]);
            if (error) throw error;
            setShowProkerForm(false);
            setNewProker({ judul: "", deskripsi: "" });
            fetchData(session.id);
        } catch (error: any) { alert(error.message); } 
        finally { setSubmittingProker(false); }
    };

    if (loading || !session) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" size={40} /></div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                            <QrCode className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="font-black text-slate-900 leading-tight tracking-tight">Dakwah-OS</h1>
                            <p className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Portal Pengurus</p>
                        </div>
                    </div>
                    <button onClick={() => { localStorage.removeItem("portal_session"); router.push("/portal/login"); }} className="text-gray-500 hover:bg-slate-100 p-2.5 rounded-xl transition-colors">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Profile */}
                <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl mb-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                            <User size={32} className="text-sky-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-widest">Active Member</p>
                            <h2 className="text-2xl font-black">{session.full_name}</h2>
                            <p className="text-sky-400 text-sm font-bold flex items-center gap-1.5 mt-1">
                                <Briefcase size={14} /> {session.jabatan}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 mb-8">
                    {["timeline", "absensi", "proker"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" : "text-gray-500 hover:bg-slate-50"}`}>
                            {tab === "timeline" && <Calendar size={18} />}
                            {tab === "absensi" && <ScanLine size={18} />}
                            {tab === "proker" && <Briefcase size={18} />}
                            <span className="hidden sm:inline capitalize">{tab}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-4">
                    {/* TAB TIMELINE */}
                    {activeTab === "timeline" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            {acaras.map(acara => {
                                const isAttended = attendedEvents.includes(acara.id);
                                return (
                                    <div key={acara.id} className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900">{acara.title}</h4>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><Clock size={14} className="text-sky-500"/> {new Date(acara.start_time).toLocaleString("id-ID")}</p>
                                        </div>
                                        {isAttended && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                                                <CheckCircle size={14} /> Hadir
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* TAB ABSENSI (QR SCANNER) */}
                    {activeTab === "absensi" && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-center">
                            <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <QrCode className="text-sky-600" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Absensi Digital</h3>
                            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">Arahkan kamera ke QR Code yang ditampilkan oleh Admin untuk mencatatkan kehadiran secara instan.</p>
                            
                            {scanResult ? (
                                <div className={`p-6 rounded-2xl border ${scanResult.includes("Gagal") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"} mb-6`}>
                                    <h4 className="font-bold text-lg mb-2">{scanResult.includes("Gagal") ? "Gagal" : "Berhasil!"}</h4>
                                    <p className="text-sm">{scanResult}</p>
                                    <button onClick={() => { setScanResult(null); setScanning(true); }} className="mt-4 px-6 py-2 bg-white rounded-lg shadow-sm font-bold text-sm">Scan Ulang</button>
                                </div>
                            ) : (
                                <>
                                    {scanning ? (
                                        <div className="max-w-sm mx-auto overflow-hidden rounded-3xl border-4 border-slate-900 shadow-2xl relative">
                                            {verifying && (
                                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                                    <Loader2 className="animate-spin text-sky-500 mb-2" size={32} />
                                                    <p className="font-bold text-slate-900">Memverifikasi QR...</p>
                                                </div>
                                            )}
                                            <div id="reader" className="w-full"></div>
                                            <button onClick={() => setScanning(false)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg z-20">Batal Scan</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setScanning(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 mx-auto">
                                            <ScanLine size={24} /> Buka Kamera Scanner
                                        </button>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* TAB PROKER */}
                    {activeTab === "proker" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200">
                                <h3 className="font-bold text-slate-900 ml-2">Manajemen Proker</h3>
                                <button onClick={() => setShowProkerForm(!showProkerForm)} className="bg-sky-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm">
                                    {showProkerForm ? "Tutup Form" : "Tambah Proker"}
                                </button>
                            </div>
                            
                            <AnimatePresence>
                                {showProkerForm && (
                                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={submitProker} className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                                        <h4 className="font-black text-xl mb-4 text-sky-400">Proker Baru</h4>
                                        <div className="space-y-4 mb-6">
                                            <input required type="text" placeholder="Judul Program Kerja" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500" value={newProker.judul} onChange={e => setNewProker({...newProker, judul: e.target.value})} />
                                            <textarea rows={3} placeholder="Deskripsi atau catatan progress..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500" value={newProker.deskripsi} onChange={e => setNewProker({...newProker, deskripsi: e.target.value})} />
                                        </div>
                                        <button type="submit" disabled={submittingProker} className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-black py-3 rounded-xl disabled:opacity-50">
                                            {submittingProker ? "Menyimpan..." : "Simpan Program Kerja"}
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="grid gap-4">
                                {prokers.map(p => (
                                    <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-900">{p.judul}</h4>
                                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{p.status}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4">{p.deskripsi}</p>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-sky-500 h-full w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
