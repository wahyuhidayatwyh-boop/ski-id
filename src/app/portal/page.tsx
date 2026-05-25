"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
    LogOut, User, Calendar, CheckCircle, Clock, Plus, Briefcase, 
    Check, X, QrCode, ScanLine, Loader2, FileText, Upload, Award, Activity, AlertTriangle, Shield, CheckSquare, Download, Archive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5QrcodeScanner } from "html5-qrcode";

// Interfaces
interface Pengurus { id: string; full_name: string; jabatan: string; role_level: string; photo_url: string; phone_number: string; division_id: string; kabinet_id: string; divisions: { name: string }; kabinets: { name: string, period: string } }
interface Acara { id: string; title: string; start_time: string; location: string; status: string; jwt_secret_token: string; }
interface Proker { id: string; name: string; description: string; status: string; created_at: string; }
interface Task { id: string; title: string; description: string; assigned_to: string | null; is_completed: boolean; pengurus?: { full_name: string } }
interface Kabinet { id: string; name: string; period: string; is_active: boolean; }
interface Document { id: string; title: string; type: string; file_url: string; status: string; uploaded_by: string; created_at: string; pengurus: { full_name: string } }
interface CommitteeRole { id: string; role: string; acara_internal: { title: string, start_time: string } }

export default function DakwahOSPortal() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userAuth, setUserAuth] = useState<any>(null);
    const [pengurus, setPengurus] = useState<Pengurus | null>(null);
    
    // Multi-Kabinet State
    const [kabinets, setKabinets] = useState<Kabinet[]>([]);
    const [selectedKabinetId, setSelectedKabinetId] = useState<string>("");
    const isReadOnly = kabinets.find(k => k.id === selectedKabinetId)?.is_active === false;

    // Tabs: dashboard (KTA & KPI), proker, timeline, dokumen, absensi
    const [activeTab, setActiveTab] = useState<"dashboard" | "proker" | "timeline" | "dokumen" | "absensi">("dashboard");
    
    // Data States
    const [acaras, setAcaras] = useState<Acara[]>([]);
    const [attendedEvents, setAttendedEvents] = useState<string[]>([]);
    const [committeeRoles, setCommitteeRoles] = useState<CommitteeRole[]>([]);
    const [prokers, setProkers] = useState<Proker[]>([]);
    const [tasks, setTasks] = useState<Record<string, Task[]>>({}); // proker_id -> tasks
    const [staffList, setStaffList] = useState<{id: string, full_name: string}[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    
    // Form States
    const [showProkerForm, setShowProkerForm] = useState(false);
    const [newProker, setNewProker] = useState({ name: "", description: "" });
    const [newTask, setNewTask] = useState({ proker_id: "", title: "", description: "", assigned_to: "" });
    const [showTaskForm, setShowTaskForm] = useState<string | null>(null); // proker_id
    const [docUpload, setDocUpload] = useState({ title: "", type: "proposal", file_url: "" });
    const [showDocForm, setShowDocForm] = useState(false);

    // Profile Edit
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editProfileData, setEditProfileData] = useState({ phone_number: "", photo_url: "" });

    // Scanner
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (pengurus && selectedKabinetId) {
            fetchDashboardData(selectedKabinetId);
        }
    }, [pengurus, selectedKabinetId]);

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/portal/login");
            return;
        }
        setUserAuth(session.user);
        
        // Ambil data pengurus yang sinkron
        const { data: pData, error } = await supabase
            .from("pengurus")
            .select("*, divisions(name), kabinets(name, period)")
            .eq("user_id", session.user.id)
            .single();

        if (error || !pData) {
            alert("Akun Anda belum tersinkronisasi dengan data Pengurus. Anda mengakses sebagai Anggota Umum.");
            // Handle regular member or redirect
            router.push("/");
            return;
        }

        setPengurus(pData);
        setEditProfileData({ phone_number: pData.phone_number || "", photo_url: pData.photo_url || "" });
        
        // Ambil daftar kabinet untuk dropdown
        const { data: kData } = await supabase.from("kabinets").select("*").order("created_at", { ascending: false });
        if (kData) {
            setKabinets(kData);
            const active = kData.find(k => k.is_active);
            if (active) setSelectedKabinetId(active.id);
            else if (kData.length > 0) setSelectedKabinetId(kData[0].id);
        }

        // Jika Koordinator, ambil daftar staff di divisinya
        if (["ketuum", "wakil", "div_ketua", "lso_ketua"].includes(pData.role_level)) {
            const { data: staffData } = await supabase.from("pengurus").select("id, full_name").eq("division_id", pData.division_id).eq("kabinet_id", pData.kabinet_id);
            if (staffData) setStaffList(staffData);
        }
    };

    const fetchDashboardData = async (kabinet_id: string) => {
        setLoading(true);
        try {
            // Acara Internal
            const { data: aData } = await supabase.from("acara_internal").select("*").eq("kabinet_id", kabinet_id).order("start_time", { ascending: true });
            if (aData) setAcaras(aData);

            // Absensi untuk KPI
            const { data: abData } = await supabase.from("absensi_digital").select("acara_id").eq("pengurus_id", pengurus!.id);
            if (abData) setAttendedEvents(abData.map(a => a.acara_id));

            // Committee Roles (Log Peran)
            const { data: crData } = await supabase.from("committee_roles").select("id, role, acara_internal(title, start_time)").eq("pengurus_id", pengurus!.id);
            if (crData) setCommitteeRoles(crData as any);

            // Prokers
            let prokerQuery = supabase.from("prokers").select("*").eq("kabinet_id", kabinet_id);
            if (pengurus!.division_id) prokerQuery = prokerQuery.eq("division_id", pengurus!.division_id);
            const { data: prData } = await prokerQuery.order("created_at", { ascending: false });
            
            if (prData) {
                setProkers(prData);
                // Fetch tasks for these prokers
                const prokerIds = prData.map(p => p.id);
                if (prokerIds.length > 0) {
                    const { data: tData } = await supabase.from("proker_tasks").select("*, pengurus(full_name)").in("proker_id", prokerIds).order("created_at", { ascending: true });
                    if (tData) {
                        const taskMap: Record<string, Task[]> = {};
                        tData.forEach(t => {
                            if (!taskMap[t.proker_id]) taskMap[t.proker_id] = [];
                            taskMap[t.proker_id].push(t);
                        });
                        setTasks(taskMap);
                    }
                }
            }

            // Documents Vault
            const { data: docData } = await supabase.from("documents").select("*, pengurus(full_name)").eq("kabinet_id", kabinet_id).order("created_at", { ascending: false });
            if (docData) setDocuments(docData as any);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const isCoordinator = pengurus && ["ketuum", "wakil", "div_ketua", "lso_ketua"].includes(pengurus.role_level);

    // KPI Calculation
    const totalAcara = acaras.length;
    const hadirCount = attendedEvents.length;
    const kpiPercentage = totalAcara === 0 ? 100 : Math.round((hadirCount / totalAcara) * 100);
    const kpiStatus = kpiPercentage >= 75 ? "AMAN / AKTIF" : "PERLU EVALUASI / KURANG DISIPLIN";
    const kpiColor = kpiPercentage >= 75 ? "text-green-500" : "text-red-500";
    const kpiBg = kpiPercentage >= 75 ? "bg-green-500" : "bg-red-500";

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/portal/login");
    };

    const saveProfileEdit = async () => {
        if (!pengurus) return;
        const { error } = await supabase.from("pengurus").update({ phone_number: editProfileData.phone_number, photo_url: editProfileData.photo_url }).eq("id", pengurus.id);
        if (!error) {
            setPengurus({ ...pengurus, phone_number: editProfileData.phone_number, photo_url: editProfileData.photo_url });
            setIsEditingProfile(false);
        } else alert("Gagal update profil.");
    };

    // PROKER ACTION
    const submitProker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProker.name || isReadOnly) return;
        const { error } = await supabase.from("prokers").insert([{ kabinet_id: pengurus!.kabinet_id, division_id: pengurus!.division_id, name: newProker.name, description: newProker.description }]);
        if (!error) {
            setShowProkerForm(false);
            setNewProker({ name: "", description: "" });
            fetchDashboardData(selectedKabinetId);
        }
    };

    const submitTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title || isReadOnly) return;
        const { error } = await supabase.from("proker_tasks").insert([{ proker_id: newTask.proker_id, title: newTask.title, description: newTask.description, assigned_to: newTask.assigned_to || null }]);
        if (!error) {
            setShowTaskForm(null);
            setNewTask({ proker_id: "", title: "", description: "", assigned_to: "" });
            fetchDashboardData(selectedKabinetId);
            
            // Auto Email Reminder (Mock API Call for Email Notification)
            if (newTask.assigned_to) {
                const staff = staffList.find(s => s.id === newTask.assigned_to);
                if (staff) {
                    fetch("/api/send-email", {
                        method: "POST",
                        body: JSON.stringify({
                            to: "mock-email@example.com", // In real app, fetch staff's email from auth.users
                            subject: `Tugas Baru: ${newTask.title}`,
                            body: `Anda mendapatkan tugas baru dari Koordinator Divisi untuk proker terkait. Segera cek Dakwah-OS Portal.`
                        })
                    }).catch(console.error);
                }
            }
        }
    };

    const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
        if (isReadOnly) return;
        const { error } = await supabase.from("proker_tasks").update({ is_completed: !currentStatus }).eq("id", taskId);
        if (!error) fetchDashboardData(selectedKabinetId);
    };

    // DOCUMENT ACTION
    const submitDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docUpload.title || !docUpload.file_url || isReadOnly) return;
        const { error } = await supabase.from("documents").insert([{ 
            kabinet_id: pengurus!.kabinet_id, 
            division_id: pengurus!.division_id,
            title: docUpload.title,
            type: docUpload.type,
            file_url: docUpload.file_url,
            uploaded_by: pengurus!.id
        }]);
        if (!error) {
            setShowDocForm(false);
            setDocUpload({ title: "", type: "proposal", file_url: "" });
            fetchDashboardData(selectedKabinetId);
        }
    };

    // QR SCANNER LOGIC
    useEffect(() => {
        if (activeTab === "absensi" && scanning && !isReadOnly) {
            scannerRef.current = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scannerRef.current.render(
                async (decodedText) => {
                    if (verifying) return;
                    setScanning(false);
                    setVerifying(true);
                    try {
                        const { data: acara, error: findError } = await supabase.from("acara_internal").select("id, title").eq("jwt_secret_token", decodedText).eq("status", "live").single();
                        if (findError || !acara) throw new Error("QR Code tidak valid atau acara belum LIVE!");
                        
                        const { error: insertError } = await supabase.from("absensi_digital").insert([{ acara_id: acara.id, pengurus_id: pengurus!.id }]);
                        if (insertError && insertError.code !== '23505') throw insertError;
                        
                        setScanResult(`Berhasil absen untuk: ${acara.title}`);
                        fetchDashboardData(selectedKabinetId);
                    } catch (error: any) {
                        setScanResult(`Gagal: ${error.message}`);
                    } finally {
                        setVerifying(false);
                    }
                },
                () => {}
            );
        } else if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        return () => { if (scannerRef.current) scannerRef.current.clear().catch(console.error); };
    }, [activeTab, scanning, isReadOnly]);

    if (loading && !pengurus) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" size={40} /></div>;
    if (!pengurus) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Navbar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                            <Shield className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="font-black text-slate-900 leading-tight tracking-tight">Dakwah-OS</h1>
                            <p className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Portal Pengurus</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <select 
                            value={selectedKabinetId} 
                            onChange={(e) => setSelectedKabinetId(e.target.value)}
                            className={`text-sm font-bold border-none rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer ${isReadOnly ? 'bg-amber-100 text-amber-700' : 'bg-sky-50 text-sky-700'}`}
                        >
                            {kabinets.map(k => (
                                <option key={k.id} value={k.id}>{k.name} {k.period} {k.is_active ? '(Aktif)' : '(Arsip)'}</option>
                            ))}
                        </select>
                        <button onClick={handleLogout} className="text-slate-500 hover:bg-slate-100 p-2.5 rounded-xl transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {isReadOnly && (
                <div className="bg-amber-50 border-b border-amber-200 py-2">
                    <p className="text-center text-sm font-bold text-amber-700 flex justify-center items-center gap-2">
                        <Archive size={16} /> Mode Arsip Sejarah (Read-Only)
                    </p>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                
                {/* Tabs */}
                <div className="flex overflow-x-auto hide-scrollbar bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 mb-8">
                    {[
                        { id: "dashboard", icon: <User size={18} />, label: "Dashboard & KTA" },
                        { id: "proker", icon: <CheckSquare size={18} />, label: "Proker Divisi" },
                        { id: "timeline", icon: <Calendar size={18} />, label: "Timeline" },
                        { id: "dokumen", icon: <FileText size={18} />, label: "Vault Proposal" },
                        { id: "absensi", icon: <ScanLine size={18} />, label: "Scan Absen" }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-none sm:flex-1 flex items-center justify-center gap-2 py-3.5 px-6 sm:px-4 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
                            {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-4">
                    
                    {/* TAB DASHBOARD: KTA & KPI */}
                    {activeTab === "dashboard" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* KTA Digital */}
                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-sky-500 to-blue-700 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/20">KTA Digital</div>
                                        <Shield size={24} className="opacity-50" />
                                    </div>
                                    <div className="flex flex-col items-center text-center relative z-10">
                                        <div className="w-24 h-24 bg-white/20 p-1 rounded-full mb-4">
                                            <div className="w-full h-full bg-slate-300 rounded-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${pengurus.photo_url || 'https://via.placeholder.com/150'})` }} />
                                        </div>
                                        <h2 className="text-2xl font-black mb-1">{pengurus.full_name}</h2>
                                        <p className="text-sky-200 font-bold text-sm mb-4">{pengurus.jabatan} • {pengurus.divisions?.name}</p>
                                        <div className="w-full bg-black/20 rounded-xl p-4 border border-white/10 text-left">
                                            <p className="text-xs text-white/70 mb-1 font-medium">Kabinet</p>
                                            <p className="text-sm font-bold mb-3">{pengurus.kabinets?.name} ({pengurus.kabinets?.period})</p>
                                            <p className="text-xs text-white/70 mb-1 font-medium">WhatsApp</p>
                                            <p className="text-sm font-bold">{pengurus.phone_number || "-"}</p>
                                        </div>
                                        {!isReadOnly && (
                                            <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="mt-4 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors w-full border border-white/10">Edit Profil Data</button>
                                        )}
                                    </div>
                                </div>

                                {isEditingProfile && !isReadOnly && (
                                    <div className="mt-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold mb-3 text-slate-800">Edit Data Diri</h4>
                                        <input type="text" placeholder="No. WhatsApp" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium mb-3 focus:outline-none focus:border-sky-500" value={editProfileData.phone_number} onChange={e => setEditProfileData({...editProfileData, phone_number: e.target.value})} />
                                        <input type="text" placeholder="URL Foto Profil" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium mb-3 focus:outline-none focus:border-sky-500" value={editProfileData.photo_url} onChange={e => setEditProfileData({...editProfileData, photo_url: e.target.value})} />
                                        <button onClick={saveProfileEdit} className="w-full bg-slate-900 text-white font-bold text-sm py-2 rounded-lg">Simpan Perubahan</button>
                                    </div>
                                )}
                            </div>

                            {/* KPI & Log */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Widget KPI */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600"><Activity size={20} /></div>
                                        <div>
                                            <h3 className="font-black text-slate-900">Grafik Kehadiran (KPI)</h3>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluasi Kedisiplinan</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className={`${kpiColor}`} strokeDasharray={`${kpiPercentage}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <div className="absolute text-3xl font-black text-slate-800">{kpiPercentage}%</div>
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Hadir</p>
                                                    <p className="text-xl font-black text-slate-900">{hadirCount}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Acara</p>
                                                    <p className="text-xl font-black text-slate-900">{totalAcara}</p>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-3 rounded-xl font-black text-sm flex items-center justify-center sm:justify-start gap-2 ${kpiPercentage >= 75 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                {kpiPercentage >= 75 ? <Shield size={16} /> : <AlertTriangle size={16} />}
                                                STATUS: {kpiStatus}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Log Record Peran */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><Award size={20} /></div>
                                        <div>
                                            <h3 className="font-black text-slate-900">Riwayat Kepanitiaan</h3>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Log Peran Pengurus</p>
                                        </div>
                                    </div>
                                    {committeeRoles.length > 0 ? (
                                        <div className="space-y-3">
                                            {committeeRoles.map(cr => (
                                                <div key={cr.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-sm">{cr.acara_internal?.title}</h4>
                                                        <p className="text-xs font-medium text-slate-500">{new Date(cr.acara_internal?.start_time).toLocaleDateString("id-ID")}</p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 uppercase">{cr.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-sm font-bold text-slate-400">Belum ada riwayat kepanitiaan</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB PROKER (KOORDINATOR VS STAFF) */}
                    {activeTab === "proker" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <div>
                                    <h3 className="font-black text-slate-900">Manajemen Proker {pengurus.divisions?.name}</h3>
                                    <p className="text-sm font-medium text-slate-500">{isCoordinator ? 'Kontrol Penuh Koordinator' : 'Tampilan Staff'}</p>
                                </div>
                                {isCoordinator && !isReadOnly && (
                                    <button onClick={() => setShowProkerForm(!showProkerForm)} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-800 flex items-center gap-2">
                                        <Plus size={16} /> <span className="hidden sm:inline">Tambah Proker</span>
                                    </button>
                                )}
                            </div>
                            
                            <AnimatePresence>
                                {showProkerForm && isCoordinator && !isReadOnly && (
                                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={submitProker} className="bg-sky-50 p-6 rounded-2xl border border-sky-100 overflow-hidden">
                                        <h4 className="font-black text-sky-900 mb-4">Buat Program Kerja Baru</h4>
                                        <div className="grid gap-4 mb-4">
                                            <input required type="text" placeholder="Nama Proker" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500" value={newProker.name} onChange={e => setNewProker({...newProker, name: e.target.value})} />
                                            <textarea rows={2} placeholder="Deskripsi Singkat" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500" value={newProker.description} onChange={e => setNewProker({...newProker, description: e.target.value})} />
                                        </div>
                                        <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-colors">Simpan Proker</button>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="grid gap-6">
                                {prokers.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
                                        <p className="font-bold text-slate-400">Belum ada Program Kerja di divisi ini.</p>
                                    </div>
                                )}
                                {prokers.map(p => (
                                    <div key={p.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-xl text-slate-900">{p.name}</h4>
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 px-3 py-1 rounded-full">{p.status}</span>
                                            </div>
                                            <p className="text-slate-500 text-sm font-medium">{p.description}</p>
                                        </div>
                                        
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2"><CheckSquare size={16} className="text-sky-500" /> Sub-Tugas (Checklist)</h5>
                                                {isCoordinator && !isReadOnly && (
                                                    <button onClick={() => setShowTaskForm(showTaskForm === p.id ? null : p.id)} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                                                        <Plus size={14} /> Tambah Tugas
                                                    </button>
                                                )}
                                            </div>

                                            {showTaskForm === p.id && isCoordinator && !isReadOnly && (
                                                <form onSubmit={submitTask} className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                                                        <input required type="text" placeholder="Judul Tugas" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value, proker_id: p.id})} />
                                                        <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}>
                                                            <option value="">-- Tugaskan ke Staff --</option>
                                                            {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                                                        </select>
                                                    </div>
                                                    <input type="text" placeholder="Catatan/Deskripsi..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium mb-3" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                                                    <div className="flex gap-2">
                                                        <button type="submit" className="bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-lg">Berikan Tugas</button>
                                                        <button type="button" onClick={() => setShowTaskForm(null)} className="bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg">Batal</button>
                                                    </div>
                                                </form>
                                            )}

                                            <div className="space-y-2">
                                                {!tasks[p.id] || tasks[p.id].length === 0 ? (
                                                    <p className="text-xs font-medium text-slate-400 italic">Belum ada tugas yang dibagikan.</p>
                                                ) : (
                                                    tasks[p.id].map(t => {
                                                        const isMine = t.assigned_to === pengurus.id;
                                                        const canCheck = (isMine || isCoordinator) && !isReadOnly;
                                                        return (
                                                            <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border ${t.is_completed ? 'bg-green-50/50 border-green-100' : isMine ? 'bg-sky-50/50 border-sky-100' : 'bg-white border-slate-100'}`}>
                                                                <button disabled={!canCheck} onClick={() => toggleTaskCompletion(t.id, t.is_completed)} className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors ${t.is_completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-transparent hover:border-sky-400'} ${!canCheck && 'opacity-50 cursor-not-allowed'}`}>
                                                                    <Check size={12} strokeWidth={4} />
                                                                </button>
                                                                <div className="flex-1">
                                                                    <p className={`text-sm font-bold ${t.is_completed ? 'text-green-800 line-through opacity-70' : 'text-slate-800'}`}>{t.title}</p>
                                                                    {t.description && <p className={`text-xs mt-0.5 ${t.is_completed ? 'text-green-600/70' : 'text-slate-500'}`}>{t.description}</p>}
                                                                </div>
                                                                {t.pengurus && (
                                                                    <div className="flex-shrink-0">
                                                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${isMine ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{t.pengurus.full_name.split(' ')[0]}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* TAB TIMELINE */}
                    {activeTab === "timeline" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2"><Calendar size={20} className="text-sky-500"/> Timeline & Agenda Organisasi</h3>
                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
                                {acaras.map((acara, idx) => (
                                    <div key={acara.id} className="relative pl-6">
                                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${acara.status === 'live' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : acara.status === 'finished' ? 'bg-green-500' : 'bg-sky-400'}`}></div>
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-lg text-slate-900">{acara.title}</h4>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${acara.status === 'live' ? 'bg-red-100 text-red-700 animate-pulse' : acara.status === 'finished' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'}`}>{acara.status}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-4">
                                                <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400"/> {new Date(acara.start_time).toLocaleString("id-ID")}</span>
                                                <span className="flex items-center gap-1.5"><Shield size={14} className="text-slate-400"/> {acara.location}</span>
                                            </p>
                                            
                                            {/* Automated Reminder Info UI */}
                                            {isCoordinator && acara.status === 'upcoming' && (
                                                <div className="mt-4 pt-4 border-t border-slate-200">
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Activity size={12}/> Automated Reminders Status</p>
                                                    <div className="flex gap-2">
                                                        <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold border border-green-100">H-30 Sent</span>
                                                        <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] font-bold border border-amber-100">H-14 Pending</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* TAB DOKUMEN (VAULT PROPOSAL) */}
                    {activeTab === "dokumen" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <div>
                                    <h3 className="font-black text-slate-900">Digital Vault</h3>
                                    <p className="text-sm font-medium text-slate-500">Proposal Triwulan & LPJ</p>
                                </div>
                                {isCoordinator && !isReadOnly && (
                                    <button onClick={() => setShowDocForm(!showDocForm)} className="bg-sky-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-sky-600 flex items-center gap-2">
                                        <Upload size={16} /> <span className="hidden sm:inline">Unggah Dokumen</span>
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {showDocForm && isCoordinator && !isReadOnly && (
                                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={submitDocument} className="bg-slate-900 p-6 rounded-2xl overflow-hidden shadow-xl">
                                        <h4 className="font-black text-sky-400 mb-4 flex items-center gap-2"><Upload size={18}/> Unggah Proposal/LPJ</h4>
                                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                            <input required type="text" placeholder="Judul Dokumen (Misal: Proposal Triwulan 1)" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-sky-500" value={docUpload.title} onChange={e => setDocUpload({...docUpload, title: e.target.value})} />
                                            <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-sky-500" value={docUpload.type} onChange={e => setDocUpload({...docUpload, type: e.target.value})}>
                                                <option value="proposal">Proposal Triwulan</option>
                                                <option value="lpj">Lembar Pertanggungjawaban (LPJ)</option>
                                            </select>
                                        </div>
                                        <input required type="text" placeholder="URL File (Gunakan Google Drive Link)" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-medium mb-4 focus:outline-none focus:border-sky-500" value={docUpload.file_url} onChange={e => setDocUpload({...docUpload, file_url: e.target.value})} />
                                        <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-black px-6 py-3 rounded-xl text-sm transition-colors">Submit ke Flow Approval</button>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                                <div className="space-y-4">
                                    {documents.length === 0 && <p className="text-center text-slate-400 font-bold py-8">Belum ada dokumen arsip.</p>}
                                    {documents.map(doc => (
                                        <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4 hover:border-sky-200 hover:bg-sky-50/50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 flex-shrink-0"><FileText size={20}/></div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{doc.title}</h4>
                                                    <p className="text-xs font-medium text-slate-500 mt-1">Oleh: {doc.pengurus?.full_name} • {new Date(doc.created_at).toLocaleDateString("id-ID")}</p>
                                                    
                                                    {/* Approval Flow Visualizer */}
                                                    <div className="flex items-center gap-1 mt-3">
                                                        <span className={`h-1.5 w-8 rounded-full ${['draft', 'reviewed_bendahara', 'reviewed_sekretaris', 'approved'].includes(doc.status) ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                                        <span className={`h-1.5 w-8 rounded-full ${['reviewed_bendahara', 'reviewed_sekretaris', 'approved'].includes(doc.status) ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                                        <span className={`h-1.5 w-8 rounded-full ${['reviewed_sekretaris', 'approved'].includes(doc.status) ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                                        <span className={`h-1.5 w-8 rounded-full ${['approved'].includes(doc.status) ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase ml-2">{doc.status.replace('_', ' ')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:text-sky-600 hover:border-sky-200 transition-colors">
                                                <Download size={16} /> Buka File
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB ABSENSI (SCANNER) */}
                    {activeTab === "absensi" && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/30">
                                <QrCode className="text-white" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Absensi Kehadiran Real-time</h3>
                            <p className="text-slate-500 text-sm font-medium mb-8 max-w-md mx-auto">Arahkan kamera ke layar QR Code pada acara yang berstatus "LIVE" untuk mencatatkan kehadiran di sistem KPI.</p>
                            
                            {isReadOnly ? (
                                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 font-bold text-slate-500">
                                    Fitur Scanner Dinonaktifkan pada Mode Arsip (Kabinet Tidak Aktif)
                                </div>
                            ) : scanResult ? (
                                <div className={`p-6 rounded-2xl border ${scanResult.includes("Gagal") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"} mb-6`}>
                                    <h4 className="font-black text-lg mb-2 flex justify-center items-center gap-2">
                                        {scanResult.includes("Gagal") ? <X size={20}/> : <CheckCircle size={20}/>}
                                        {scanResult.includes("Gagal") ? "Scan Gagal" : "Absensi Berhasil!"}
                                    </h4>
                                    <p className="text-sm font-medium">{scanResult}</p>
                                    <button onClick={() => { setScanResult(null); setScanning(true); }} className="mt-4 px-6 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-50">Scan Ulang</button>
                                </div>
                            ) : (
                                <>
                                    {scanning ? (
                                        <div className="max-w-sm mx-auto overflow-hidden rounded-3xl border-[6px] border-slate-900 shadow-2xl relative">
                                            {verifying && (
                                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                                    <Loader2 className="animate-spin text-sky-500 mb-3" size={40} />
                                                    <p className="font-black text-slate-900">Memverifikasi Token...</p>
                                                </div>
                                            )}
                                            <div id="reader" className="w-full"></div>
                                            <button onClick={() => setScanning(false)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-full font-black text-sm shadow-xl shadow-red-500/30 z-20">Batal Scan</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setScanning(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:shadow-2xl transition-all flex items-center justify-center gap-3 mx-auto">
                                            <ScanLine size={24} /> Buka Kamera Scanner
                                        </button>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
}
