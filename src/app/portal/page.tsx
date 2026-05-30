"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/upload";
import {
    LogOut, User, Calendar, CheckCircle, Clock, Plus, Briefcase,
    Check, X, QrCode, ScanLine, Loader2, FileText, Upload, Award, Activity, AlertTriangle, Shield, CheckSquare, Download, Archive, ChevronLeft, ChevronRight, Users, FileCheck, Info, Camera, Phone, Mail, Edit, Trash2, Book, Database, Image as ImageIcon, Menu, DollarSign, ArrowUpRight, ArrowDownRight, Wallet, PieChart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

// Interfaces
interface Pengurus { id: string; full_name: string; jabatan: string; role_level: string; photo_url: string; phone_number: string; division_id: string; kabinet_id: string; divisions: { id: string, name: string, description: string, icon: string, hero_image_url: string, vision: string, mission: string }; kabinets: { name: string, period: string } }
interface Acara { id: string; proker_id?: string; title: string; description: string; start_time: string; end_time?: string; location: string; status: string; jwt_secret_token: string; attachment_url?: string; meeting_link?: string; }
interface Proker { id: string; division_id: string; name: string; description: string; image_url: string; status: string; created_at: string; }
interface Task { id: string; proker_id: string; title: string; description: string; assigned_to: string | null; is_completed: boolean; pengurus?: { full_name: string }; prokers?: { name: string } }
interface Kabinet { id: string; name: string; period: string; is_active: boolean; }
interface Document { id: string; title: string; type: string; file_url: string; status: string; uploaded_by: string; created_at: string; catatan_revisi?: string; pengurus?: { full_name: string } }
interface DivisionData { id: string; name: string; description: string; icon: string; hero_image_url: string; vision: string; mission: string; coordinator?: { photo_url: string, full_name: string, jabatan: string }; staffs: { photo_url: string, full_name: string, jabatan: string }[] }
interface KnowledgeFolder { id: string; name: string; parent_id: string | null; kabinet_id: string; division_id: string | null; created_by: string; created_at: string; }
interface KnowledgeBase { id: string; title: string; folder: string; file_url: string; uploaded_by: string; created_at: string; division_id?: string; folder_id?: string; file_size?: number; file_type?: string; kabinet_id?: string; pengurus?: { full_name: string }; divisions?: { name: string } }
interface PembayaranKas { id: string; pengurus_id: string; kabinet_id: string; division_id: string | null; amount: number; bulan: number; tahun: number; bukti_url: string; status: 'PENDING' | 'VERIFIED' | 'REJECTED'; catatan?: string; created_at: string; divisions?: { name: string } }
interface DonasiTransaksi { id: string; nama_donatur: string; email_donatur: string; no_hp_donatur: string; jenis_donasi: string; nominal: number; pesan: string; metode_pembayaran: string; bukti_transfer_url: string; is_anonymous: boolean; status: string; created_at: string; catatan_admin: string; }
interface KeuanganTransaksi { id: string; kabinet_id: string; division_id: string | null; type: 'IN' | 'OUT'; kategori: string; amount: number; description: string; tanggal: string; created_by: string; created_at: string; pengurus?: { full_name: string }; divisions?: { name: string } }
interface SaldoDivisi { division_id: string; division_name: string; kabinet_id: string; kabinet_name: string; total_pemasukan: number; total_pengeluaran: number; saldo_akhir: number; }
const getLocalDatetimeLocal = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
};

