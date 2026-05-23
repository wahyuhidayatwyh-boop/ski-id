"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Target, Users, Compass, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";

interface Pengurus {
    id: string;
    full_name: string;
    jabatan: string;
    nim?: string;
    prodi?: string;
    photo_url?: string;
    role_level: string;
    division_id?: string;
    kabinet_id: string;
}

interface Division {
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

interface Kabinet {
    id: string;
    name: string;
    period: string;
    logo_url?: string;
    tagline?: string;
    description?: string;
    visi?: string;
    misi: string[];
    structure_image_url?: string;
    hero_image_url?: string;
    is_active: boolean;
}

export default function ProfilClient() {
    const [kabinets, setKabinets] = useState<Kabinet[]>([]);
    const [pengurus, setPengurus] = useState<Pengurus[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedKabinetId, setSelectedKabinetId] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"interactive" | "image">("interactive");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [{ data: kab }, { data: pen }, { data: div }] = await Promise.all([
            supabase.from("kabinets").select("*").order("is_active", { ascending: false }).order("created_at", { ascending: false }),
            supabase.from("pengurus").select("*").eq("status", "active"),
            supabase.from("divisions").select("*"),
        ]);
        const kabData = kab || [];
        setKabinets(kabData);
        setPengurus(pen || []);
        setDivisions(div || []);
        if (kabData.length > 0) setSelectedKabinetId(kabData[0].id);
        setLoading(false);
    };

    const activeCabinet = kabinets.find(k => k.id === selectedKabinetId) || kabinets[0];
    const kabinetPengurus = pengurus.filter(p => p.kabinet_id === selectedKabinetId);

    // Helper to find pengurus by role
    const byRole = (role: string) => kabinetPengurus.find(p => p.role_level === role);
    const allByRole = (role: string) => kabinetPengurus.filter(p => p.role_level === role);

    const MemberCard = ({ p, label, showFullInfo = false }: { p: Pengurus | undefined; label: string; showFullInfo?: boolean }) => {
        if (!p) return null;
        return (
            <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm text-center">
                <span className="text-[9px] uppercase font-bold text-gray-400 block">{label}</span>
                {p.photo_url && <img src={p.photo_url} alt={p.full_name} className="w-10 h-10 rounded-full object-cover mx-auto mt-1.5 mb-1" />}
                <h4 className="font-bold text-xs text-[#1e293b] truncate mt-0.5">{p.full_name}</h4>
                {p.nim && <p className="text-[8px] text-gray-500 mt-0.5 truncate">{p.nim} • {p.prodi}</p>}
            </div>
        );
    };

    // Helper to get division members
    const getDivisionMembers = (divisionId: string) => {
        return kabinetPengurus.filter(p => p.division_id === divisionId);
    };

    // Helper to get division by ID
    const getDivisionById = (divisionId: string) => {
        return divisions.find(d => d.id === divisionId);
    };

    if (loading) return (
        <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#0ea5e9]" size={48} />
        </div>
    );

