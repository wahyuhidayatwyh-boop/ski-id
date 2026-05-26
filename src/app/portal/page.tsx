"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
    LogOut, User, Calendar, CheckCircle, Clock, Plus, Briefcase, 
    Check, X, QrCode, ScanLine, Loader2, FileText, Upload, Award, Activity, AlertTriangle, Shield, CheckSquare, Download, Archive, ChevronLeft, Users, FileCheck, Info, Camera, Phone, Mail, Edit, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import Image from "next/image";

// Interfaces
interface Pengurus { id: string; full_name: string; jabatan: string; role_level: string; photo_url: string; phone_number: string; division_id: string; kabinet_id: string; divisions: { id: string, name: string, description: string, icon: string, hero_image_url: string, vision: string, mission: string }; kabinets: { name: string, period: string } }
interface Acara { id: string; proker_id: string; title: string; description: string; start_time: string; location: string; status: string; jwt_secret_token: string; prokers?: { name: string } }
interface Proker { id: string; division_id: string; name: string; description: string; image_url: string; status: string; created_at: string; }
interface Task { id: string; proker_id: string; title: string; description: string; assigned_to: string | null; is_completed: boolean; pengurus?: { full_name: string }; prokers?: { name: string } }
interface Kabinet { id: string; name: string; period: string; is_active: boolean; }
interface Document { id: string; title: string; type: string; file_url: string; status: string; uploaded_by: string; created_at: string; pengurus?: { full_name: string } }
interface DivisionData { id: string; name: string; description: string; icon: string; hero_image_url: string; vision: string; mission: string; coordinator?: { photo_url: string, full_name: string, jabatan: string }; staffs: { photo_url: string, full_name: string, jabatan: string }[] }