export default function DakwahOSPortal() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [pengurus, setPengurus] = useState<Pengurus | null>(null);

    // Multi-Kabinet State
    const [kabinets, setKabinets] = useState<Kabinet[]>([]);
    const [selectedKabinetId, setSelectedKabinetId] = useState<string>("");
    const isReadOnly = kabinets.find(k => k.id === selectedKabinetId)?.is_active === false;

    // View States
    const [activeTab, setActiveTab] = useState<"dashboard" | "divisi" | "vault" | "agenda" | "arsip" | "keuangan">("dashboard");
    const [activeDivisiId, setActiveDivisiId] = useState<string | null>(null);
    const [divisiSubTab, setDivisiSubTab] = useState<"profil" | "proker" | "acara">("profil");
    const [showMobileNav, setShowMobileNav] = useState(false);

    // Data States
    const [allDivisions, setAllDivisions] = useState<DivisionData[]>([]);
    const [acaras, setAcaras] = useState<Acara[]>([]);
    const [attendedEvents, setAttendedEvents] = useState<Record<string, string>>({}); // acara_id -> status (hadir/izin/dll)
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [prokers, setProkers] = useState<Proker[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeBase[]>([]);
    const [knowledgeFolders, setKnowledgeFolders] = useState<KnowledgeFolder[]>([]);
    const [staffPerformance, setStaffPerformance] = useState<{ name: string, total: number, done: number, kpi: number }[]>([]);

    // All Pengurus for Kas Progress Table
    const [allPengurusList, setAllPengurusList] = useState<{ id: string; full_name: string; jabatan: string; divisions?: { name: string } }[]>([]);

    // Keuangan States
    const [transaksiKeuangan, setTransaksiKeuangan] = useState<KeuanganTransaksi[]>([]);
    const [saldoDivisiList, setSaldoDivisiList] = useState<SaldoDivisi[]>([]);
    const [showKeuanganForm, setShowKeuanganForm] = useState(false);
    const [keuanganForm, setKeuanganForm] = useState<{ type: 'IN' | 'OUT', kategori: string, amount: string, description: string, tanggal: string, division_id: string }>({ type: 'IN', kategori: 'Donasi', amount: '', description: '', tanggal: new Date().toISOString().split('T')[0], division_id: '' });
    const [pembayaranKas, setPembayaranKas] = useState<PembayaranKas[]>([]);
    const [showKasForm, setShowKasForm] = useState(false);
    const [kasForm, setKasForm] = useState<{ amount: string; selectedMonths: number[]; tahun: number; bukti_url: string }>({ amount: '', selectedMonths: [], tahun: new Date().getFullYear(), bukti_url: '' });
    const [kasFile, setKasFile] = useState<File | null>(null);
    // Donasi States
    const [donasiTransaksi, setDonasiTransaksi] = useState<DonasiTransaksi[]>([]);
    const [selectedDonasi, setSelectedDonasi] = useState<DonasiTransaksi | null>(null);
    const [donasiPage, setDonasiPage] = useState(1);
    const [keuanganPage, setKeuanganPage] = useState(1);
    const [keuanganSubTab, setKeuanganSubTab] = useState<"ringkasan" | "buku_kas" | "kas_anggota" | "donasi">("ringkasan");
    const ITEMS_PER_PAGE = 10;
    const KEUANGAN_ITEMS_PER_PAGE = 15;

    // Form States
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editProfileData, setEditProfileData] = useState({ phone_number: "", photo_url: "" });
    const [showProkerForm, setShowProkerForm] = useState(false);
    const [newProker, setNewProker] = useState({ name: "", description: "", image_url: "" });
    const [showTaskForm, setShowTaskForm] = useState<string | null>(null); // proker_id
    const [newTask, setNewTask] = useState({ proker_id: "", title: "", description: "", assigned_to: "" });
    const [showDocForm, setShowDocForm] = useState(false);
    const [docUpload, setDocUpload] = useState({ title: "", type: "proposal", file_url: "" });
    const [docFile, setDocFile] = useState<File | null>(null);
    const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);
    const [knowledgeForm, setKnowledgeForm] = useState({ title: '' });
    const [knowledgeFile, setKnowledgeFile] = useState<File | null>(null);
    const [kbDivisionId, setKbDivisionId] = useState<string | null>(null);
    const [kbFolderId, setKbFolderId] = useState<string | null>(null);
    const [showCreateFolderForm, setShowCreateFolderForm] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Calendar State
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

    // Edit Division & Proker States
    const [isEditingDivision, setIsEditingDivision] = useState(false);
    const [editDivisionData, setEditDivisionData] = useState({ description: "", hero_image_url: "", vision: "", mission: "" });
    const [editingProkerId, setEditingProkerId] = useState<string | null>(null);
    const [editProkerData, setEditProkerData] = useState({ name: "", description: "", image_url: "" });

    // Acara Form States
    const [showAcaraForm, setShowAcaraForm] = useState(false);
    const [editingAcaraId, setEditingAcaraId] = useState<string | null>(null);
    const [acaraForm, setAcaraForm] = useState({ title: "", description: "", start_time: "", end_time: "", location: "", proker_id: "", status: "upcoming", attachment_url: "", meeting_link: "" });
    const [selectedQR, setSelectedQR] = useState<string | null>(null);

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
            // Fetch Divisions & Structure for current Kabinet
            const { data: divData } = await supabase.from("divisions").select("*").eq("kabinet_id", kabinet_id);
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
            if (aData) {
                const now = new Date();
                const updatedAcara = aData.map((acara: any) => {
                    const start = new Date(acara.start_time);
                    const end = acara.end_time ? new Date(acara.end_time) : start;
                    let status = acara.status;
                    if (now >= end) {
                        status = 'completed';
                    } else if (now >= start) {
                        status = 'live';
                    } else {
                        status = 'upcoming';
                    }
                    return { ...acara, status };
                });
                setAcaras(updatedAcara);
            }
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

                        // Fetch performa
                        const performaQuery = await supabase.from("vw_performa_pengurus").select("*").eq("kabinet_id", kabinet_id);
                        const performaMap = new Map(performaQuery.data?.map(p => [p.pengurus_id, p]) || []);

                        if (divStaff.data) {
                            // Exclude themselves or other coordinators from the "staff performance" view, only show subordinates
                            const subordinates = divStaff.data.filter(s => !["ketuum", "div_ketua", "lso_ketua"].includes(s.role_level));
                            const perf = subordinates.map(staff => {
                                const sTasks = (tData ?? []).filter(t => t.assigned_to === staff.id);
                                const done = sTasks.filter(t => t.is_completed).length;

                                const pData = performaMap.get(staff.id);

                                return {
                                    name: staff.full_name,
                                    total: sTasks.length,
                                    done: done,
                                    kpi: sTasks.length > 0 ? Math.round((done / sTasks.length) * 100) : 100,
                                    hadir: pData?.total_hadir || 0,
                                    totalAcara: pData?.total_acara || 0,
                                    kpiHadir: pData?.persentase_kehadiran || 0,
                                    statusHadir: pData?.status_evaluasi || 'Belum Ada Acara'
                                };
                            });
                            setStaffPerformance(perf as any);
                        }
                    }
                }
            }

            // Documents Vault
            const { data: docData } = await supabase.from("documents").select("*, pengurus:uploaded_by(full_name)").eq("kabinet_id", kabinet_id).order("created_at", { ascending: false });
            if (docData) setDocuments(docData as any);

            // Knowledge Base Files
            const { data: kbData } = await supabase.from("knowledge_base").select("*, pengurus:uploaded_by(full_name), divisions:division_id(name)").order("created_at", { ascending: false });
            if (kbData) setKnowledgeFiles(kbData as any);

            // Knowledge Folders
            const { data: kbFolders } = await supabase.from("knowledge_folders").select("*").eq("kabinet_id", kabinet_id).order("name", { ascending: true });
            if (kbFolders) setKnowledgeFolders(kbFolders as any);

            // Keuangan Transaksi
            const { data: trxData } = await supabase.from("keuangan_transaksi").select("*, pengurus:created_by(full_name), divisions:division_id(name)").eq("kabinet_id", kabinet_id).order("tanggal", { ascending: false }).order("created_at", { ascending: false });
            if (trxData) setTransaksiKeuangan(trxData as any);

            // Saldo Divisi
            const { data: saldoData } = await supabase.from("vw_saldo_divisi").select("*").eq("kabinet_id", kabinet_id).order("division_name", { ascending: true });
            if (saldoData) setSaldoDivisiList(saldoData as any);

            // Pembayaran Kas
            const { data: kasData } = await supabase.from("pembayaran_kas").select("*, divisions:division_id(name), pengurus:pengurus_id(full_name)").eq("kabinet_id", kabinet_id).order("tahun", { ascending: false }).order("bulan", { ascending: false });
            if (kasData) setPembayaranKas(kasData as any);

            // Fetch all pengurus for Kas Progress Table
            const { data: pList } = await supabase
                .from("pengurus")
                .select("id, full_name, jabatan, divisions(name)")
                .eq("kabinet_id", kabinet_id)
                .order("full_name", { ascending: true });
            if (pList) setAllPengurusList(pList as any);

            // Donasi Transaksi (hanya untuk bendahara)
            if (isBendahara) {
                const { data: donasiData } = await supabase.from("donasi_transaksi").select("*").eq("kabinet_id", kabinet_id).order("created_at", { ascending: false }).range(0, ITEMS_PER_PAGE - 1);
                if (donasiData) setDonasiTransaksi(donasiData as any);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const isCoordinator = pengurus && ["ketuum", "wakil", "div_ketua", "lso_ketua"].includes(pengurus.role_level);
    const isBendahara = pengurus && pengurus.role_level.startsWith("bendahara");
    const isSekretaris = pengurus && pengurus.role_level.startsWith("sekretaris");

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
        if (!docUpload.title || !docFile || isReadOnly) return;
        try {
            const url = await uploadFileToSupabase(docFile);
            await supabase.from("documents").insert([{
                kabinet_id: selectedKabinetId,
                division_id: pengurus!.division_id,
                title: docUpload.title,
                type: docUpload.type,
                file_url: url,
                uploaded_by: pengurus!.id,
                status: 'cek_bendahara'
            }]);
            setShowDocForm(false);
            setDocUpload({ title: "", type: "proposal", file_url: "" });
            setDocFile(null);
            fetchDashboardData(selectedKabinetId);
        } catch (err) { console.error(err); }
    };

    const submitKnowledge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!knowledgeForm.title || !knowledgeFile || isReadOnly) return;
        try {
            const url = await uploadFileToSupabase(knowledgeFile);
            await supabase.from("knowledge_base").insert([{
                title: knowledgeForm.title,
                folder: kbFolderId || kbDivisionId || 'umum',
                folder_id: kbFolderId,
                file_url: url,
                uploaded_by: pengurus!.id,
                division_id: kbDivisionId === 'umum' ? null : kbDivisionId,
                kabinet_id: selectedKabinetId,
                file_size: knowledgeFile.size,
                file_type: knowledgeFile.type
            }]);
            setShowKnowledgeForm(false);
            setKnowledgeForm({ title: '' });
            setKnowledgeFile(null);
            fetchDashboardData(selectedKabinetId);
        } catch (err) { console.error(err); }
    };

    const createKnowledgeFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName || isReadOnly) return;
        try {
            await supabase.from("knowledge_folders").insert([{
                name: newFolderName,
                parent_id: kbFolderId,
                kabinet_id: selectedKabinetId,
                division_id: kbDivisionId === 'umum' ? null : kbDivisionId,
                created_by: pengurus!.id
            }]);
            setShowCreateFolderForm(false);
            setNewFolderName('');
            fetchDashboardData(selectedKabinetId);
        } catch (err) { console.error(err); }
    };

    const submitKeuangan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly || !isBendahara) return;
        try {
            await supabase.from("keuangan_transaksi").insert([{
                kabinet_id: selectedKabinetId,
                division_id: keuanganForm.division_id || null,
                type: keuanganForm.type,
                kategori: keuanganForm.kategori,
                amount: parseFloat(keuanganForm.amount.replace(/\D/g, '')),
                description: keuanganForm.description,
                tanggal: keuanganForm.tanggal,
                created_by: pengurus!.id
            }]);
            setShowKeuanganForm(false);
            setKeuanganForm({ type: 'IN', kategori: 'Donasi', amount: '', description: '', tanggal: new Date().toISOString().split('T')[0], division_id: '' });
            fetchDashboardData(selectedKabinetId);
        } catch (err) { console.error(err); }
    };

    const deleteKeuangan = async (id: string) => {
        if (isReadOnly || !isBendahara) return;
        if (!confirm('Hapus transaksi ini?')) return;
        await supabase.from('keuangan_transaksi').delete().eq('id', id);
        fetchDashboardData(selectedKabinetId);
    };

    const submitPembayaranKas = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pengurus || isReadOnly) return;
        if (!kasForm.bukti_url || !kasForm.amount) {
            alert('Harap isi jumlah dan unggah bukti pembayaran');
            return;
        }
        if (kasForm.selectedMonths.length === 0) {
            alert('Harap pilih minimal 1 bulan');
            return;
        }
        const nominal = parseFloat(kasForm.amount.replace(/\D/g, ''));
        if (isNaN(nominal) || nominal <= 0) {
            alert('Jumlah pembayaran harus lebih dari 0');
            return;
        }
        try {
            // Insert multiple records for each selected month
            const paymentsToInsert = kasForm.selectedMonths.map(bulan => ({
                pengurus_id: pengurus.id,
                kabinet_id: selectedKabinetId,
                division_id: pengurus.division_id,
                amount: nominal,
                bulan: bulan,
                tahun: kasForm.tahun,
                bukti_url: kasForm.bukti_url,
                status: 'PENDING'
            }));

            const { error } = await supabase.from('pembayaran_kas').insert(paymentsToInsert);
            if (error) throw error;
            const bulanList = kasForm.selectedMonths.map(m => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][m - 1]).join(', ');
            alert(`✅ Berhasil! Pembayaran kas untuk ${bulanList} ${kasForm.tahun} sebesar Rp ${nominal.toLocaleString('id-ID')} per bulan telah dikirim dan menunggu verifikasi.`);
            setShowKasForm(false);
            setKasForm({ amount: '', selectedMonths: [], tahun: new Date().getFullYear(), bukti_url: '' });
            setKasFile(null);
            fetchDashboardData(selectedKabinetId);
        } catch (err: any) {
            alert('Gagal menyimpan pembayaran kas: ' + err.message);
        }
    };

    const handleKasFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const firstMonth = kasForm.selectedMonths.length > 0 ? kasForm.selectedMonths[0] : 1;
                const url = await uploadFile(file, 'kas-bukti', `${pengurus?.id}/${firstMonth}-${kasForm.tahun}`);
                if (url) {
                    setKasForm({ ...kasForm, bukti_url: url });
                    setKasFile(file);
                } else {
                    alert('❌ Gagal mengunggah bukti pembayaran. Pastikan bucket "kas-bukti" sudah dibuat di Supabase Storage dan Anda sudah login.');
                }
            } catch (error: any) {
                alert('❌ Error upload: ' + (error.message || 'Terjadi kesalahan saat mengunggah file'));
            }
        }
    };

    const handleKasStatusChange = async (id: string, status: 'VERIFIED' | 'REJECTED', catatan?: string) => {
        if (isReadOnly || !isBendahara) return;
        const kasItem = pembayaranKas.find(k => k.id === id);
        if (!kasItem) return;

        // Jika diverifikasi, otomatis catat ke transaksi keuangan
        if (status === 'VERIFIED' && kasItem.status !== 'VERIFIED') {
            const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][kasItem.bulan - 1];
            const { error: keuanganError } = await supabase.from('keuangan_transaksi').insert({
                kabinet_id: selectedKabinetId,
                division_id: kasItem.division_id || null,
                type: 'IN',
                kategori: 'Kas Anggota',
                amount: kasItem.amount,
                description: `Kas ${kasItem.bulan}/${kasItem.tahun} - ${(kasItem as any).pengurus?.full_name || 'Pengurus'}`,
                tanggal: new Date().toISOString().split('T')[0],
                created_by: pengurus!.id
            });
            if (keuanganError) {
                alert('Verifikasi gagal: ' + keuanganError.message);
                return;
            }
        }

        const { error } = await supabase.from('pembayaran_kas').update({
            status,
            catatan: catatan || null,
            verified_at: new Date().toISOString(),
            verified_by: pengurus!.id
        }).eq('id', id);
        if (!error) fetchDashboardData(selectedKabinetId);
    };

    const deleteKnowledgeFile = async (id: string) => {
        if (isReadOnly) return;
        if (!confirm('Hapus file ini?')) return;
        await supabase.from('knowledge_base').delete().eq('id', id);
        fetchDashboardData(selectedKabinetId);
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const handleDocumentAction = async (docId: string, action: 'acc_bendahara' | 'revisi_bendahara' | 'acc_sekretaris' | 'revisi_sekretaris') => {
        if (isReadOnly) return;
        let payload: any = {};

        if (action === 'acc_bendahara') {
            payload = { status: 'cek_sekretaris', reviewed_by_bendahara: pengurus!.id, catatan_revisi: null };
        } else if (action === 'revisi_bendahara') {
            const note = window.prompt("Masukkan catatan revisi untuk staf:");
            if (note === null) return;
            payload = { status: 'revisi_bendahara', catatan_revisi: note, reviewed_by_bendahara: pengurus!.id };
        } else if (action === 'acc_sekretaris') {
            payload = { status: 'approved', reviewed_by_sekretaris: pengurus!.id, catatan_revisi: null };
            // In a real implementation, you would also trigger a server action here to stamp the PDF
        } else if (action === 'revisi_sekretaris') {
            const note = window.prompt("Masukkan catatan revisi untuk staf / bendahara:");
            if (note === null) return;
            payload = { status: 'revisi_sekretaris', catatan_revisi: note, reviewed_by_sekretaris: pengurus!.id };
        }

        const { error } = await supabase.from("documents").update(payload).eq("id", docId);
        if (error) {
            alert("Gagal memproses dokumen: " + error.message);
        } else {
            fetchDashboardData(selectedKabinetId);
        }
    };

    const submitAcara = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!acaraForm.title || isReadOnly) return;

        // Build clean payload - only include fields that have values
        const payload: Record<string, any> = {
            title: acaraForm.title,
            description: acaraForm.description || null,
            start_time: acaraForm.start_time || null,
            end_time: acaraForm.end_time || null,
            location: acaraForm.location || null,
            status: acaraForm.status,
        };
        // Only include optional fields if they have actual values
        if (acaraForm.proker_id) payload.proker_id = acaraForm.proker_id;
        if (acaraForm.attachment_url) payload.attachment_url = acaraForm.attachment_url;
        if (acaraForm.meeting_link) payload.meeting_link = acaraForm.meeting_link;

        if (editingAcaraId) {
            const { error } = await supabase.from("acara_internal").update(payload).eq("id", editingAcaraId);
            if (error) { alert("Gagal update acara: " + error.message); return; }
        } else {
            const jwt_secret_token = "SKI-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now();
            const { error } = await supabase.from("acara_internal").insert([{ ...payload, kabinet_id: selectedKabinetId, jwt_secret_token }]);
            if (error) { alert("Gagal membuat acara: " + error.message); return; }
        }

        setShowAcaraForm(false);
        setEditingAcaraId(null);
        setAcaraForm({ title: "", description: "", start_time: "", end_time: "", location: "", proker_id: "", status: "upcoming", attachment_url: "", meeting_link: "" });
        fetchDashboardData(selectedKabinetId);
    };

    const deleteAcara = async (id: string) => {
        if (isReadOnly || !confirm("Yakin ingin menghapus acara ini beserta data absensinya?")) return;
        await supabase.from("acara_internal").delete().eq("id", id);
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
                () => { } // ignore errors (like no qr code found in frame)
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
                        // Remove the ?scan= query param while staying on the same page
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } catch (error: any) { setScanResult(`Gagal: ${error.message}`); }
                    finally { setVerifying(false); }
                };
                processAutoScan();
            }
        }
    }, [pengurus, isReadOnly, selectedKabinetId]);

    if (loading && !pengurus) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" size={40} /></div>;
    if (!pengurus) return null;

    const activeDivisionData = allDivisions.find(d => d.id === activeDivisiId);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans overflow-x-hidden px-2 sm:px-4">

            {/* MODAL: TAMPILKAN QR */}
            <AnimatePresence>
                {selectedQR && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center">
                            <h3 className="font-bold text-xl text-slate-900 mb-2">QR Code Absensi</h3>
                            <p className="text-slate-500 text-sm mb-6">Minta peserta untuk scan QR ini melalui Portal mereka</p>

                            <div className="bg-slate-50 p-4 rounded-2xl flex justify-center mb-6">
                                <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : ''}/portal?scan=${selectedQR}`} size={200} />
                            </div>

                            <button onClick={() => setSelectedQR(null)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">Tutup</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: LIHAT BUKTI DONASI */}
            <AnimatePresence>
                {selectedDonasi && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-xl text-slate-900">Bukti Transfer Donasi</h3>
                                <button onClick={() => setSelectedDonasi(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Donor Info */}
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {selectedDonasi.is_anonymous ? 'Hamba Allah (Anonim)' : selectedDonasi.nama_donatur}
                                            </p>
                                            <p className="text-xs text-slate-500">{selectedDonasi.email_donatur || '-'} • {selectedDonasi.no_hp_donatur || '-'}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${selectedDonasi.status === 'verified' ? 'bg-green-100 text-green-700' : selectedDonasi.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {selectedDonasi.status === 'verified' ? 'Terverifikasi' : selectedDonasi.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-500">Jenis:</span>
                                        <span className="font-bold text-slate-900">{selectedDonasi.jenis_donasi}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-500">Metode:</span>
                                        <span className="font-bold text-slate-900">{selectedDonasi.metode_pembayaran}</span>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="text-center py-3 bg-green-50 rounded-xl">
                                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Nominal Donasi</p>
                                    <p className="text-2xl font-black text-green-700">Rp {selectedDonasi.nominal.toLocaleString('id-ID')}</p>
                                </div>

                                {/* Bukti Transfer Image */}
                                {selectedDonasi.bukti_transfer_url ? (
                                    <div className="rounded-xl overflow-hidden border-2 border-slate-200 max-h-64 overflow-y-auto">
                                        <img src={selectedDonasi.bukti_transfer_url} alt="Bukti Transfer" className="w-full h-auto object-contain" />
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 rounded-xl p-8 text-center">
                                        <p className="text-slate-500 font-medium">Tidak ada bukti transfer</p>
                                    </div>
                                )}

                                {/* Pesan */}
                                {selectedDonasi.pesan && (
                                    <div className="bg-amber-50 p-4 rounded-xl">
                                        <p className="text-xs font-bold text-amber-700 mb-1">Pesan:</p>
                                        <p className="text-sm text-amber-800">{selectedDonasi.pesan}</p>
                                    </div>
                                )}

                                {/* Catatan Admin (for bendahara) */}
                                {selectedDonasi.catatan_admin && (
                                    <div className="bg-blue-50 p-4 rounded-xl">
                                        <p className="text-xs font-bold text-blue-700 mb-1">Catatan Admin:</p>
                                        <p className="text-sm text-blue-800">{selectedDonasi.catatan_admin}</p>
                                    </div>
                                )}

                                {/* Tanggal */}
                                <div className="text-center text-xs text-slate-400">
                                    {new Date(selectedDonasi.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Navbar / Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 sm:h-16 sm:py-0">
                    <div className="flex items-center justify-between w-full sm:w-auto">
                        <div className="flex items-center gap-3">
                            <img src={LOGO_URL} alt="Logo SKI" className="w-10 h-10 object-contain drop-shadow-sm" />
                            <div>
                                <h1 className="font-black text-slate-900 leading-tight tracking-tight text-lg">Portal Anggota SKI</h1>
                                <p className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Enterprise Management</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:hidden">
                            <button onClick={() => setShowMobileNav(!showMobileNav)} className="text-slate-600 hover:text-sky-500 hover:bg-sky-50 p-2 rounded-xl transition-colors">
                                {showMobileNav ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-4 mt-3 sm:mt-0">
                        <select
                            value={selectedKabinetId}
                            onChange={(e) => { setSelectedKabinetId(e.target.value); setActiveDivisiId(null); setActiveTab("dashboard"); }}
                            className={`w-full sm:w-auto text-xs sm:text-sm font-bold border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-sky-500 cursor-pointer transition-colors shadow-sm ${isReadOnly ? 'bg-amber-100 text-amber-800' : 'bg-slate-900 text-white'}`}
                        >
                            {kabinets.map(k => <option key={k.id} value={k.id}>{k.name} {k.period} {k.is_active ? '(Aktif)' : '(Arsip)'}</option>)}
                        </select>
                        <button onClick={handleLogout} className="hidden sm:block text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors" title="Keluar">
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
                    <div className={`${showMobileNav ? 'block' : 'hidden'} sm:block mb-8`}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-2 w-full max-w-6xl mx-auto">
                            {[
                                { id: "dashboard", icon: <User size={18} />, label: "Kondisi Saya" },
                                { id: "agenda", icon: <Calendar size={18} />, label: "Timeline Proker" },
                                { id: "divisi", icon: <Users size={18} />, label: "Ruang Divisi" },
                                { id: "vault", icon: <FileText size={18} />, label: "Persetujuan Proposal" },
                                { id: "arsip", icon: <Book size={18} />, label: "Penyimpanan Berkas" },
                                { id: "keuangan", icon: <DollarSign size={18} />, label: "Transparansi Keuangan" }
                            ].map((tab) => (
                                <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setShowMobileNav(false); }}
                                    className={`flex items-center justify-center sm:justify-center justify-start gap-3 py-3 px-4 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-md" : "bg-white sm:bg-transparent border border-slate-200 sm:border-none text-slate-500 hover:bg-slate-50"} w-full`}
                                >
                                    {tab.icon} <span>{tab.label}</span>
                                </button>
                            ))}
                            <button onClick={handleLogout} className="sm:hidden flex items-center justify-start gap-3 py-3 px-4 text-sm font-bold rounded-xl transition-all bg-red-50 border border-red-200 text-red-500 w-full mt-2">
                                <LogOut size={18} /> <span>Keluar Akun</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* VIEW 1: DASHBOARD UTAMA (Kondisi Saya) */}
                {activeTab === "dashboard" && !activeDivisiId && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Column: KTA & Absen Cepat */}
                        <div className="lg:col-span-4 md:col-span-12 space-y-6">
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
                                        <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="mt-4 text-xs font-bold text-white hover:text-sky-200 flex items-center gap-1"><Camera size={14} /> Edit Profil Pribadi</button>
                                    )}
                                </div>
                            </div>

                            {/* Edit Profile Form */}
                            <AnimatePresence>
                                {isEditingProfile && !isReadOnly && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold mb-3 text-slate-800 text-sm">Update Data Pribadi</h4>
                                        <input type="text" placeholder="No. WhatsApp Aktif" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium mb-3 focus:outline-none focus:border-sky-500" value={editProfileData.phone_number} onChange={e => setEditProfileData({ ...editProfileData, phone_number: e.target.value })} />
                                        <div className="mb-3">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Upload Foto Profil (Opsional)</label>
                                            <input type="file" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-sky-500"
                                                onChange={async (e) => { if (e.target.files && e.target.files[0]) { const url = await uploadFileToSupabase(e.target.files[0]); setEditProfileData({ ...editProfileData, photo_url: url }); } }}
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
                                        <Clock size={12} />
                                        {new Date(eventToday.start_time).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {new Date(eventToday.start_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                    </p>

                                    {attendedEvents[eventToday.id] ? (
                                        <div className="bg-green-100 text-green-700 text-sm font-bold p-3 rounded-xl text-center border border-green-200 flex items-center justify-center gap-2">
                                            <CheckCircle size={18} /> Anda sudah absen hadir
                                        </div>
                                    ) : scanning ? (
                                        <div className="w-full bg-white rounded-xl relative p-2 border border-slate-200">
                                            {verifying && <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" size={24} /></div>}
                                            <div id="reader" className="w-full min-h-[300px]"></div>
                                            <button onClick={() => setScanning(false)} className="w-full mt-3 bg-red-500 text-white text-sm font-bold py-2.5 rounded-xl z-20 hover:bg-red-600 transition-colors">Batalkan Scan</button>
                                        </div>
                                    ) : scanResult ? (
                                        <div className="bg-green-100 text-green-700 text-xs font-bold p-3 rounded-lg text-center border border-green-200">
                                            {scanResult}
                                        </div>
                                    ) : (
                                        <button onClick={() => setScanning(true)} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors">
                                            <ScanLine size={18} /> Scan QR Kehadiran
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Tasks & KPI */}
                        <div className="lg:col-span-8 md:col-span-12 space-y-6">

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
                                        <Activity size={20} className="text-sky-500" />
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
                                <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2"><CheckSquare size={18} className="text-sky-500" /> Checklist Tugas Saya</h3>
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
                                    <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Users size={18} className="text-sky-400" /> Ringkasan Performa Staff Divisi</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                                                    <th className="pb-3 font-bold">Nama Staff</th>
                                                    <th className="pb-3 font-bold text-center">Tugas Proker</th>
                                                    <th className="pb-3 font-bold text-center">KPI Proker</th>
                                                    <th className="pb-3 font-bold text-center">Kehadiran</th>
                                                    <th className="pb-3 font-bold text-center">KPI Disiplin</th>
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
                                                        <td className="py-3 text-center text-slate-300">{(staff as any).hadir} / {(staff as any).totalAcara}</td>
                                                        <td className="py-3 text-center">
                                                            <span className={`px-2 py-1 rounded text-xs font-black ${(staff as any).kpiHadir >= 75 ? 'bg-green-900/50 text-green-400' : (staff as any).kpiHadir >= 50 ? 'bg-amber-900/50 text-amber-400' : 'bg-red-900/50 text-red-400'}`}>
                                                                {(staff as any).kpiHadir}%
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

                {/* VIEW 1.5: AGENDA & RAPAT */}
                {activeTab === "agenda" && !activeDivisiId && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Timeline Proker & Acara</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Pantau seluruh timeline program kerja divisi dan kegiatan organisasi.</p>
                            </div>
                            {!isReadOnly && (
                                <button onClick={() => { setShowAcaraForm(!showAcaraForm); setEditingAcaraId(null); setAcaraForm({ title: "", description: "", start_time: "", end_time: "", location: "", proker_id: "", status: "upcoming", attachment_url: "", meeting_link: "" }); }} className="bg-sky-500 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-md shadow-sky-500/20 hover:bg-sky-600 flex items-center gap-2 transition-colors">
                                    {showAcaraForm ? <X size={16} /> : <Plus size={16} />} {showAcaraForm ? "Batal" : "Tambah Acara"}
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showAcaraForm && !isReadOnly && (
                                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={submitAcara} className="bg-white p-6 rounded-3xl border border-sky-200 shadow-lg overflow-hidden mb-8">
                                    <h3 className="font-black text-lg mb-4 flex items-center gap-2">{editingAcaraId ? "Edit Acara" : "Buat Acara Baru"}</h3>
                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <input required type="text" placeholder="Judul Acara / Rapat" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={acaraForm.title} onChange={e => setAcaraForm({ ...acaraForm, title: e.target.value })} />
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={acaraForm.proker_id} onChange={e => setAcaraForm({ ...acaraForm, proker_id: e.target.value })}>
                                            <option value="" disabled>Pilih Turunan Program Kerja (Opsional)</option>
                                            {prokers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Waktu Mulai</label>
                                            <input required type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={getLocalDatetimeLocal(acaraForm.start_time)} onChange={e => setAcaraForm({ ...acaraForm, start_time: new Date(e.target.value).toISOString() })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Waktu Selesai</label>
                                            <input required type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={getLocalDatetimeLocal(acaraForm.end_time)} onChange={e => setAcaraForm({ ...acaraForm, end_time: new Date(e.target.value).toISOString() })} />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <input required type="text" placeholder="Lokasi (misal: Ruang 101, Online, Gmeet)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={acaraForm.location} onChange={e => setAcaraForm({ ...acaraForm, location: e.target.value })} />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">File Lampiran (Foto/PDF) Opsional</label>
                                            <input type="file" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium" onChange={async (e) => { if (e.target.files && e.target.files[0]) { const url = await uploadFileToSupabase(e.target.files[0]); setAcaraForm({ ...acaraForm, attachment_url: url }); } }} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Link GMeet / Zoom (Opsional)</label>
                                            <input type="url" placeholder="https://meet.google.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={acaraForm.meeting_link || ""} onChange={e => setAcaraForm({ ...acaraForm, meeting_link: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <textarea required rows={3} placeholder="Deskripsi Acara..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={acaraForm.description} onChange={e => setAcaraForm({ ...acaraForm, description: e.target.value })} />
                                        <div className="flex flex-col gap-2">
                                            <label className="block text-xs font-bold text-slate-500">Status Acara</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={acaraForm.status} onChange={e => setAcaraForm({ ...acaraForm, status: e.target.value })}>
                                                <option value="upcoming">Akan Datang</option>
                                                <option value="live">Live (Sedang Berlangsung)</option>
                                                <option value="completed">Selesai</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button disabled={isUploading} type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors disabled:bg-slate-400">{isUploading ? 'Mengunggah...' : 'Simpan Acara'}</button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* CALENDAR VIEW */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 mb-8 overflow-x-auto">
                            <div className="flex justify-between items-center mb-6 min-w-[500px]">
                                <h3 className="text-xl font-black text-slate-900">
                                    {calendarMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 min-w-[500px]">
                                {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(d => <div key={d}>{d}</div>)}
                            </div>

                            <div className="grid grid-cols-7 gap-2 min-w-[500px]">
                                {(() => {
                                    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
                                    const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();

                                    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
                                    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                                    return (
                                        <>
                                            {blanks.map(b => <div key={`blank-${b}`} className="h-24 bg-slate-50/50 rounded-xl"></div>)}
                                            {days.map(day => {
                                                const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                                                // Find events on this day
                                                const dayEvents = acaras.filter(a => {
                                                    if (!a.start_time) return false;
                                                    const d = new Date(a.start_time);
                                                    return d.getFullYear() === calendarMonth.getFullYear() && d.getMonth() === calendarMonth.getMonth() && d.getDate() === day;
                                                });

                                                const isToday = new Date().toDateString() === new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day).toDateString();
                                                const isSelected = selectedDateFilter === dateStr;

                                                return (
                                                    <div
                                                        key={day}
                                                        onClick={() => setSelectedDateFilter(isSelected ? null : dateStr)}
                                                        className={`h-24 p-2 border rounded-xl flex flex-col cursor-pointer transition-all ${isSelected ? 'border-sky-500 ring-2 ring-sky-200 bg-sky-50' : isToday ? 'border-sky-300 bg-sky-50/50' : 'border-slate-100 hover:border-sky-300'}`}
                                                    >
                                                        <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-sky-500 text-white' : 'text-slate-600'}`}>
                                                            {day}
                                                        </div>
                                                        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1">
                                                            {dayEvents.map((evt, i) => (
                                                                <div key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate ${evt.status === 'completed' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`} title={evt.title}>
                                                                    {evt.title}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    );
                                })()}
                            </div>

                            {selectedDateFilter && (
                                <div className="mt-4 flex items-center justify-between bg-sky-50 text-sky-700 px-4 py-3 rounded-xl text-sm font-bold min-w-[500px]">
                                    <span>Menampilkan acara pada: {new Date(selectedDateFilter).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    <button onClick={() => setSelectedDateFilter(null)} className="hover:text-sky-900"><X size={16} /></button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(() => {
                                const filteredAcaras = selectedDateFilter
                                    ? acaras.filter(a => {
                                        if (!a.start_time) return false;
                                        const d = new Date(a.start_time);
                                        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                        return dateStr === selectedDateFilter;
                                    })
                                    : acaras;

                                if (filteredAcaras.length === 0) {
                                    return (
                                        <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
                                            <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
                                            <p className="text-slate-500 font-bold">Belum ada agenda terdaftar saat ini.</p>
                                        </div>
                                    );
                                }

                                return filteredAcaras.map(acara => {
                                    const isCompleted = acara.status === 'completed';
                                    const eventDate = new Date(acara.start_time);
                                    const isToday = eventDate.toDateString() === new Date().toDateString();

                                    return (
                                        <div key={acara.id} className={`bg-white rounded-[2rem] border overflow-hidden transition-all relative group ${isCompleted ? 'border-slate-200 opacity-75' : isToday ? 'border-sky-400 shadow-lg shadow-sky-100' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
                                            <div className={`h-2 ${isCompleted ? 'bg-slate-300' : isToday ? 'bg-sky-500' : 'bg-blue-400'}`}></div>

                                            {!isReadOnly && (
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button onClick={() => { setShowAcaraForm(true); setEditingAcaraId(acara.id); setAcaraForm({ title: acara.title, description: acara.description || "", start_time: acara.start_time, end_time: (acara as any).end_time || acara.start_time, location: acara.location || "", proker_id: acara.proker_id || "", status: acara.status, attachment_url: acara.attachment_url || "", meeting_link: acara.meeting_link || "" }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-white p-2 rounded-lg text-sky-500 hover:bg-sky-50 shadow-sm border border-slate-200"><Edit size={14} /></button>
                                                    <button onClick={() => deleteAcara(acara.id)} className="bg-white p-2 rounded-lg text-red-500 hover:bg-red-50 shadow-sm border border-slate-200"><Trash2 size={14} /></button>
                                                </div>
                                            )}

                                            {acara.attachment_url && (
                                                acara.attachment_url.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center gap-3">
                                                        <FileText className="text-red-500" size={24} />
                                                        <a href={acara.attachment_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-sky-600 hover:underline">Lihat Lampiran PDF</a>
                                                    </div>
                                                ) : (
                                                    <div className="h-40 w-full bg-cover bg-center border-b border-slate-100" style={{ backgroundImage: `url(${acara.attachment_url})` }} />
                                                )
                                            )}

                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4 pr-16">
                                                    <h3 className="font-black text-lg text-slate-900 leading-tight">{acara.title}</h3>
                                                    {isToday && !isCompleted && (
                                                        <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase px-2 py-1 rounded-full animate-pulse flex-shrink-0">HARI INI</span>
                                                    )}
                                                </div>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0"><Clock size={14} className="text-sky-500" /></div>
                                                        <div>
                                                            <p>{eventDate.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                            <p className="text-xs text-slate-400">{eventDate.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0"><span className="text-sky-500 font-bold">@</span></div>
                                                        <div className="flex-1">
                                                            <p>{acara.location || 'Menunggu Info Lokasi'}</p>
                                                            {acara.meeting_link && (
                                                                <a href={acara.meeting_link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                                                                    Join Google Meet / Zoom
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${isCompleted ? 'bg-slate-100 text-slate-500' : 'bg-sky-50 text-sky-600'}`}>
                                                            {isCompleted ? 'Selesai' : 'Akan Datang'}
                                                        </span>

                                                        {attendedEvents[acara.id] ? (
                                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                                                <CheckCircle size={12} /> {attendedEvents[acara.id].toUpperCase()}
                                                            </span>
                                                        ) : isCompleted ? (
                                                            <span className="text-xs font-bold text-red-400">Belum Absen</span>
                                                        ) : (
                                                            <button onClick={() => { setActiveTab('dashboard'); setScanning(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-sm">
                                                                Absen Sekarang
                                                            </button>
                                                        )}
                                                    </div>

                                                    {!isReadOnly && (
                                                        <div className="flex gap-2 w-full mt-2">
                                                            <button
                                                                onClick={() => setSelectedQR(acara.jwt_secret_token)}
                                                                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                                                            >
                                                                Tampilkan QR
                                                            </button>
                                                            <a
                                                                href={`/portal/absensi/${acara.id}`}
                                                                className="flex-1 bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-100 text-xs font-bold py-2 rounded-xl transition-colors text-center"
                                                            >
                                                                Absen Manual
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            })()}
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
                        <div className="flex flex-col sm:flex-row border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
                            {[
                                { id: "profil", icon: <Info size={16} />, label: "Profil Divisi" },
                                { id: "proker", icon: <Briefcase size={16} />, label: "Program Kerja" },
                                { id: "acara", icon: <Calendar size={16} />, label: "Detail Acara & Absensi" }
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
                                                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Edit size={18} /> Edit Profil Divisi</h3>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Upload Cover/Banner Divisi</label>
                                                    <input type="file" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium"
                                                        onChange={async (e) => { if (e.target.files && e.target.files[0]) { const url = await uploadFileToSupabase(e.target.files[0]); setEditDivisionData({ ...editDivisionData, hero_image_url: url }); } }}
                                                    />
                                                </div>
                                                <textarea rows={3} placeholder="Deskripsi Singkat Divisi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={editDivisionData.description} onChange={e => setEditDivisionData({ ...editDivisionData, description: e.target.value })} />
                                                <textarea rows={3} placeholder="Visi Divisi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={editDivisionData.vision} onChange={e => setEditDivisionData({ ...editDivisionData, vision: e.target.value })} />
                                                <textarea rows={3} placeholder="Misi Divisi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={editDivisionData.mission} onChange={e => setEditDivisionData({ ...editDivisionData, mission: e.target.value })} />
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
                                        <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Plus size={18} /> Tambah Program Kerja Baru</h4>
                                        <form onSubmit={submitProker} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Proker</label>
                                                    <input required type="text" placeholder="Nama Proker" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={newProker.name} onChange={e => setNewProker({ ...newProker, name: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Upload Foto/Infografis Proker</label>
                                                    <input type="file" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium"
                                                        onChange={async (e) => { if (e.target.files && e.target.files[0]) { const url = await uploadFileToSupabase(e.target.files[0]); setNewProker({ ...newProker, image_url: url }); } }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <textarea required rows={3} placeholder="Deskripsi Makro Proker..." className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={newProker.description} onChange={e => setNewProker({ ...newProker, description: e.target.value })} />
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
                                                <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Edit size={18} /> Edit Program Kerja</h4>
                                                <form onSubmit={updateProker} className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nama Proker</label>
                                                        <input required type="text" placeholder="Nama Proker" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={editProkerData.name} onChange={e => setEditProkerData({ ...editProkerData, name: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Upload Foto/Infografis Proker</label>
                                                        <input type="file" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium"
                                                            onChange={async (e) => { if (e.target.files && e.target.files[0]) { const url = await uploadFileToSupabase(e.target.files[0]); setEditProkerData({ ...editProkerData, image_url: url }); } }}
                                                        />
                                                    </div>
                                                    <textarea required rows={3} placeholder="Deskripsi Makro Proker..." className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={editProkerData.description} onChange={e => setEditProkerData({ ...editProkerData, description: e.target.value })} />
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
                                <h3 className="font-black text-lg text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2"><Calendar size={20} className="text-sky-500" /> Daftar Acara & Bukti Kehadiran</h3>
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
                                                    <p className="text-xs font-bold text-sky-600 uppercase mb-2">Turunan Proker: {prokers.find(p => p.id === acara.proker_id)?.name}</p>
                                                    <p className="text-sm font-medium text-slate-600 mb-3">{acara.description}</p>
                                                    <div className="flex flex-col gap-2 mt-3">
                                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(acara.start_time).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(acara.start_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        {acara.meeting_link && (
                                                            <a href={acara.meeting_link} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors w-max">
                                                                Join Google Meet / Zoom
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 flex sm:flex-col justify-end sm:justify-start items-center sm:items-end gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status Kehadiran Anda</p>
                                                    {statusHadir ? (
                                                        <span className={`px-4 py-1.5 rounded-lg text-sm font-black uppercase border ${statusHadir === 'hadir' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                            {statusHadir}
                                                        </span>
                                                    ) : acara.status === 'completed' ? (
                                                        <span className="px-4 py-1.5 rounded-lg text-sm font-black uppercase bg-slate-200 text-slate-500 border border-slate-300">
                                                            BELUM ABSEN
                                                        </span>
                                                    ) : (
                                                        <button onClick={() => { setActiveTab('dashboard'); setScanning(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-sm w-full sm:w-auto text-center">
                                                            Absen Sekarang
                                                        </button>
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
                            <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Mail size={20} className="text-sky-400" /> Sistem Otomatisasi Reminder (Mailing)</h3>
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
                                        <input required type="text" placeholder="Judul Dokumen (Misal: Proposal Triwulan 1)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500" value={docUpload.title} onChange={e => setDocUpload({ ...docUpload, title: e.target.value })} />
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500" value={docUpload.type} onChange={e => setDocUpload({ ...docUpload, type: e.target.value })}>
                                            <option value="proposal">Proposal Triwulan</option>
                                            <option value="lpj">Lembar Pertanggungjawaban (LPJ)</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-slate-500 mb-2">Upload File Dokumen (PDF/Word/Excel)</label>
                                        <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${docFile ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-sky-300'}`}>
                                            <input required type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => { if (e.target.files?.[0]) setDocFile(e.target.files[0]); }} />
                                            {docFile ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <CheckCircle size={18} className="text-green-500" />
                                                    <span className="text-sm font-bold text-green-700">{docFile.name}</span>
                                                    <span className="text-xs text-green-500">({(docFile.size / 1048576).toFixed(1)} MB)</span>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                                                    <p className="text-sm font-bold text-slate-500">Klik atau drag file ke sini</p>
                                                    <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel, PowerPoint • Maks 50MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button disabled={isUploading} type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors disabled:bg-slate-400">
                                        {isUploading ? 'Mengunggah...' : 'Submit ke Sistem Approval'}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
                            <div className="space-y-4">
                                {documents.length === 0 && <p className="text-center text-slate-400 font-bold py-8">Belum ada dokumen yang diunggah pada kabinet ini.</p>}
                                {documents.map(doc => (
                                    <div key={doc.id} className="flex flex-col xl:flex-row xl:items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl gap-4 hover:border-sky-300 transition-colors group">
                                        <div className="flex items-start gap-4 min-w-0 flex-1">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-sky-500 flex-shrink-0 shadow-sm"><FileText size={24} /></div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1 w-full overflow-hidden">
                                                    <h4 className="font-black text-slate-900 text-lg truncate flex-shrink min-w-0">{doc.title}</h4>
                                                    <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded flex-shrink-0">{doc.type}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-500">Diunggah oleh: <span className="text-slate-700">{doc.pengurus?.full_name}</span> • {new Date(doc.created_at).toLocaleDateString("id-ID")}</p>

                                                {/* Approval Flow Visualizer */}
                                                <div className="flex items-center gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
                                                    {['draft', 'cek_bendahara', 'cek_sekretaris', 'approved'].map((step, idx, arr) => {
                                                        const statusMap: any = { draft: 0, cek_bendahara: 1, revisi_bendahara: 1, cek_sekretaris: 2, revisi_sekretaris: 2, approved: 3 };
                                                        const docStatusVal = statusMap[doc.status] || 0;
                                                        const isPast = idx < docStatusVal;
                                                        const isCurrent = idx === docStatusVal;

                                                        // Jika status saat ini adalah revisi, tandai merah pada tahap tersebut
                                                        const isRevisionHere = isCurrent && doc.status.includes('revisi');

                                                        let colorClasses = 'bg-slate-200 text-slate-400';
                                                        if (isRevisionHere) colorClasses = 'bg-red-500 text-white shadow-md animate-pulse';
                                                        else if (isCurrent) colorClasses = 'bg-sky-500 text-white shadow-md animate-pulse';
                                                        else if (isPast) colorClasses = 'bg-green-100 text-green-700';

                                                        return (
                                                            <div key={step} className="flex items-center">
                                                                <div className={`flex items-center justify-center h-6 w-auto px-3 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-colors ${colorClasses}`}>
                                                                    {isPast && !isCurrent ? <Check size={10} className="mr-1" /> : null}
                                                                    {isRevisionHere ? 'REVISI' : step.replace('cek_', 'Cek ')}
                                                                </div>
                                                                {idx < arr.length - 1 && <div className={`w-4 h-0.5 mx-1 ${idx < docStatusVal ? 'bg-green-400' : 'bg-slate-200'}`}></div>}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                {doc.catatan_revisi && doc.status.includes('revisi') && (
                                                    <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-xl">
                                                        <p className="text-xs font-black text-red-600 mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Catatan Revisi:</p>
                                                        <p className="text-xs text-red-700 font-medium">{doc.catatan_revisi}</p>
                                                    </div>
                                                )}

                                                {/* Action Buttons for Approvers */}
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {isBendahara && doc.status === 'cek_bendahara' && !isReadOnly && (
                                                        <>
                                                            <button onClick={() => handleDocumentAction(doc.id, 'acc_bendahara')} className="bg-green-500 hover:bg-green-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1"><Check size={14} /> ACC Bendahara</button>
                                                            <button onClick={() => handleDocumentAction(doc.id, 'revisi_bendahara')} className="bg-red-500 hover:bg-red-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1"><X size={14} /> Revisi</button>
                                                        </>
                                                    )}
                                                    {isSekretaris && doc.status === 'cek_sekretaris' && !isReadOnly && (
                                                        <>
                                                            <button onClick={() => handleDocumentAction(doc.id, 'acc_sekretaris')} className="bg-green-500 hover:bg-green-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1"><Check size={14} /> ACC Sekretaris</button>
                                                            <button onClick={() => handleDocumentAction(doc.id, 'revisi_sekretaris')} className="bg-red-500 hover:bg-red-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1"><X size={14} /> Revisi</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-black text-slate-700 hover:text-sky-600 hover:border-sky-300 transition-colors shadow-sm">
                                            <Download size={18} /> Unduh File Dokumen
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* VIEW 4: PENYIMPANAN FILE (Google Drive Style) */}
                {activeTab === "arsip" && !activeDivisiId && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                {(kbDivisionId || kbFolderId) && (
                                    <button onClick={() => {
                                        if (kbFolderId) {
                                            const currentFolder = knowledgeFolders.find(f => f.id === kbFolderId);
                                            if (currentFolder?.parent_id) {
                                                setKbFolderId(currentFolder.parent_id);
                                            } else {
                                                setKbFolderId(null);
                                            }
                                        } else {
                                            setKbDivisionId(null);
                                        }
                                        setShowKnowledgeForm(false);
                                        setShowCreateFolderForm(false);
                                    }} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
                                        <ChevronLeft size={20} className="text-slate-600" />
                                    </button>
                                )}
                                <div>
                                    <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                                        <Database size={20} className="text-sky-500" />
                                        {kbFolderId
                                            ? knowledgeFolders.find(f => f.id === kbFolderId)?.name
                                            : kbDivisionId
                                                ? (kbDivisionId === 'umum' ? 'Folder Umum' : allDivisions.find(d => d.id === kbDivisionId)?.name)
                                                : 'Penyimpanan File'}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500">
                                        {(kbDivisionId || kbFolderId) ? 'File dan folder di dalam direktori ini' : 'Pilih folder divisi untuk melihat atau mengunggah file.'}
                                    </p>
                                </div>
                            </div>
                            {(kbDivisionId || kbFolderId) && !isReadOnly && (
                                <div className="flex gap-2">
                                    <button onClick={() => { setShowCreateFolderForm(!showCreateFolderForm); setShowKnowledgeForm(false); }} className="bg-white border-2 border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-black text-sm shadow-sm hover:border-sky-300 hover:text-sky-600 flex items-center gap-2 transition-colors">
                                        <Plus size={16} /> Folder Baru
                                    </button>
                                    <button onClick={() => { setShowKnowledgeForm(!showKnowledgeForm); setShowCreateFolderForm(false); }} className="bg-sky-500 text-white px-4 py-2.5 rounded-xl font-black text-sm shadow-md shadow-sky-500/20 hover:bg-sky-600 flex items-center gap-2 transition-colors">
                                        <Upload size={16} /> Unggah File
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Create Folder Form */}
                        <AnimatePresence>
                            {showCreateFolderForm && (kbDivisionId || kbFolderId) && !isReadOnly && (
                                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={createKnowledgeFolder} className="bg-white p-6 rounded-3xl border border-sky-200 shadow-lg overflow-hidden">
                                    <h4 className="font-black text-slate-900 mb-4">Buat Folder Baru</h4>
                                    <div className="flex gap-4">
                                        <input required type="text" placeholder="Nama Folder (Misal: Dokumen Rapat)" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
                                        <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors">
                                            Buat Folder
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* Upload Form */}
                        <AnimatePresence>
                            {showKnowledgeForm && (kbDivisionId || kbFolderId) && !isReadOnly && (
                                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={submitKnowledge} className="bg-white p-6 rounded-3xl border border-sky-200 shadow-lg overflow-hidden">
                                    <h4 className="font-black text-slate-900 mb-4">Unggah File Baru</h4>
                                    <input required type="text" placeholder="Nama File (Misal: Guideline Desain Poster)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 mb-4" value={knowledgeForm.title} onChange={e => setKnowledgeForm({ ...knowledgeForm, title: e.target.value })} />
                                    <div className="mb-4">
                                        <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${knowledgeFile ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-sky-300'}`}>
                                            <input required type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => { if (e.target.files?.[0]) setKnowledgeFile(e.target.files[0]); }} />
                                            {knowledgeFile ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <CheckCircle size={24} className="text-green-500" />
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-green-700">{knowledgeFile.name}</p>
                                                        <p className="text-xs text-green-500">{formatFileSize(knowledgeFile.size)}</p>
                                                    </div>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); setKnowledgeFile(null); }} className="ml-2 text-red-400 hover:text-red-600"><X size={18} /></button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                                                    <p className="text-sm font-bold text-slate-500">Klik atau drag file ke area ini</p>
                                                    <p className="text-xs text-slate-400 mt-1">Semua format diterima • Maks 50MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button disabled={isUploading || !knowledgeFile} type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-xl text-sm transition-colors disabled:bg-slate-400 w-full sm:w-auto">
                                        {isUploading ? 'Mengunggah...' : 'Simpan ke Folder'}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* Root View (Divisions & Umum) */}
                        {!kbDivisionId && !kbFolderId && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {allDivisions.map(div => {
                                    const fileCount = knowledgeFiles.filter(f => f.division_id === div.id && !f.folder_id).length;
                                    const folderCount = knowledgeFolders.filter(f => f.division_id === div.id && !f.parent_id).length;
                                    return (
                                        <button key={div.id} onClick={() => { setKbDivisionId(div.id); setShowKnowledgeForm(false); setShowCreateFolderForm(false); }} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-md transition-all text-left group">
                                            <div className="w-14 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-sky-100 transition-colors">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500">
                                                    <path d="M2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7H11L9 5H4C2.9 5 2 5.9 2 7Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <h4 className="font-black text-slate-900 text-sm truncate">{div.name}</h4>
                                            <p className="text-xs text-slate-400 font-bold mt-1">{fileCount + folderCount} item</p>
                                        </button>
                                    );
                                })}
                                {/* Folder Umum */}
                                <button onClick={() => { setKbDivisionId('umum'); setShowKnowledgeForm(false); setShowCreateFolderForm(false); }} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all text-left group">
                                    <div className="w-14 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-500">
                                            <path d="M2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7H11L9 5H4C2.9 5 2 5.9 2 7Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <h4 className="font-black text-slate-900 text-sm">Folder Umum</h4>
                                    <p className="text-xs text-slate-400 font-bold mt-1">{knowledgeFiles.filter(f => !f.division_id && !f.folder_id).length + knowledgeFolders.filter(f => !f.division_id && !f.parent_id).length} item</p>
                                </button>
                            </div>
                        )}

                        {/* File & Folder List (when inside a folder/division) */}
                        {(kbDivisionId || kbFolderId) && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="py-3 px-6 font-bold text-slate-500">Nama</th>
                                                <th className="py-3 px-6 font-bold text-slate-500 hidden sm:table-cell">Dibuat Oleh</th>
                                                <th className="py-3 px-6 font-bold text-slate-500 hidden sm:table-cell">Ukuran</th>
                                                <th className="py-3 px-6 font-bold text-slate-500 hidden sm:table-cell">Tanggal</th>
                                                <th className="py-3 px-6 font-bold text-slate-500 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(() => {
                                                const currentFolders = kbFolderId
                                                    ? knowledgeFolders.filter(f => f.parent_id === kbFolderId)
                                                    : knowledgeFolders.filter(f => !f.parent_id && (kbDivisionId === 'umum' ? !f.division_id : f.division_id === kbDivisionId));

                                                const currentFiles = kbFolderId
                                                    ? knowledgeFiles.filter(f => f.folder_id === kbFolderId)
                                                    : knowledgeFiles.filter(f => !f.folder_id && (kbDivisionId === 'umum' ? !f.division_id : f.division_id === kbDivisionId));

                                                if (currentFolders.length === 0 && currentFiles.length === 0) {
                                                    return (
                                                        <tr><td colSpan={5} className="text-center py-12 text-slate-400">
                                                            <Database size={32} className="mx-auto mb-3 opacity-50" />
                                                            <p className="font-bold">Folder kosong</p>
                                                            <p className="text-xs mt-1">Klik "Unggah File" atau "Folder Baru" untuk mulai.</p>
                                                        </td></tr>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        {currentFolders.map(folder => (
                                                            <tr key={folder.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setKbFolderId(folder.id)}>
                                                                <td className="py-3 px-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-500 bg-amber-50">
                                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7H11L9 5H4C2.9 5 2 5.9 2 7Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                            </svg>
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="font-bold text-slate-900 truncate">{folder.name}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-6 text-slate-500 font-medium hidden sm:table-cell">-</td>
                                                                <td className="py-3 px-6 text-slate-500 font-medium hidden sm:table-cell">-</td>
                                                                <td className="py-3 px-6 text-slate-500 font-medium hidden sm:table-cell">{new Date(folder.created_at).toLocaleDateString("id-ID")}</td>
                                                                <td className="py-3 px-6" onClick={(e) => e.stopPropagation()}>
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        {(!isReadOnly) && (
                                                                            <button onClick={() => {
                                                                                if (confirm('Hapus folder ini? Semua isi di dalamnya akan terhapus.')) {
                                                                                    supabase.from('knowledge_folders').delete().eq('id', folder.id).then(() => fetchDashboardData(selectedKabinetId));
                                                                                }
                                                                            }} className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Hapus Folder">
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {currentFiles.map(file => {
                                                            const ext = file.file_url?.split('.').pop()?.toLowerCase() || '';
                                                            const isPdf = ext === 'pdf';
                                                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
                                                            const isDoc = ['doc', 'docx'].includes(ext);
                                                            const iconColor = isPdf ? 'text-red-500 bg-red-50' : isImage ? 'text-purple-500 bg-purple-50' : isDoc ? 'text-blue-500 bg-blue-50' : 'text-slate-500 bg-slate-100';

                                                            return (
                                                                <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                                                                    <td className="py-3 px-6">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                                                                                <FileText size={16} />
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <p className="font-bold text-slate-900 truncate">{file.title}</p>
                                                                                <p className="text-[10px] text-slate-400 font-bold uppercase sm:hidden">{file.pengurus?.full_name} • {formatFileSize(file.file_size)}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-6 text-slate-500 font-medium hidden sm:table-cell">{file.pengurus?.full_name || '-'}</td>
                                                                    <td className="py-3 px-6 text-slate-500 font-medium hidden sm:table-cell">{formatFileSize(file.file_size)}</td>
                                                                    <td className="py-3 px-6 text-slate-500 font-medium hidden sm:table-cell">{new Date(file.created_at).toLocaleDateString("id-ID")}</td>
                                                                    <td className="py-3 px-6">
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 p-2 rounded-lg transition-colors" title="Download">
                                                                                <Download size={16} />
                                                                            </a>
                                                                            {(file.uploaded_by === pengurus.id || isCoordinator) && !isReadOnly && (
                                                                                <button onClick={() => deleteKnowledgeFile(file.id)} className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Hapus">
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </>
                                                );
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* VIEW 5: TRANSPARANSI KEUANGAN */}
                {activeTab === "keuangan" && !activeDivisiId && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                        {/* Header Transparansi Keuangan */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div>
                                <h3 className="font-black text-xl text-slate-900">Transparansi Keuangan</h3>
                                <p className="text-sm font-medium text-slate-500">Pemantauan dana organisasi dan jatah kas divisi.</p>
                            </div>
                            {isBendahara && !isReadOnly && (
                                <button onClick={() => setShowKeuanganForm(!showKeuanganForm)} className="bg-sky-500 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-md shadow-sky-500/20 hover:bg-sky-600 flex items-center gap-2 transition-colors">
                                    <Plus size={16} /> Catat Transaksi
                                </button>
                            )}
                        </div>

                        {/* Sub-Tab Navigation */}
                        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                            {[
                                { id: "ringkasan" as const, icon: <PieChart size={16} />, label: "Ringkasan" },
                                { id: "buku_kas" as const, icon: <FileText size={16} />, label: "Buku Kas" },
                                { id: "kas_anggota" as const, icon: <Wallet size={16} />, label: "Kas Anggota" },
                                ...(isBendahara ? [{ id: "donasi" as const, icon: <ArrowDownRight size={16} />, label: "Donasi Masuk" }] : []),
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setKeuanganSubTab(tab.id); setKeuanganPage(1); }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${keuanganSubTab === tab.id
                                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Form Transaksi (Hanya Bendahara) - Always visible when toggled */}
                        <AnimatePresence>
                            {showKeuanganForm && isBendahara && !isReadOnly && (
                                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={submitKeuangan} className="bg-white p-6 rounded-3xl border border-sky-200 shadow-lg overflow-hidden">
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Jenis Transaksi</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={keuanganForm.type} onChange={e => setKeuanganForm({ ...keuanganForm, type: e.target.value as any })}>
                                                <option value="IN">Pemasukan (IN)</option>
                                                <option value="OUT">Pengeluaran (OUT)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={keuanganForm.kategori} onChange={e => setKeuanganForm({ ...keuanganForm, kategori: e.target.value })}>
                                                <option value="Donasi">Donasi / Infaq</option>
                                                <option value="Kas Anggota">Uang Kas</option>
                                                <option value="Jatah Anggaran Divisi">Jatah Anggaran Divisi</option>
                                                <option value="Operasional">Operasional (Umum)</option>
                                                <option value="Proker Divisi">Pengeluaran Proker</option>
                                                <option value="Lain-lain">Lain-lain</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                                            <input required type="text" placeholder="500000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={keuanganForm.amount} onChange={e => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                const formatted = val ? parseInt(val).toLocaleString('id-ID') : '';
                                                setKeuanganForm({ ...keuanganForm, amount: formatted });
                                            }} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                                            <input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={keuanganForm.tanggal} onChange={e => setKeuanganForm({ ...keuanganForm, tanggal: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan / Deskripsi</label>
                                            <input required type="text" placeholder="Misal: Beli konsumsi rapat" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" value={keuanganForm.description} onChange={e => setKeuanganForm({ ...keuanganForm, description: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Kaitkan ke Divisi (Opsional)</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={keuanganForm.division_id} onChange={e => setKeuanganForm({ ...keuanganForm, division_id: e.target.value })}>
                                                <option value="">-- Umum / Tanpa Divisi --</option>
                                                {allDivisions.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-slate-400 mt-1">*Jika terkait dengan budget suatu divisi</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={() => setShowKeuanganForm(false)} className="px-6 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                                        <button type="submit" className="px-6 py-3 font-bold text-white bg-sky-500 rounded-xl hover:bg-sky-600 transition-colors shadow-md shadow-sky-500/20">Simpan Transaksi</button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* === SUB-TAB: RINGKASAN === */}
                        {keuanganSubTab === "ringkasan" && (<>
                        {/* Ringkasan Saldo Organisasi */}
                        {(() => {
                            const saldoInfaq = transaksiKeuangan.filter(t => t.kategori === 'Donasi').reduce((s, t) => s + (t.type === 'IN' ? t.amount : -t.amount), 0);
                            const saldoKas = transaksiKeuangan.filter(t => t.kategori === 'Kas Anggota').reduce((s, t) => s + (t.type === 'IN' ? t.amount : -t.amount), 0);
                            const totalKeluar = transaksiKeuangan.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
                            const saldoTotal = transaksiKeuangan.reduce((s, t) => s + (t.type === 'IN' ? t.amount : -t.amount), 0);
                            return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><ArrowDownRight size={20} /></div>
                                            <h4 className="font-bold text-slate-500 text-sm">Saldo Infaq / Donasi</h4>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">Rp {saldoInfaq.toLocaleString('id-ID')}</p>
                                        <p className="text-[11px] text-slate-400 mt-1">{transaksiKeuangan.filter(t => t.kategori === 'Donasi').length} transaksi</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Wallet size={20} /></div>
                                            <h4 className="font-bold text-slate-500 text-sm">Saldo Uang Kas</h4>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">Rp {saldoKas.toLocaleString('id-ID')}</p>
                                        <p className="text-[11px] text-slate-400 mt-1">{transaksiKeuangan.filter(t => t.kategori === 'Kas Anggota').length} transaksi</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><ArrowUpRight size={20} /></div>
                                            <h4 className="font-bold text-slate-500 text-sm">Total Pengeluaran</h4>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">Rp {totalKeluar.toLocaleString('id-ID')}</p>
                                        <p className="text-[11px] text-slate-400 mt-1">{transaksiKeuangan.filter(t => t.type === 'OUT').length} transaksi keluar</p>
                                    </div>
                                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm text-white relative overflow-hidden">
                                        <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-4 translate-y-4"><Wallet size={120} /></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center"><DollarSign size={20} /></div>
                                                <h4 className="font-bold text-sky-100 text-sm">Saldo Total</h4>
                                            </div>
                                            <p className={`text-2xl font-black ${saldoTotal >= 0 ? 'text-white' : 'text-red-400'}`}>Rp {saldoTotal.toLocaleString('id-ID')}</p>
                                            <p className="text-[11px] text-slate-500 mt-1">Seluruh sumber dana</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}


                        {/* Kas Divisi */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                            <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4"><PieChart size={18} className="text-sky-500" /> Kas Divisi</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {saldoDivisiList.length === 0 ? <p className="text-xs font-bold text-slate-400 text-center py-4 col-span-full">Belum ada data</p> : null}
                                {saldoDivisiList.map(sd => {
                                    const isNegative = sd.saldo_akhir < 0;
                                    return (
                                        <div key={sd.division_id} className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between">
                                            <span className="font-bold text-xs text-slate-800 truncate">{sd.division_name}</span>
                                            <span className={`font-black text-xs ${isNegative ? 'text-red-600' : 'text-green-600'}`}>Rp {sd.saldo_akhir.toLocaleString('id-ID')}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        </>)}

                        {/* === SUB-TAB: KAS ANGGOTA === */}
                        {keuanganSubTab === "kas_anggota" && (<>
                            {/* Status Kas Pengurus - Top Middle (compact) */}
                            {!isBendahara && pengurus && (
                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                    <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4"><Wallet size={18} className="text-emerald-500" /> Pembayaran Kas Bulanan</h4>
                                    <p className="text-xs text-slate-500 mb-4">No Rekening: 082146011567 a.n Putri Rahma Wati</p>
                                    <button onClick={() => setShowKasForm(!showKasForm)} className="w-full bg-emerald-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                                        <Plus size={16} /> {showKasForm ? 'Tutup Form' : 'Bayar Kas'}
                                    </button>

                                    <AnimatePresence>
                                        {showKasForm && (
                                            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={submitPembayaranKas} className="mt-4 space-y-4 overflow-hidden">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Jumlah per Bulan (Rp)</label>
                                                    <input required type="text" placeholder="50000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={kasForm.amount} onChange={e => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                        const formatted = val ? parseInt(val).toLocaleString('id-ID') : '';
                                                        setKasForm({ ...kasForm, amount: formatted });
                                                    }} />
                                                    <p className="text-[10px] text-slate-400 mt-1">Default: Rp 50.000/bulan</p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-2">Pilih Bulan (bisa lebih dari satu)</label>
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                        {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'].map((m, i) => {
                                                            const monthNum = i + 1;
                                                            const isSelected = kasForm.selectedMonths.includes(monthNum);
                                                            return (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newMonths = isSelected
                                                                            ? kasForm.selectedMonths.filter(m => m !== monthNum)
                                                                            : [...kasForm.selectedMonths, monthNum];
                                                                        setKasForm({ ...kasForm, selectedMonths: newMonths });
                                                                    }}
                                                                    className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${isSelected
                                                                        ? 'bg-emerald-500 text-white shadow-md'
                                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                        }`}
                                                                >
                                                                    {m}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {kasForm.selectedMonths.length > 0 && (
                                                        <p className="text-[10px] text-emerald-600 mt-2">
                                                            Terpilih: {kasForm.selectedMonths.map(m => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][m - 1]).join(', ')} ({kasForm.selectedMonths.length} bulan)
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tahun</label>
                                                    <input required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" value={kasForm.tahun} onChange={e => setKasForm({ ...kasForm, tahun: parseInt(e.target.value) })} min="2020" max="2030" />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Bukti Pembayaran</label>
                                                    <input required type="file" accept="image/*,.pdf" onChange={handleKasFileUpload} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" />
                                                    {kasFile && <p className="text-[10px] text-green-600 mt-1">{kasFile.name}</p>}
                                                </div>

                                                <button type="submit" disabled={isUploading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:bg-slate-400">
                                                    {isUploading ? 'Menyimpan...' : `Kirim Pembayaran (${kasForm.selectedMonths.length} Bulan)`}
                                                </button>
                                            </motion.form>
                                        )}
                                    </AnimatePresence>

                                    {/* Status Pembayaran Kas Pengurus */}
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <h5 className="font-bold text-slate-700 text-xs mb-2">Status Pembayaran Bulan Ini</h5>
                                        {pembayaranKas.filter(k => k.pengurus_id === pengurus.id).length === 0 && (
                                            <p className="text-[11px] text-slate-400">Belum ada pembayaran</p>
                                        )}
                                        {pembayaranKas.filter(k => k.pengurus_id === pengurus.id).map(k => {
                                            const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][k.bulan - 1];
                                            return (
                                                <div key={k.id} className="flex items-center justify-between py-1 text-xs">
                                                    <span className="text-slate-600">{bulanNama} {k.tahun}</span>
                                                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${k.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                                        k.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {k.status === 'VERIFIED' ? 'Terverifikasi' : k.status === 'REJECTED' ? 'Ditolak' : 'Menunggu Verifikasi'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Bendahara View - Donasi & Status Kas (compact side by side) */}
                            {isBendahara && (
                                <div className="space-y-4">
                                    {/* Bukti Donasi from Umum */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
                                        <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                            Bukti Donasi dari Umum
                                        </h4>
                                        <p className="text-xs text-slate-500 mb-4">Donasi yang masuk dari halaman /donasi publik</p>
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {donasiTransaksi.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada donasi masuk</p>}
                                            {donasiTransaksi.map(d => {
                                                const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][new Date(d.created_at).getMonth()];
                                                return (
                                                    <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm">
                                                                    {d.is_anonymous ? 'Hamba Allah (Anonim)' : d.nama_donatur}
                                                                </p>
                                                                <p className="text-[10px] text-slate-500">{bulanNama} {new Date(d.created_at).getFullYear()} • {d.jenis_donasi}</p>
                                                            </div>
                                                            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${d.status === 'verified' ? 'bg-green-100 text-green-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {d.status === 'verified' ? 'Terverifikasi' : d.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-black text-green-600 text-sm">Rp {d.nominal.toLocaleString('id-ID')}</p>
                                                            {d.bukti_transfer_url && (
                                                                <button onClick={() => setSelectedDonasi(d)} className="text-[10px] text-sky-600 hover:underline">Lihat Bukti</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Daftar Pengurus & Status Kas */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                        <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4"><Users size={18} className="text-sky-500" /> Status Kas Pengurus</h4>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {pembayaranKas.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada pembayaran kas</p>}
                                            {pembayaranKas.sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan).map(k => {
                                                const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][k.bulan - 1];
                                                return (
                                                    <div key={k.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm">{(k as any).pengurus?.full_name || 'Pengurus'}</p>
                                                                <p className="text-[10px] text-slate-500">{bulanNama} {k.tahun}</p>
                                                            </div>
                                                            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${k.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                                                k.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                {k.status === 'VERIFIED' ? 'Terverifikasi' : k.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <a href={k.bukti_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-sky-600 hover:underline">Lihat Bukti</a>
                                                            {k.status === 'PENDING' && !isReadOnly && (
                                                                <>
                                                                    <button onClick={() => handleKasStatusChange(k.id, 'VERIFIED')} className="text-[10px] bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">ACC</button>
                                                                    <button onClick={() => {
                                                                        const note = prompt('Catatan penolakan:');
                                                                        if (note !== null) handleKasStatusChange(k.id, 'REJECTED', note);
                                                                    }} className="text-[10px] bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Tolak</button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tabel Progress Kas Pengurus (Full Table with 12 Months) */}
                            {isBendahara && allPengurusList.length > 0 && (
                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mt-6">
                                    <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                                        Tabel Progress Pembayaran Kas (Jan - Des {new Date().getFullYear()})
                                    </h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-slate-200">
                                                    <th className="py-3 px-2 font-black text-slate-700 text-xs uppercase tracking-wider sticky left-0 bg-slate-50">Nama Pengurus</th>
                                                    <th className="py-3 px-2 font-black text-slate-700 text-xs uppercase tracking-wider">Jabatan</th>
                                                    <th className="py-3 px-2 font-black text-slate-700 text-xs uppercase tracking-wider">Divisi</th>
                                                    <th className="py-3 px-2 font-black text-slate-700 text-xs uppercase tracking-wider text-center">Total</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center bg-slate-50">Jan</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center">Feb</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center bg-slate-50">Mar</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center">Apr</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center bg-slate-50">Mei</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center">Jun</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center bg-slate-50">Jul</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center">Agt</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center bg-slate-50">Sep</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center">Okt</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center bg-slate-50">Nov</th>
                                                    <th className="py-3 px-1 font-black text-slate-700 text-[10px] uppercase tracking-wider text-center">Des</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {allPengurusList.map(pengurus => {
                                                    // Get all verified payments for this pengurus for current year
                                                    const currentYear = new Date().getFullYear();
                                                    const paidMonths = pembayaranKas.filter(
                                                        k => k.pengurus_id === pengurus.id && k.tahun === currentYear && k.status === 'VERIFIED'
                                                    );
                                                    const paidMonthNums = paidMonths.map(k => k.bulan);
                                                    const pendingMonths = pembayaranKas.filter(
                                                        k => k.pengurus_id === pengurus.id && k.tahun === currentYear && k.status === 'PENDING'
                                                    );
                                                    const pendingMonthNums = pendingMonths.map(k => k.bulan);

                                                    const totalPaid = paidMonthNums.length;
                                                    const totalMonths = 12;

                                                    return (
                                                        <tr key={pengurus.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="py-3 px-2 font-bold text-slate-900 sticky left-0 bg-white">{pengurus.full_name}</td>
                                                            <td className="py-3 px-2 text-slate-600 text-xs">{pengurus.jabatan}</td>
                                                            <td className="py-3 px-2 text-slate-600 text-xs">{pengurus.divisions?.name || '-'}</td>
                                                            <td className="py-3 px-2 text-center">
                                                                <span className={`font-black text-xs px-2 py-1 rounded-full ${totalPaid === totalMonths ? 'bg-green-100 text-green-700' : totalPaid >= totalMonths / 2 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                                    {totalPaid}/{totalMonths}
                                                                </span>
                                                            </td>
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => {
                                                                const isPaid = paidMonthNums.includes(month);
                                                                const isPending = pendingMonthNums.includes(month);
                                                                const isCurrentMonth = month === new Date().getMonth() + 1;

                                                                return (
                                                                    <td key={month} className={`py-3 px-1 text-center ${month % 2 === 1 ? 'bg-slate-50' : ''}`}>
                                                                        {isPaid ? (
                                                                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full" title="Lunas"></span>
                                                                        ) : isPending ? (
                                                                            <span className="inline-block w-3 h-3 bg-amber-500 rounded-full" title="Menunggu Verifikasi"></span>
                                                                        ) : isCurrentMonth ? (
                                                                            <span className="inline-block w-3 h-3 bg-slate-300 rounded-full" title="Belum Jatuh Tempo"></span>
                                                                        ) : (
                                                                            <span className="inline-block w-3 h-3 bg-red-400 rounded-full" title="Belum Bayar"></span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span> Lunas</span>
                                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span> Menunggu Verifikasi</span>
                                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-red-400 rounded-full"></span> Belum Bayar</span>
                                        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-slate-300 rounded-full"></span> Belum Jatuh Tempo</span>
                                    </div>
                                </div>
                            )}
                        </>)}

                        {/* === SUB-TAB: DONASI MASUK (Bendahara only) === */}
                        {keuanganSubTab === "donasi" && isBendahara && (
                            <div className="space-y-4">
                                {/* Bukti Donasi from Umum */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                    <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                        Bukti Donasi dari Umum
                                        <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                            {donasiTransaksi.length} donasi
                                        </span>
                                    </h4>
                                    <p className="text-xs text-slate-500 mb-4">Donasi yang masuk dari halaman /donasi publik</p>
                                    <div className="space-y-3">
                                        {donasiTransaksi.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada donasi masuk</p>}
                                        {donasiTransaksi.map(d => {
                                            const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'][new Date(d.created_at).getMonth()];
                                            return (
                                                <div key={d.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">
                                                                {d.is_anonymous ? 'Hamba Allah (Anonim)' : d.nama_donatur}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500">{bulanNama} {new Date(d.created_at).getFullYear()} • {d.jenis_donasi}</p>
                                                        </div>
                                                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${d.status === 'verified' ? 'bg-green-100 text-green-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {d.status === 'verified' ? 'Terverifikasi' : d.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-black text-green-600 text-sm">Rp {d.nominal.toLocaleString('id-ID')}</p>
                                                        {d.bukti_transfer_url && (
                                                            <button onClick={() => setSelectedDonasi(d)} className="text-[10px] text-sky-600 hover:underline">Lihat Bukti</button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === SUB-TAB: BUKU KAS === */}
                        {keuanganSubTab === "buku_kas" && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                    Buku Kas (Histori Transaksi)
                                    <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                        {transaksiKeuangan.length} transaksi
                                    </span>
                                </h4>
                                {transaksiKeuangan.length === 0 && (
                                    <p className="text-center font-bold text-slate-400 py-10">Belum ada transaksi tercatat.</p>
                                )}
                                <div className="space-y-3">
                                    {(() => {
                                        const totalPages = Math.ceil(transaksiKeuangan.length / KEUANGAN_ITEMS_PER_PAGE);
                                        const currentPage = Math.min(keuanganPage, totalPages) || 1;
                                        const startIndex = (currentPage - 1) * KEUANGAN_ITEMS_PER_PAGE;
                                        const endIndex = startIndex + KEUANGAN_ITEMS_PER_PAGE;
                                        const paginatedTransaksi = transaksiKeuangan.slice(startIndex, endIndex);

                                        return (
                                            <>
                                                {paginatedTransaksi.map(trx => (
                                                    <div key={trx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4 hover:border-slate-200 transition-colors">
                                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                                            <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center border ${trx.type === 'IN' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                                                {trx.type === 'IN' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 mb-1 w-full overflow-hidden">
                                                                    <h5 className="font-black text-slate-900 text-sm truncate flex-shrink min-w-0">{trx.description}</h5>
                                                                    <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded flex-shrink-0">{trx.kategori}</span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 font-medium">
                                                                    {new Date(trx.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })} •
                                                                    <span className="font-bold text-slate-700 ml-1">{trx.pengurus?.full_name}</span>
                                                                    {trx.divisions?.name && <span className="ml-1 text-sky-600 bg-sky-50 px-1 rounded">({trx.divisions.name})</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto w-full">
                                                            <p className={`font-black text-sm whitespace-nowrap ${trx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {trx.type === 'IN' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                                                            </p>
                                                            {isBendahara && !isReadOnly && (
                                                                <button onClick={() => deleteKeuangan(trx.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Pagination Controls */}
                                                {totalPages > 1 && (
                                                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-slate-100 gap-4">
                                                        <p className="text-xs text-slate-500 font-bold">
                                                            Menampilkan {startIndex + 1} - {Math.min(endIndex, transaksiKeuangan.length)} dari {transaksiKeuangan.length} transaksi
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => { setKeuanganPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                                disabled={currentPage === 1}
                                                                className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                Pertama
                                                            </button>
                                                            <button
                                                                onClick={() => { setKeuanganPage(Math.max(1, currentPage - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                                disabled={currentPage === 1}
                                                                className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <ChevronLeft size={14} />
                                                            </button>

                                                            {/* Page Numbers */}
                                                            <div className="flex items-center gap-1">
                                                                {(() => {
                                                                    const pages = [];
                                                                    const maxVisible = 5;
                                                                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                                                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                                                                    if (endPage - startPage + 1 < maxVisible) {
                                                                        startPage = Math.max(1, endPage - maxVisible + 1);
                                                                    }

                                                                    for (let i = startPage; i <= endPage; i++) {
                                                                        pages.push(
                                                                            <button
                                                                                key={i}
                                                                                onClick={() => { setKeuanganPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                                                className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${currentPage === i
                                                                                    ? 'bg-sky-500 text-white shadow-md'
                                                                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                                                                    }`}
                                                                            >
                                                                                {i}
                                                                            </button>
                                                                        );
                                                                    }
                                                                    return pages;
                                                                })()}
                                                            </div>

                                                            <button
                                                                onClick={() => { setKeuanganPage(Math.min(totalPages, currentPage + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                                disabled={currentPage === totalPages}
                                                                className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <ChevronRight size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => { setKeuanganPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                                disabled={currentPage === totalPages}
                                                                className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                Terakhir
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                    </motion.div>
                )}

            </div>
        </div>
    );
}

// Simple icons
function TargetIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg> }
function FlagIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg> }
