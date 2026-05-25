"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
    LogOut, User, Calendar, CheckCircle, 
    Clock, Plus, Briefcase, ChevronRight, Check, X, QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Session {
    id: string;
    full_name: string;
    jabatan: string;
}

interface Event {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    location: string;
    thumbnail_url: string;
    status: string;
}

interface Proker {
    id: string;
    judul: string;
    deskripsi: string;
    status: string;
    created_at: string;
}

export default function PortalDashboard() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Tabs
    const [activeTab, setActiveTab] = useState<"timeline" | "absensi" | "proker">("timeline");
    
    // Data
    const [events, setEvents] = useState<Event[]>([]);
    const [prokers, setProkers] = useState<Proker[]>([]);
    const [todayEvents, setTodayEvents] = useState<Event[]>([]);
    const [attendedEvents, setAttendedEvents] = useState<string[]>([]);
    
    // Form Proker
    const [showProkerForm, setShowProkerForm] = useState(false);
    const [newProker, setNewProker] = useState({ judul: "", deskripsi: "" });
    const [submittingProker, setSubmittingProker] = useState(false);
    const [submittingAbsen, setSubmittingAbsen] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = () => {
            const stored = localStorage.getItem("portal_session");
            if (!stored) {
                router.push("/portal/login");
                return;
            }
            try {
                const parsed = JSON.parse(stored);
                setSession(parsed);
                fetchData(parsed.id);
            } catch (e) {
                router.push("/portal/login");
            }
        };
        checkSession();
    }, []);

    const fetchData = async (pengurusId: string) => {
        setLoading(true);
        try {
            // Fetch events (upcoming)
            const { data: eventsData } = await supabase
                .from("events")
                .select("id, title, start_date, end_date, location, thumbnail_url, status")
                .order("start_date", { ascending: true });
                
            if (eventsData) {
                setEvents(eventsData);
                
                // Find today's events
                const today = new Date().toISOString().split('T')[0];
                const active = eventsData.filter(e => {
                    const eventDate = new Date(e.start_date).toISOString().split('T')[0];
                    return eventDate === today || e.status === "ongoing";
                });
                setTodayEvents(active);
            }

            // Fetch Proker for this user
            const { data: prokerData } = await supabase
                .from("program_kerja")
                .select("*")
                .eq("pengurus_id", pengurusId)
                .order("created_at", { ascending: false });
                
            if (prokerData) {
                setProkers(prokerData);
            }

            // Fetch Absensi for this user
            const { data: absenData } = await supabase
                .from("absensi")
                .select("event_id")
                .eq("pengurus_id", pengurusId);
                
            if (absenData) {
                setAttendedEvents(absenData.map(a => a.event_id));
            }
            
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("portal_session");
        router.push("/portal/login");
    };

    const submitProker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session || !newProker.judul) return;
        
        setSubmittingProker(true);
        try {
            const { error } = await supabase
                .from("program_kerja")
                .insert([{
                    pengurus_id: session.id,
                    judul: newProker.judul,
                    deskripsi: newProker.deskripsi,
                    status: "Rencana"
                }]);
                
            if (error) throw error;
            
            alert("Program kerja berhasil ditambahkan!");
            setShowProkerForm(false);
            setNewProker({ judul: "", deskripsi: "" });
            fetchData(session.id); // refresh data
        } catch (error: any) {
            alert(error.message || "Gagal menambahkan proker");
        } finally {
            setSubmittingProker(false);
        }
    };

    const handleAbsen = async (eventId: string) => {
        if (!session) return;
        setSubmittingAbsen(eventId);
        try {
            const { error } = await supabase
                .from("absensi")
                .insert([{
                    event_id: eventId,
                    pengurus_id: session.id
                }]);
                
            if (error) {
                // Ignore unique constraint violation if they already attended
                if (error.code !== '23505') {
                    throw error;
                }
            }
            
            alert("Berhasil absen!");
            setAttendedEvents([...attendedEvents, eventId]);
        } catch (error: any) {
            alert(error.message || "Gagal melakukan absensi");
        } finally {
            setSubmittingAbsen(null);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    if (loading || !session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                <User className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900 leading-tight">Portal Anggota</h1>
                                <p className="text-xs text-sky-600 font-medium">SKI Telkom Purwokerto</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span className="text-sm font-medium hidden sm:block">Keluar</span>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Profile Card */}
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 md:p-8 shadow-lg mb-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                            <User size={32} />
                        </div>
                        <div>
                            <p className="text-sky-100 text-sm font-medium mb-1">Selamat Datang,</p>
                            <h2 className="text-2xl font-bold">{session.full_name}</h2>
                            <p className="text-white/80 text-sm flex items-center gap-1.5 mt-1">
                                <Briefcase size={14} /> {session.jabatan || "Pengurus SKI"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-8 overflow-x-auto hide-scrollbar">
                    <button 
                        onClick={() => setActiveTab("timeline")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${activeTab === "timeline" ? "bg-sky-50 text-sky-600 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        <Calendar size={18} /> Timeline Acara
                    </button>
                    <button 
                        onClick={() => setActiveTab("absensi")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${activeTab === "absensi" ? "bg-sky-50 text-sky-600 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        <QrCode size={18} /> Absensi Hari-H
                        {todayEvents.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                                {todayEvents.length}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab("proker")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${activeTab === "proker" ? "bg-sky-50 text-sky-600 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        <Briefcase size={18} /> Program Kerja
                    </button>
                </div>

                {/* Content Area */}
                <div className="mt-4">
                    {/* TAB: TIMELINE ACARA */}
                    {activeTab === "timeline" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800">Agenda Kegiatan SKI</h3>
                            
                            {events.length === 0 ? (
                                <div className="bg-white p-8 rounded-2xl text-center border border-gray-100">
                                    <p className="text-gray-500">Belum ada acara yang dijadwalkan.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {events.map((event) => (
                                        <div key={event.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                                {event.thumbnail_url ? (
                                                    <img src={event.thumbnail_url} alt={event.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-sky-50 flex items-center justify-center">
                                                        <Calendar className="text-sky-400" size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2">{event.title}</h4>
                                                <p className="text-xs text-sky-600 font-semibold mt-1 flex items-center gap-1">
                                                    <Clock size={12} /> {formatDate(event.start_date)}
                                                </p>
                                                {event.location && (
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{event.location}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* TAB: ABSENSI */}
                    {activeTab === "absensi" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Absensi Kehadiran</h3>
                                    <p className="text-sm text-gray-500">Absen untuk acara yang berlangsung hari ini</p>
                                </div>
                                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center">
                                    <QrCode size={24} />
                                </div>
                            </div>
                            
                            {todayEvents.length === 0 ? (
                                <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="text-gray-300" size={40} />
                                    </div>
                                    <h4 className="text-gray-800 font-bold text-lg mb-2">Tidak Ada Acara Hari Ini</h4>
                                    <p className="text-gray-500 text-sm">Belum ada acara yang memerlukan absensi hari ini.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {todayEvents.map((event) => {
                                        const isAttended = attendedEvents.includes(event.id);
                                        return (
                                            <div key={event.id} className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500"></div>
                                                
                                                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-sky-500 bg-sky-50 px-2 py-1 rounded-md mb-2 inline-block">
                                                            Acara Hari Ini
                                                        </span>
                                                        <h4 className="font-bold text-gray-900 text-lg">{event.title}</h4>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1.5">
                                                            <Clock size={14} /> {formatDate(event.start_date)}
                                                        </p>
                                                    </div>
                                                    
                                                    {isAttended ? (
                                                        <div className="w-full sm:w-auto bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm">
                                                            <Check size={20} />
                                                            Sudah Hadir
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleAbsen(event.id)}
                                                            disabled={submittingAbsen === event.id}
                                                            className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                                                        >
                                                            {submittingAbsen === event.id ? "Memproses..." : (
                                                                <>
                                                                    <QrCode size={18} />
                                                                    Hadir Sekarang
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* TAB: PROGRAM KERJA */}
                    {activeTab === "proker" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Program Kerja Saya</h3>
                                    <p className="text-sm text-gray-500">Kelola target dan capaian organisasi</p>
                                </div>
                                <button 
                                    onClick={() => setShowProkerForm(true)}
                                    className="bg-sky-500 hover:bg-sky-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {/* Form Tambah Proker (Modal-like inline) */}
                            <AnimatePresence>
                                {showProkerForm && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }} 
                                        animate={{ opacity: 1, height: "auto" }} 
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <form onSubmit={submitProker} className="bg-white p-5 rounded-2xl border border-sky-200 shadow-sm mb-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-sky-800">Tambah Proker Baru</h4>
                                                <button type="button" onClick={() => setShowProkerForm(false)} className="text-gray-400 hover:text-gray-600">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nama Program Kerja</label>
                                                    <input 
                                                        required 
                                                        type="text" 
                                                        value={newProker.judul}
                                                        onChange={e => setNewProker({...newProker, judul: e.target.value})}
                                                        placeholder="Contoh: Rihlah SKI 2025"
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Keterangan / Progress</label>
                                                    <textarea 
                                                        rows={3} 
                                                        value={newProker.deskripsi}
                                                        onChange={e => setNewProker({...newProker, deskripsi: e.target.value})}
                                                        placeholder="Jelaskan detail program kerja..."
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                                                    />
                                                </div>
                                                <div className="flex justify-end">
                                                    <button 
                                                        type="submit"
                                                        disabled={submittingProker}
                                                        className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors"
                                                    >
                                                        {submittingProker ? "Menyimpan..." : "Simpan Proker"}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* List Proker */}
                            {prokers.length === 0 ? (
                                <div className="bg-white p-10 rounded-2xl text-center border border-gray-100 shadow-sm">
                                    <Briefcase className="mx-auto text-gray-300 mb-3" size={32} />
                                    <p className="text-gray-500 text-sm">Belum ada program kerja yang ditambahkan.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {prokers.map((proker) => (
                                        <div key={proker.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center flex-shrink-0 mt-1">
                                                <Briefcase size={16} className="text-sky-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                                    <h4 className="font-bold text-gray-900">{proker.judul}</h4>
                                                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                                        {proker.status}
                                                    </span>
                                                </div>
                                                {proker.deskripsi && (
                                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{proker.deskripsi}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                                                    <Clock size={12} /> Dibuat: {formatDate(proker.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