    // Fallback: jika belum ada data kabinet di DB, tampilkan pesan
    if (kabinets.length === 0) return (
        <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md">
                <p className="text-2xl font-bold text-gray-700 mb-3">Data Kabinet Belum Ada</p>
                <p className="text-gray-500">Silakan tambahkan kabinet melalui Admin CMS terlebih dahulu.</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[#f8fafc] min-h-screen">

            {/* Hero */}
            <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
                <img src={activeCabinet?.hero_image_url || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1600&auto=format&fit=crop"}
                    alt="Pengurus SKI" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b]/90 via-[#1e293b]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="container mx-auto px-4 md:px-8 lg:px-12">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-4xl">
                            Profil Kepengurusan SKI
                        </h1>
                        <p className="text-gray-200 text-lg max-w-2xl leading-relaxed">
                            {activeCabinet?.description || "Temukan visi, misi, dan struktur organisasi kepengurusan Sentral Kerohanian Islam."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12">

                {/* Cabinet Selector */}
                <div className="max-w-md mx-auto mb-16 relative">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
                        Pilih Periode Kabinet
                    </label>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between px-6 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm font-semibold text-[#1e293b] hover:bg-gray-50 transition-colors">
                        <span>{activeCabinet ? `Kabinet ${activeCabinet.name} (${activeCabinet.period})` : "Pilih Kabinet"}</span>
                        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                className="absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                {kabinets.map((kab) => (
                                    <button key={kab.id} onClick={() => { setSelectedKabinetId(kab.id); setIsDropdownOpen(false); }}
                                        className={`w-full text-left px-6 py-3.5 text-sm font-semibold hover:bg-sky-50 transition-colors flex items-center justify-between ${kab.id === selectedKabinetId ? "text-[#0ea5e9] bg-sky-50/50" : "text-gray-700"}`}>
                                        <span>Kabinet {kab.name} ({kab.period})</span>
                                        {kab.is_active && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Aktif</span>}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Cabinet Overview */}
                {activeCabinet && (
                    <AnimatePresence mode="wait">
                        <motion.div key={activeCabinet.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
                            className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-16">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                {/* Logo & Tagline */}
                                <div className="lg:col-span-4 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-gray-100 pb-8 lg:pb-0 lg:pr-12">
                                    <div className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center p-6 border border-gray-100 shadow-inner mb-6">
                                        {activeCabinet.logo_url ? (
                                            <img src={activeCabinet.logo_url} alt={activeCabinet.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="text-5xl">🏛️</div>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Kabinet {activeCabinet.name}</h2>
                                    <p className="text-sm font-semibold text-[#0ea5e9] mb-4">{activeCabinet.period}</p>
                                    {activeCabinet.tagline && (
                                        <p className="text-sm italic text-gray-500 max-w-xs font-medium">
                                            &ldquo;{activeCabinet.tagline}&rdquo;
                                        </p>
                                    )}
                                </div>

                                {/* Visi Misi */}
                                <div className="lg:col-span-8">
                                    {activeCabinet.description && (
                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold text-[#1e293b] mb-3 flex items-center gap-2">
                                                <Compass size={20} className="text-[#0ea5e9]" /> Deskripsi Kabinet
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed">{activeCabinet.description}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {activeCabinet.visi && (
                                            <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100/50">
                                                <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                                                    <Target size={20} className="text-[#0ea5e9]" /> Visi Kabinet
                                                </h3>
                                                <p className="text-gray-600 leading-relaxed text-sm">{activeCabinet.visi}</p>
                                            </div>
                                        )}
                                        {activeCabinet.misi && activeCabinet.misi.length > 0 && (
                                            <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100/50">
                                                <h3 className="text-lg font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                                                    <Award size={20} className="text-[#0ea5e9]" /> Misi Kabinet
                                                </h3>
                                                <ul className="flex flex-col gap-2.5 text-gray-600 text-sm list-disc pl-4">
                                                    {activeCabinet.misi.map((m, idx) => (
                                                        <li key={idx} className="leading-relaxed">{m}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Struktur Kepengurusan */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-2 flex items-center gap-2">
                                <Users size={24} className="text-[#0ea5e9]" /> Struktur Kepengurusan
                            </h2>
                            <p className="text-gray-500 text-sm">Bagan kepengurusan Kabinet {activeCabinet?.name} periode {activeCabinet?.period}</p>
                        </div>
                        <div className="flex bg-gray-100 p-1.5 rounded-xl self-start md:self-auto">
                            <button onClick={() => setActiveTab("interactive")}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "interactive" ? "bg-white text-[#1e293b] shadow-sm" : "text-gray-500 hover:text-[#1e293b]"}`}>
                                Bagan Interaktif
                            </button>
                            {activeCabinet?.structure_image_url && (
                                <button onClick={() => setActiveTab("image")}
                                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "image" ? "bg-white text-[#1e293b] shadow-sm" : "text-gray-500 hover:text-[#1e293b]"}`}>
                                    Gambar Bagan
                                </button>
                            )}
                        </div>
                    </div>

                    {activeTab === "interactive" && (
                        <div className="overflow-x-auto pb-4">
                            {kabinetPengurus.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-semibold">Belum ada data pengurus untuk kabinet ini</p>
                                    <p className="text-sm mt-1">Tambahkan pengurus melalui Admin CMS → Profil → Tab Pengurus</p>
                                </div>
                            ) : (
                                <div className="min-w-[700px] flex flex-col items-center py-6 gap-8">
                                    {/* Ketua Umum & Wakil */}
                                    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                                        {byRole("ketuum") && (
                                            <div className="bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] text-white p-4 rounded-2xl shadow-md text-center w-full border border-[#0ea5e9]">
                                                <span className="text-[9px] uppercase font-bold text-sky-100 tracking-wider block">Ketua Umum</span>
                                                {byRole("ketuum")!.photo_url && <img src={byRole("ketuum")!.photo_url} alt="" className="w-12 h-12 rounded-full object-cover mx-auto my-2 border-2 border-white/30" />}
                                                <h4 className="font-bold text-sm">{byRole("ketuum")!.full_name}</h4>
                                                {byRole("ketuum")!.nim && <p className="text-[9px] text-sky-100 mt-0.5">{byRole("ketuum")!.nim}</p>}
                                            </div>
                                        )}
                                        {byRole("wakil") && (
                                            <div className="bg-white border-2 border-[#0ea5e9] p-3 rounded-xl text-center w-full">
                                                <span className="text-[9px] uppercase font-bold text-[#0ea5e9] block">Wakil Ketua</span>
                                                {byRole("wakil")!.photo_url && <img src={byRole("wakil")!.photo_url} alt="" className="w-10 h-10 rounded-full object-cover mx-auto my-2 border-2 border-[#0ea5e9]/30" />}
                                                <h4 className="font-bold text-xs text-[#1e293b] mt-0.5">{byRole("wakil")!.full_name}</h4>
                                                {byRole("wakil")!.nim && <p className="text-[8px] text-gray-500">{byRole("wakil")!.nim}</p>}
                                            </div>
                                        )}
                                    </div>

                                    {/* BPH Row */}
                                    {(byRole("sekretaris1") || byRole("sekretaris2") || byRole("bendahara1") || byRole("bendahara2") || allByRole("dpo").length > 0) && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                                            {byRole("sekretaris1") && <MemberCard p={byRole("sekretaris1")} label="Sekretaris 1" />}
                                            {byRole("sekretaris2") && <MemberCard p={byRole("sekretaris2")} label="Sekretaris 2" />}
                                            {byRole("bendahara1") && <MemberCard p={byRole("bendahara1")} label="Bendahara 1" />}
                                            {byRole("bendahara2") && <MemberCard p={byRole("bendahara2")} label="Bendahara 2" />}
                                            {allByRole("dpo").map((p, i) => <MemberCard key={i} p={p} label="DPO" />)}
                                        </div>
                                    )}

                                    {/* Divisi Sections */}
                                    {(() => {
                                        // Get unique division IDs from div_ketua and lso_ketua
                                        const divKoordinatorIds = allByRole("div_ketua").map(p => p.division_id).filter(Boolean) as string[];
                                        const lsoKoordinatorIds = allByRole("lso_ketua").map(p => p.division_id).filter(Boolean) as string[];

                                        if (divKoordinatorIds.length === 0 && lsoKoordinatorIds.length === 0) return null;

                                        return (
                                            <div className="w-full space-y-10">
                                                {/* LSO Sections - Displayed FIRST */}
                                                {lsoKoordinatorIds.length > 0 && (
                                                    <div className="w-full">
                                                        <div className="flex items-center gap-3 mb-6 justify-center">
                                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                                            <span className="text-sm font-bold text-gray-500 uppercase px-4 whitespace-nowrap">Lembaga Semi Otonom (LSO)</span>
                                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                                                            {lsoKoordinatorIds.map((divId, idx) => {
                                                                const division = getDivisionById(divId);
                                                                const koordinator = allByRole("lso_ketua").find(p => p.division_id === divId);
                                                                const members = getDivisionMembers(divId).filter(p => p.role_level === 'staff');

                                                                if (!division && !koordinator) return null;

                                                                return (
                                                                    <Link href={`/profil/divisi/${encodeURIComponent(division?.name || '')}`} key={idx} className="block group">
                                                                        <div className="bg-white border border-[#0ea5e9]/20 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:border-[#0ea5e9]/50 transition-all duration-300">
                                                                            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-gray-100">
                                                                                <span className="text-xl md:text-2xl flex-shrink-0">{division?.icon || '🏛️'}</span>
                                                                                <div className="min-w-0">
                                                                                    <h4 className="font-bold text-sm md:text-base text-[#1e293b] truncate">{division?.name || 'LSO'}</h4>
                                                                                    {division?.description && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{division.description}</p>}
                                                                                </div>
                                                                            </div>

                                                                            {koordinator && (
                                                                                <div className="mb-3">
                                                                                    <p className="text-[8px] md:text-[9px] uppercase font-bold text-[#0ea5e9] mb-2">Koordinator</p>
                                                                                    <div className="flex items-center gap-2.5 bg-sky-50/80 p-2 rounded-xl">
                                                                                        {koordinator.photo_url && (
                                                                                            <img src={koordinator.photo_url} alt={koordinator.full_name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-sky-200 flex-shrink-0" />
                                                                                        )}
                                                                                        <div className="min-w-0">
                                                                                            <p className="font-bold text-xs text-[#1e293b] truncate">{koordinator.full_name}</p>
                                                                                            {koordinator.nim && <p className="text-[8px] md:text-[9px] text-gray-500 truncate">{koordinator.nim}</p>}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {members.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-[8px] md:text-[9px] uppercase font-bold text-gray-400 mb-2">Anggota ({members.length})</p>
                                                                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                                                                                        {members.slice(0, 8).map((m, i) => (
                                                                                            <div key={i} className="bg-gray-50 p-1.5 rounded-lg text-center">
                                                                                                {m.photo_url && (
                                                                                                    <img src={m.photo_url} alt={m.full_name} className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover mx-auto mb-0.5" />
                                                                                                )}
                                                                                                <p className="font-semibold text-[8px] md:text-[10px] text-[#1e293b] truncate">{m.full_name.split(' ')[0]}</p>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Divisi Organisasi - Displayed SECOND */}
                                                {divKoordinatorIds.length > 0 && (
                                                    <div className="w-full">
                                                        <div className="flex items-center gap-3 mb-6 justify-center">
                                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                                            <span className="text-sm font-bold text-gray-500 uppercase px-4 whitespace-nowrap">Divisi Organisasi</span>
                                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                                                            {divKoordinatorIds.map((divId, idx) => {
                                                                const division = getDivisionById(divId);
                                                                const koordinator = allByRole("div_ketua").find(p => p.division_id === divId);
                                                                const members = getDivisionMembers(divId).filter(p => p.role_level === 'staff');

                                                                if (!division && !koordinator) return null;

                                                                return (
                                                                    <Link href={`/profil/divisi/${encodeURIComponent(division?.name || '')}`} key={idx} className="block group">
                                                                        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:border-sky-300 transition-all duration-300">
                                                                            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-gray-100">
                                                                                <span className="text-xl md:text-2xl flex-shrink-0">{division?.icon || '📋'}</span>
                                                                                <div className="min-w-0">
                                                                                    <h4 className="font-bold text-sm md:text-base text-[#1e293b] truncate">{division?.name || 'Divisi'}</h4>
                                                                                    {division?.description && <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{division.description}</p>}
                                                                                </div>
                                                                            </div>

                                                                            {koordinator && (
                                                                                <div className="mb-3">
                                                                                    <p className="text-[8px] md:text-[9px] uppercase font-bold text-[#0ea5e9] mb-2">Koordinator</p>
                                                                                    <div className="flex items-center gap-2.5 bg-sky-50/80 p-2 rounded-xl">
                                                                                        {koordinator.photo_url && (
                                                                                            <img src={koordinator.photo_url} alt={koordinator.full_name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-sky-200 flex-shrink-0" />
                                                                                        )}
                                                                                        <div className="min-w-0">
                                                                                            <p className="font-bold text-xs text-[#1e293b] truncate">{koordinator.full_name}</p>
                                                                                            {koordinator.nim && <p className="text-[8px] md:text-[9px] text-gray-500 truncate">{koordinator.nim}</p>}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {members.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-[8px] md:text-[9px] uppercase font-bold text-gray-400 mb-2">Anggota ({members.length})</p>
                                                                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                                                                                        {members.slice(0, 8).map((m, i) => (
                                                                                            <div key={i} className="bg-gray-50 p-1.5 rounded-lg text-center">
                                                                                                {m.photo_url && (
                                                                                                    <img src={m.photo_url} alt={m.full_name} className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover mx-auto mb-0.5" />
                                                                                                )}
                                                                                                <p className="font-semibold text-[8px] md:text-[10px] text-[#1e293b] truncate">{m.full_name.split(' ')[0]}</p>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "image" && activeCabinet?.structure_image_url && (
                        <div className="flex flex-col items-center">
                            <div className="relative max-w-4xl border border-gray-200 rounded-3xl overflow-hidden shadow-md bg-gray-50">
                                <img src={activeCabinet.structure_image_url} alt="Bagan Struktur"
                                    className="w-full h-auto object-contain max-h-[600px] hover:scale-105 transition-transform duration-500 cursor-zoom-in" />
                            </div>
                            <p className="text-xs text-gray-400 mt-4 text-center">
                                *Klik kanan untuk mengunduh bagan struktur
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