export default function DakwahOSPortal() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [pengurus, setPengurus] = useState<Pengurus | null>(null);
    
    // Multi-Kabinet State
    const [kabinets, setKabinets] = useState<Kabinet[]>([]);
    const [selectedKabinetId, setSelectedKabinetId] = useState<string>("");
    const isReadOnly = kabinets.find(k => k.id === selectedKabinetId)?.is_active === false;

    // View States
    const [activeTab, setActiveTab] = useState<"dashboard" | "divisi" | "vault">("dashboard");
    const [activeDivisiId, setActiveDivisiId] = useState<string | null>(null);
    const [divisiSubTab, setDivisiSubTab] = useState<"profil" | "proker" | "acara">("profil");
    
    // Data States
    const [allDivisions, setAllDivisions] = useState<DivisionData[]>([]);
    const [acaras, setAcaras] = useState<Acara[]>([]);
    const [attendedEvents, setAttendedEvents] = useState<Record<string, string>>({}); // acara_id -> status (hadir/izin/dll)
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [prokers, setProkers] = useState<Proker[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [staffPerformance, setStaffPerformance] = useState<{name: string, total: number, done: number, kpi: number}[]>([]);
    
    // Form States
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editProfileData, setEditProfileData] = useState({ phone_number: "", photo_url: "" });
    const [showProkerForm, setShowProkerForm] = useState(false);
    const [newProker, setNewProker] = useState({ name: "", description: "", image_url: "" });
    const [showTaskForm, setShowTaskForm] = useState<string | null>(null); // proker_id
    const [newTask, setNewTask] = useState({ proker_id: "", title: "", description: "", assigned_to: "" });
    const [showDocForm, setShowDocForm] = useState(false);
    const [docUpload, setDocUpload] = useState({ title: "", type: "proposal", file_url: "" });

    // Edit Division & Proker States
    const [isEditingDivision, setIsEditingDivision] = useState(false);
    const [editDivisionData, setEditDivisionData] = useState({ description: "", hero_image_url: "", vision: "", mission: "" });
    const [editingProkerId, setEditingProkerId] = useState<string | null>(null);
    const [editProkerData, setEditProkerData] = useState({ name: "", description: "", image_url: "" });

    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

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

    const LOGO_URL = "/Logo SKI TEL-U P.png";

    useEffect(() => { checkSession(); }, []);
    useEffect(() => { if (pengurus && selectedKabinetId) fetchDashboardData(selectedKabinetId); }, [pengurus, selectedKabinetId]);

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push("/portal/login"); return; }
        
        const { data: pData, error } = await supabase
            .from("pengurus")
            .select("*, divisions(*), kabinets(*)")
            .eq("user_id", session.user.id)
            .single();

        if (error || !pData) {
            alert("Akun Anda belum tersinkronisasi. Silakan hubungi Admin.");
            router.push("/");
            return;
        }

        setPengurus(pData);
        setEditProfileData({ phone_number: pData.phone_number || "", photo_url: pData.photo_url || "" });
        
        const { data: kData } = await supabase.from("kabinets").select("*").order("created_at", { ascending: false });
        if (kData) {
            setKabinets(kData);
            const active = kData.find(k => k.is_active);
            if (active) setSelectedKabinetId(active.id);
            else if (kData.length > 0) setSelectedKabinetId(kData[0].id);
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

            // Fetch Acara
            const { data: aData, error: aError } = await supabase.from("acara_internal").select("*").eq("kabinet_id", kabinet_id).order("start_time", { ascending: true });
            if (aData) setAcaras(aData);
            if (aError) console.error("Acara Error:", aError);

            // Fetch Absensi for KPI & Detail
            const { data: abData } = await supabase.from("absensi_digital").select("acara_id, status").eq("pengurus_id", pengurus!.id);
            if (abData) {
                const attnMap: Record<string, string> = {};
                abData.forEach(a => attnMap[a.acara_id] = a.status);
                setAttendedEvents(attnMap);
            }

            // Fetch My Tasks
            const { data: myTData, error: tError } = await supabase.from("proker_tasks").select("*").eq("assigned_to", pengurus!.id);
            if (myTData) setMyTasks(myTData as any);
            if (tError) console.error("Task Error:", tError);

            // Fetch Prokers for Active Division (or all if needed, but let's fetch all for this kabinet)
            const { data: prData } = await supabase.from("prokers").select("*").eq("kabinet_id", kabinet_id).order("created_at", { ascending: false });
            if (prData) {
                setProkers(prData);
                const prokerIds = prData.map(p => p.id);
                if (prokerIds.length > 0) {
                    const { data: tData } = await supabase.from("proker_tasks").select("*, pengurus(full_name)").in("proker_id", prokerIds);
                    if (tData) setAllTasks(tData);
                    
                    // If Coordinator, calculate staff performance for their division
                    if (isCoordinator) {
                        const divStaff = await supabase.from("pengurus").select("id, full_name, role_level").eq("division_id", pengurus!.division_id);
                        if (divStaff.data) {
                            // Exclude themselves or other coordinators from the "staff performance" view, only show subordinates
                            const subordinates = divStaff.data.filter(s => !["ketuum", "div_ketua", "lso_ketua"].includes(s.role_level));
                            const perf = subordinates.map(staff => {
                                const sTasks = (tData ?? []).filter(t => t.assigned_to === staff.id);
                                const done = sTasks.filter(t => t.is_completed).length;
                                return {
                                    name: staff.full_name,
                                    total: sTasks.length,
                                    done: done,
                                    kpi: sTasks.length > 0 ? Math.round((done / sTasks.length) * 100) : 100
                                };
                            });
                            setStaffPerformance(perf);
                        }
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
    const hadirCount = Object.values(attendedEvents).filter(s => s === 'hadir').length;
    const kpiPercentage = totalAcara === 0 ? 100 : Math.round((hadirCount / totalAcara) * 100);
    const kpiStatus = kpiPercentage >= 75 ? "AMAN / AKTIF" : "PERLU EVALUASI / KURANG DISIPLIN";
    const eventToday = acaras.find(a => new Date(a.start_time).toDateString() === new Date().toDateString() && a.status !== 'completed');

    // ACTIONS
    const handleLogout = async () => { await supabase.auth.signOut(); router.push("/portal/login"); };
    
    const saveProfileEdit = async () => {
        if (!pengurus) return;
        await supabase.from("pengurus").update({ phone_number: editProfileData.phone_number, photo_url: editProfileData.photo_url }).eq("id", pengurus.id);
        setPengurus({ ...pengurus, phone_number: editProfileData.phone_number, photo_url: editProfileData.photo_url });
        setIsEditingProfile(false);
    };

    const submitProker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProker.name || isReadOnly || !activeDivisiId) return;
        await supabase.from("prokers").insert([{ kabinet_id: selectedKabinetId, division_id: activeDivisiId, name: newProker.name, description: newProker.description, image_url: newProker.image_url }]);
        setShowProkerForm(false);
        setNewProker({ name: "", description: "", image_url: "" });
        fetchDashboardData(selectedKabinetId);
    };

    const updateProker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProkerId || isReadOnly) return;
        await supabase.from("prokers").update(editProkerData).eq("id", editingProkerId);
        setEditingProkerId(null);
        fetchDashboardData(selectedKabinetId);
    };

    const deleteProker = async (id: string) => {
        if (isReadOnly || !confirm("Yakin ingin menghapus program kerja ini beserta semua data turunannya?")) return;
        await supabase.from("prokers").delete().eq("id", id);
        fetchDashboardData(selectedKabinetId);
    };

    const saveDivisionEdit = async () => {
        if (!activeDivisiId || isReadOnly) return;
        await supabase.from("divisions").update(editDivisionData).eq("id", activeDivisiId);
        setIsEditingDivision(false);
        fetchDashboardData(selectedKabinetId);
    };

    const submitTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title || isReadOnly) return;
        await supabase.from("proker_tasks").insert([{ proker_id: newTask.proker_id, title: newTask.title, description: newTask.description, assigned_to: newTask.assigned_to || null }]);
        
        // Automated Email Reminder integration
        if (newTask.assigned_to) {
            const staffEmail = "mock-staff@example.com"; // Should fetch actual email
            await fetch("/api/send-email", {
                method: "POST",
                body: JSON.stringify({
                    to: staffEmail,
                    subject: `Tugas Baru: ${newTask.title}`,
                    body: `Halo, Anda mendapatkan tugas baru dari Koordinator Divisi: "${newTask.title}". Silakan cek Portal Dakwah-OS untuk detail dan centang jika sudah selesai.`
                })
            });
        }
        
        setShowTaskForm(null);
        setNewTask({ proker_id: "", title: "", description: "", assigned_to: "" });
        fetchDashboardData(selectedKabinetId);
    };

    const toggleTask = async (taskId: string, current: boolean) => {
        if (isReadOnly) return;
        await supabase.from("proker_tasks").update({ is_completed: !current }).eq("id", taskId);
        fetchDashboardData(selectedKabinetId);
    };

    const submitDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docUpload.title || !docUpload.file_url || isReadOnly) return;
        await supabase.from("documents").insert([{ kabinet_id: selectedKabinetId, division_id: pengurus!.division_id, title: docUpload.title, type: docUpload.type, file_url: docUpload.file_url, uploaded_by: pengurus!.id }]);
        setShowDocForm(false);
        setDocUpload({ title: "", type: "proposal", file_url: "" });
        fetchDashboardData(selectedKabinetId);
    };

    // SCANNER
    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;
        if (scanning && !isReadOnly) {
            html5QrCode = new Html5Qrcode("reader");
            
            const onScanSuccess = async (decodedText: string) => {
                if (verifying) return;
                setScanning(false);
                setVerifying(true);
                
                let token = decodedText;
                if (decodedText.includes('?scan=')) {
                    token = decodedText.split('?scan=')[1];
                }
                
                try {
                    const { data: acara, error: findError } = await supabase.from("acara_internal").select("id, title, status").eq("jwt_secret_token", token).single();
                    if (findError || !acara) throw new Error("QR Code tidak valid atau acara tidak ditemukan!");
                    if (acara.status === "completed") throw new Error("Acara ini sudah selesai, absensi ditutup!");
                    
                    const { error: insertError } = await supabase.from("absensi_digital").insert([{ acara_id: acara.id, pengurus_id: pengurus!.id, status: 'hadir' }]);
                    if (insertError && insertError.code !== '23505') throw insertError;
                    
                    setScanResult(`Berhasil absen untuk: ${acara.title}`);
                    fetchDashboardData(selectedKabinetId);
                } catch (error: any) { setScanResult(`Gagal: ${error.message}`); } 
                finally { setVerifying(false); }
            };

            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onScanSuccess,
                () => {} // ignore errors (like no qr code found in frame)
            ).catch(err => {
                console.error("Camera start failed:", err);
                alert("Gagal mengakses kamera. Pastikan browser diizinkan mengakses kamera.");
                setScanning(false);
            });
            
            scannerRef.current = html5QrCode as any;
        } else if (scannerRef.current) {
            const scanner = scannerRef.current as any as Html5Qrcode;
            if (scanner.isScanning) {
                scanner.stop().catch(console.error);
            }
            scannerRef.current = null;
        }
        
        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(console.error);
            }
        };
    }, [scanning, isReadOnly]);

    // AUTO-SCAN FROM URL
    useEffect(() => {
        if (typeof window !== 'undefined' && pengurus && !isReadOnly && !verifying && selectedKabinetId) {
            const params = new URLSearchParams(window.location.search);
            const scanParam = params.get('scan');
            if (scanParam) {
                const processAutoScan = async () => {
                    setVerifying(true);
                    try {
                        const { data: acara, error: findError } = await supabase.from("acara_internal").select("id, title, status").eq("jwt_secret_token", scanParam).single();
                        if (findError || !acara) throw new Error("QR Code tidak valid atau acara tidak ditemukan!");
                        if (acara.status === "completed") throw new Error("Acara ini sudah selesai, absensi ditutup!");
                        
                        const { error: insertError } = await supabase.from("absensi_digital").insert([{ acara_id: acara.id, pengurus_id: pengurus.id, status: 'hadir' }]);
                        if (insertError && insertError.code !== '23505') throw insertError;
                        
                        setScanResult(`Berhasil absen untuk: ${acara.title}`);
                        fetchDashboardData(selectedKabinetId);
                    } catch (error: any) { setScanResult(`Gagal: ${error.message}`); } 
                    finally { setVerifying(false); }
                    
                    window.history.replaceState({}, document.title, window.location.pathname);
                };
                processAutoScan();
            }
        }
    }, [pengurus, isReadOnly, selectedKabinetId]);

    if (loading && !pengurus) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" size={40} /></div>;
    if (!pengurus) return null;

    const activeDivisionData = allDivisions.find(d => d.id === activeDivisiId);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Navbar / Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <img src={LOGO_URL} alt="Logo SKI" className="w-10 h-10 object-contain drop-shadow-sm" />
                        <div>
                            <h1 className="font-black text-slate-900 leading-tight tracking-tight text-lg">Dakwah-OS</h1>
                            <p className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Enterprise Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <select 
                            value={selectedKabinetId} 
                            onChange={(e) => { setSelectedKabinetId(e.target.value); setActiveDivisiId(null); setActiveTab("dashboard"); }}
                            className={`text-sm font-bold border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-sky-500 cursor-pointer transition-colors shadow-sm ${isReadOnly ? 'bg-amber-100 text-amber-800' : 'bg-slate-900 text-white'}`}
                        >
                            {kabinets.map(k => <option key={k.id} value={k.id}>{k.name} {k.period} {k.is_active ? '(Aktif)' : '(Arsip)'}</option>)}
                        </select>
                        <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {isReadOnly && (
                <div className="bg-amber-50 border-b border-amber-200 py-2.5 shadow-inner">
                    <p className="text-center text-sm font-black text-amber-700 flex justify-center items-center gap-2">
                        <Archive size={16} /> MODE ARSIP SEJARAH (READ-ONLY) AKTIF
                    </p>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                
                {/* Main Navigation Tabs */}
                {!activeDivisiId && (
                    <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 mb-8 w-fit mx-auto">
                        {[
                            { id: "dashboard", icon: <User size={18} />, label: "Kondisi Saya" },
                            { id: "divisi", icon: <Users size={18} />, label: "Dapur Divisi" },
                            { id: "vault", icon: <Archive size={18} />, label: "Vault Approval" }
                        ].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
                                {tab.icon} <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* VIEW 1: DASHBOARD UTAMA (Kondisi Saya) */}
                {activeTab === "dashboard" && !activeDivisiId && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left Column: KTA & Absen Cepat */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* KTA Digital */}
                            <div className="bg-gradient-to-br from-sky-600 to-blue-800 rounded-[2rem] p-6 shadow-2xl shadow-sky-900/20 text-white relative overflow-hidden group">
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <img src={LOGO_URL} alt="Logo SKI" className="w-12 h-12 object-contain brightness-0 invert drop-shadow-md" />
                                    <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 shadow-inner">KTA DIGITAL</div>
                                </div>
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-28 h-28 bg-white/20 p-1.5 rounded-[1.5rem] mb-5 shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                                        <div className="w-full h-full bg-slate-300 rounded-[1.2rem] overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${pengurus.photo_url || 'https://via.placeholder.com/150'})` }} />
                                    </div>
                                    <h2 className="text-2xl font-black mb-1 drop-shadow-md">{pengurus.full_name}</h2>
                                    <p className="text-sky-200 font-bold text-sm mb-6 uppercase tracking-wider">{pengurus.jabatan} • {pengurus.divisions?.name}</p>
                                    
                                    <div className="w-full bg-black/20 rounded-2xl p-5 border border-white/10 text-left backdrop-blur-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-1">Kabinet</p>
                                                <p className="text-sm font-bold">{pengurus.kabinets?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-1">WhatsApp</p>
                                                <p className="text-sm font-bold">{pengurus.phone_number || "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {!isReadOnly && (
                                        <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="mt-4 text-xs font-bold text-white hover:text-sky-200 flex items-center gap-1"><Camera size={14}/> Edit Profil Pribadi</button>
                                    )}
                                </div>
                            </div>

                            {/* Edit Profile Form */}
                            <AnimatePresence>
                                {isEditingProfile && !isReadOnly && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold mb-3 text-slate-800 text-sm">Update Data Pribadi</h4>
                                        <input type="text" placeholder="No. WhatsApp Aktif" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium mb-3 focus:outline-none focus:border-sky-500" value={editProfileData.phone_number} onChange={e => setEditProfileData({...editProfileData, phone_number: e.target.value})} />
                                        <div className="mb-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Upload Foto Profil (Opsional)</label>
                                            <input type="file" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-sky-500" 
                                                onChange={async (e) => { if(e.target.files && e.target.files[0]) { const url = await uploadFileToSupabase(e.target.files[0]); setEditProfileData({...editProfileData, photo_url: url}); } }} 
                                            />
                                        </div>
                                        <button disabled={isUploading} onClick={saveProfileEdit} className="w-full bg-slate-900 text-white font-bold text-sm py-2.5 rounded-lg shadow-md disabled:bg-slate-400">{isUploading ? 'Mengunggah...' : 'Simpan Perubahan'}</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Quick Scan Event Today */}
                            {eventToday && !isReadOnly && (
                                <div className="bg-sky-50 border-2 border-sky-500 rounded-2xl p-5 shadow-lg shadow-sky-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg animate-pulse">LIVE HARI INI</div>
                                    <h3 className="font-black text-slate-900 mb-1">{eventToday.title}</h3>
                                    <p className="text-xs font-medium text-slate-600 mb-4 flex items-center gap-1">
                                        <Clock size={12}/> 
                                        {new Date(eventToday.start_time).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {new Date(eventToday.start_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    
                                    {attendedEvents[eventToday.id] ? (
                                        <div className="bg-green-100 text-green-700 text-sm font-bold p-3 rounded-xl text-center border border-green-200 flex items-center justify-center gap-2">
                                            <CheckCircle size={18} /> Anda sudah absen hadir
                                        </div>
                                    ) : scanning ? (
                                        <div className="w-full bg-white rounded-xl relative p-2 border border-slate-200">
                                            {verifying && <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" size={24}/></div>}
                                            <div id="reader" className="w-full min-h-[300px]"></div>
                                            <button onClick={() => setScanning(false)} className="w-full mt-3 bg-red-500 text-white text-sm font-bold py-2.5 rounded-xl z-20 hover:bg-red-600 transition-colors">Batalkan Scan</button>
                                        </div>
                                    ) : scanResult ? (
                                        <div className="bg-green-100 text-green-700 text-xs font-bold p-3 rounded-lg text-center border border-green-200">
                                            {scanResult}
                                        </div>
                                    ) : (
                                        <button onClick={() => setScanning(true)} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors">
                                            <ScanLine size={18}/> Scan QR Kehadiran
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Tasks & KPI */}
                        <div className="lg:col-span-8 space-y-6">
                            
                            {/* KPI Widget */}
                            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-8">
                                <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className={kpiPercentage >= 75 ? "text-green-500" : "text-red-500"} strokeDasharray={`${kpiPercentage}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <div className="absolute text-3xl font-black text-slate-900">{kpiPercentage}%</div>
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                                        <Activity size={20} className="text-sky-500"/>
                                        <h3 className="text-xl font-black text-slate-900">Grafik Kedisiplinan</h3>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 mb-6">Persentase kehadiran Anda pada acara internal kabinet.</p>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Total Hadir</p>
                                            <p className="text-xl font-black text-slate-900">{hadirCount} Acara</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Status Performa</p>
                                            <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase ${kpiPercentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {kpiPercentage >= 75 ? <Shield size={12} /> : <AlertTriangle size={12} />}
                                                {kpiPercentage >= 75 ? "AMAN / AKTIF" : "PERLU EVALUASI"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Checklist Tugas Pribadi */}
                            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
                                <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2"><CheckSquare size={18} className="text-sky-500"/> Checklist Tugas Saya</h3>
                                {myTasks.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-sm font-bold text-slate-400">Tidak ada tugas yang ditugaskan kepada Anda saat ini.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {myTasks.map(t => (
                                            <div key={t.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${t.is_completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-sky-100 shadow-sm hover:border-sky-300'}`}>
                                                <button disabled={isReadOnly} onClick={() => toggleTask(t.id, t.is_completed)} className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors ${t.is_completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-transparent hover:border-sky-400'} ${isReadOnly && 'cursor-not-allowed'}`}>
                                                    <Check size={14} strokeWidth={4} />
                                                </button>
                                                <div>
                                                    <h4 className={`text-sm font-bold ${t.is_completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>{t.title}</h4>
                                                    {t.description && <p className="text-xs font-medium text-slate-500 mt-1">{t.description}</p>}
                                                    {t.prokers && <p className="text-[10px] font-black uppercase text-sky-600 mt-2 bg-sky-50 inline-block px-2 py-0.5 rounded">Proker: {t.prokers.name}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Staff Performance Summary (Coordinator Only) */}
                            {isCoordinator && staffPerformance.length > 0 && (
                                <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-800 text-white">
                                    <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Users size={18} className="text-sky-400"/> Ringkasan Performa Staff Divisi</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                                                    <th className="pb-3 font-bold">Nama Staff</th>
                                                    <th className="pb-3 font-bold text-center">Tugas Selesai</th>
                                                    <th className="pb-3 font-bold text-center">KPI Proker</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {staffPerformance.map((staff, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-3 font-bold">{staff.name}</td>
                                                        <td className="py-3 text-center text-slate-300">{staff.done} / {staff.total}</td>
                                                        <td className="py-3 text-center">
                                                            <span className={`px-2 py-1 rounded text-xs font-black ${staff.kpi >= 75 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                                {staff.kpi}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}

                {/* VIEW 2: DAPUR DIVISI (List & Details) */}
                {activeTab === "divisi" && !activeDivisiId && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-black text-slate-900">Dapur Divisi Organisasi</h2>
                            <p className="text-sm font-medium text-slate-500 mt-2">Pilih divisi untuk melihat ruang kerja, program kerja, dan arsip acara mereka.</p>
                        </div>
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
                                        <p className="text-sm text-slate-600 font-medium line-clamp-2 mb-4">{div.description}</p>
                                        {div.coordinator && (
                                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                                <img src={div.coordinator.photo_url || 'https://via.placeholder.com/50'} alt="Koord" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                                <div>
                                                    <p className="text-[10px] font-black text-sky-600 uppercase">Koordinator</p>
                                                    <p className="text-xs font-bold text-slate-900">{div.coordinator.full_name}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* DIVISION DETAILS (Nested View) */}
                {activeDivisiId && activeDivisionData && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pb-10">
                        {/* Back Button */}
                        <button onClick={() => setActiveDivisiId(null)} className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                            <ChevronLeft size={16} /> Kembali ke Daftar Divisi
                        </button>

                        {/* Hero Section */}
                        <div className="rounded-[2rem] overflow-hidden bg-slate-900 relative h-64 sm:h-80 mb-8 shadow-xl">
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
                                { id: "profil", icon: <Info size={16}/>, label: "Profil Divisi" },
                                { id: "proker", icon: <Briefcase size={16}/>, label: "Program Kerja" },
                                { id: "acara", icon: <Calendar size={16}/>, label: "Detail Acara & Absensi" }
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
                                        {isCoordinator && pengurus.division_id === activeDivisiId && !isReadOnly && (
                                            <button onClick={() => setIsEditingDivision(!isEditingDivision)} className="absolute top-6 right-6 text-sky-500 hover:text-sky-700 bg-sky-50 p-2 rounded-lg transition-colors">
                                                {isEditingDivision ? <X size={18} /> : <Edit size={18} />}
                                            </button>
                                        )}
                                        
                                        {isEditingDivision ? (
                                            <div className="space-y-4">
                                                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Edit size={18}/> Edit Profil Divisi</h3>
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
                                                    <h3 className="font-black text-slate-900 mb-2 flex items-center gap-2"><TargetIcon /> Visi Divisi</h3>
                                                    <p className="text-slate-600 text-sm leading-relaxed">{activeDivisionData.vision || "Belum ada visi yang ditulis."}</p>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 mb-2 flex items-center gap-2"><FlagIcon /> Misi Divisi</h3>
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
                                {isCoordinator && pengurus.division_id === activeDivisiId && !isReadOnly && (
                                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8">
                                        <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Plus size={18}/> Tambah Program Kerja Baru</h4>
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
                                                <textarea required rows={3} placeholder="Deskripsi Makro Proker..." className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={newProker.description} onChange={e => setNewProker({...newProker, description: e.target.value})} />
                                                <button disabled={isUploading} type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-black py-3 rounded-xl text-sm transition-colors disabled:bg-slate-400">{isUploading ? 'Mengunggah...' : 'Simpan Proker'}</button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                                
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
                                                    <textarea required rows={3} placeholder="Deskripsi Makro Proker..." className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={editProkerData.description} onChange={e => setEditProkerData({...editProkerData, description: e.target.value})} />
                                                    <div className="flex gap-3">
                                                        <button disabled={isUploading} type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors disabled:bg-slate-400">{isUploading ? 'Mengunggah...' : 'Update Proker'}</button>
                                                        <button type="button" onClick={() => setEditingProkerId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black px-5 py-2.5 rounded-xl text-sm transition-colors">Batal</button>
                                                    </div>
                                                </form>
                                            </div>
                                        ) : (
                                            <div key={p.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative group">
                                                {isCoordinator && pengurus.division_id === activeDivisiId && !isReadOnly && (
                                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                        <button onClick={() => { setEditingProkerId(p.id); setEditProkerData({ name: p.name, description: p.description, image_url: p.image_url || "" }); }} className="bg-white p-2 rounded-lg text-sky-500 hover:bg-sky-50 shadow-sm"><Edit size={16} /></button>
                                                        <button onClick={() => deleteProker(p.id)} className="bg-white p-2 rounded-lg text-red-500 hover:bg-red-50 shadow-sm"><Trash2 size={16} /></button>
                                                    </div>
                                                )}
                                                {p.image_url && <div className="h-40 bg-cover bg-center border-b border-slate-100" style={{ backgroundImage: `url(${p.image_url})` }} />}
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-black text-xl text-slate-900 pr-16">{p.name}</h4>
                                                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{p.status}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 font-medium flex-1">{p.description}</p>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SUB-TAB 3: DETAIL ACARA & ABSENSI */}
                        {divisiSubTab === "acara" && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                                <h3 className="font-black text-lg text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2"><Calendar size={20} className="text-sky-500"/> Daftar Acara & Bukti Kehadiran</h3>
                                <div className="space-y-6">
                                    {acaras.filter(a => prokers.find(p => p.id === a.proker_id && p.division_id === activeDivisiId)).length === 0 && <p className="text-slate-400 font-bold text-center py-8">Belum ada turunan acara dari divisi ini.</p>}
                                    {acaras.filter(a => prokers.find(p => p.id === a.proker_id && p.division_id === activeDivisiId)).map(acara => {
                                        const statusHadir = attendedEvents[acara.id]; // hadir/izin/dll for current user
                                        return (
                                            <div key={acara.id} className="flex flex-col sm:flex-row justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-black text-slate-900 text-lg">{acara.title}</h4>
                                                        {acara.status === 'live' && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded animate-pulse uppercase">Live</span>}
                                                    </div>
                                                    <p className="text-xs font-bold text-sky-600 uppercase mb-2">Turunan Proker: {acara.prokers?.name}</p>
                                                    <p className="text-sm font-medium text-slate-600 mb-3">{acara.description}</p>
                                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                                        <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(acara.start_time).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</span>
                                                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(acara.start_time).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 flex sm:flex-col justify-end sm:justify-start items-center sm:items-end gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status Kehadiran Anda</p>
                                                    {statusHadir ? (
                                                        <span className={`px-4 py-1.5 rounded-lg text-sm font-black uppercase border ${statusHadir === 'hadir' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                            {statusHadir}
                                                        </span>
                                                    ) : (
                                                        <span className="px-4 py-1.5 rounded-lg text-sm font-black uppercase bg-slate-200 text-slate-500 border border-slate-300">
                                                            BELUM ABSEN
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* VIEW 3: VAULT APPROVAL (PROPOSAL & LPJ) */}
                {activeTab === "vault" && !activeDivisiId && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Email Automation Flow UI */}
                        <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-800 text-white mb-8">
                            <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Mail size={20} className="text-sky-400"/> Sistem Otomatisasi Reminder (Mailing)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { day: "H-30", title: "Konsep & Ruangan", desc: "Reminder draft kasar & birokrasi" },
                                    { day: "H-21", title: "Progres Awal", desc: "Cek checklist tugas staff" },
                                    { day: "H-14", title: "Progres Akhir", desc: "Cek finalisasi kepanitiaan" },
                                    { day: "H-7", title: "Undangan Massal", desc: "Broadcast email ke kabinet" },
                                ].map((step, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                        <div className="w-10 h-10 bg-sky-500/20 text-sky-400 flex items-center justify-center rounded-xl font-black text-sm mb-3">{step.day}</div>
                                        <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                                        <p className="text-xs text-slate-400">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div>
                                <h3 className="font-black text-xl text-slate-900">Digital Vault & Flow Proposal</h3>
                                <p className="text-sm font-medium text-slate-500">Arsip terpusat untuk regenerasi dan transparansi birokrasi.</p>
                            </div>
                            {isCoordinator && !isReadOnly && (
                                <button onClick={() => setShowDocForm(!showDocForm)} className="bg-sky-500 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-md shadow-sky-500/20 hover:bg-sky-600 flex items-center gap-2 transition-colors">
                                    <Upload size={16} /> Unggah Dokumen
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showDocForm && isCoordinator && !isReadOnly && (
                                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={submitDocument} className="bg-white p-6 rounded-3xl border border-sky-200 shadow-lg overflow-hidden">
                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <input required type="text" placeholder="Judul Dokumen (Misal: Proposal Triwulan 1)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500" value={docUpload.title} onChange={e => setDocUpload({...docUpload, title: e.target.value})} />
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500" value={docUpload.type} onChange={e => setDocUpload({...docUpload, type: e.target.value})}>
                                            <option value="proposal">Proposal Triwulan</option>
                                            <option value="lpj">Lembar Pertanggungjawaban (LPJ)</option>
                                        </select>
                                    </div>
                                    <input required type="text" placeholder="URL File (Gunakan Google Drive Link)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium mb-4 focus:outline-none focus:ring-2 focus:ring-sky-500" value={docUpload.file_url} onChange={e => setDocUpload({...docUpload, file_url: e.target.value})} />
                                    <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors">Submit ke Sistem Approval</button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
                            <div className="space-y-4">
                                {documents.length === 0 && <p className="text-center text-slate-400 font-bold py-8">Belum ada dokumen yang diunggah pada kabinet ini.</p>}
                                {documents.map(doc => (
                                    <div key={doc.id} className="flex flex-col xl:flex-row xl:items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl gap-4 hover:border-sky-300 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-sky-500 flex-shrink-0 shadow-sm"><FileText size={24}/></div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-slate-900 text-lg">{doc.title}</h4>
                                                    <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{doc.type}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-500">Diunggah oleh: <span className="text-slate-700">{doc.pengurus?.full_name}</span> • {new Date(doc.created_at).toLocaleDateString("id-ID")}</p>
                                                
                                                {/* Approval Flow Visualizer */}
                                                <div className="flex items-center gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
                                                    {['draft', 'ditinjau_bendahara', 'ditinjau_sekretaris', 'approved'].map((step, idx, arr) => {
                                                        const statusMap: any = { draft: 0, ditinjau_bendahara: 1, ditinjau_sekretaris: 2, approved: 3 };
                                                        const docStatusVal = statusMap[doc.status] || 0;
                                                        const isPast = idx <= docStatusVal;
                                                        const isCurrent = idx === docStatusVal;
                                                        return (
                                                            <div key={step} className="flex items-center">
                                                                <div className={`flex items-center justify-center h-6 w-auto px-3 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-colors ${isCurrent ? 'bg-sky-500 text-white shadow-md' : isPast ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-400'}`}>
                                                                    {isPast && !isCurrent ? <Check size={10} className="mr-1"/> : null}
                                                                    {step.replace('ditinjau_', 'Cek ')}
                                                                </div>
                                                                {idx < arr.length - 1 && <div className={`w-4 h-0.5 mx-1 ${idx < docStatusVal ? 'bg-green-400' : 'bg-slate-200'}`}></div>}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-black text-slate-700 hover:text-sky-600 hover:border-sky-300 transition-colors shadow-sm">
                                            <Download size={18} /> Unduh File Dokumen
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}

// Simple icons
function TargetIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> }
function FlagIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg> }
