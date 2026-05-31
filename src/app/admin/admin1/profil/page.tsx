"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    Users, Plus, Edit, Trash2, Search, Loader2,
    Briefcase, UserCircle, Building2, Crown, Star, CheckCircle2
} from "lucide-react";

interface Kabinet { id: string; name: string; period: string; logo_url?: string; tagline?: string; is_active: boolean; }
interface Division { id: string; name: string; description?: string; icon?: string; kabinet_id?: string; kabinets?: { name: string; period: string }[] | null; }
interface Pengurus { id: string; full_name: string; jabatan?: string; role_level?: string; photo_url?: string; status?: string; kabinet_id?: string; division_id?: string; kabinets?: { name: string }[] | null; divisions?: { name: string }[] | null; }

type TabType = "kabinet" | "divisi" | "pengurus";

export default function Admin1Profil() {
    const router = useRouter();
    const role = "admin1";
    const [activeTab, setActiveTab] = useState<TabType>("kabinet");
    const [kabinets, setKabinets] = useState<Kabinet[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [pengurus, setPengurus] = useState<Pengurus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [filterKabinetId, setFilterKabinetId] = useState<string>("");

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        const [{ data: kab }, { data: div }, { data: pen }] = await Promise.all([
            supabase.from("kabinets").select("*").order("created_at", { ascending: false }),
            supabase.from("divisions").select("*, kabinets(name, period)").order("name"),
            supabase.from("pengurus").select("id,full_name,jabatan,role_level,photo_url,status,kabinet_id,kabinets(name),divisions(name)").order("created_at", { ascending: false }),
        ]);
        setKabinets(kab || []);
        setDivisions(div || []);
        setPengurus(pen || []);
        // Auto-set filter ke kabinet aktif
        if (kab && kab.length > 0) {
            const active = kab.find(k => k.is_active);
            setFilterKabinetId(active?.id || kab[0].id);
        }
        setLoading(false);
    };

    const handleSetActive = async (id: string) => {
        await supabase.from("kabinets").update({ is_active: false }).neq("id", "none");
        await supabase.from("kabinets").update({ is_active: true }).eq("id", id);
        fetchAll();
    };

    const handleDelete = async (table: string, id: string, label: string) => {
        console.log(`handleDelete called: table=${table}, id=${id}, label=${label}`);
        // Use a simple confirm with a timeout to ensure it stays visible
        const confirmed = window.confirm(`Hapus ${label}?`);
        if (!confirmed) {
            console.log("User cancelled delete");
            return;
        }
        console.log("User confirmed delete, proceeding...");
        setDeletingId(id);
        console.log(`Deleting from ${table} with id: ${id}`);
        const { data, error } = await supabase.from(table).delete().eq("id", id).select();
        setDeletingId(null);
        if (error) {
            console.error("Delete error:", error);
            alert("Gagal menghapus: " + error.message);
            return;
        }
        console.log("Delete successful:", data);
        fetchAll();
    };

    const filteredKabinets = kabinets.filter(k => k.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredDivisions = divisions
        .filter(d => !filterKabinetId || (d as any).kabinet_id === filterKabinetId)
        .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredPengurus = pengurus
        .filter(p => !filterKabinetId || p.kabinet_id === filterKabinetId)
        .filter(p =>
            (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.jabatan || "").toLowerCase().includes(searchQuery.toLowerCase())
        );

    const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
        { id: "kabinet", label: "Kabinet", icon: <Crown size={16} />, count: kabinets.length },
        { id: "divisi", label: "Divisi", icon: <Briefcase size={16} />, count: filteredDivisions.length },
        { id: "pengurus", label: "Pengurus", icon: <Users size={16} />, count: filteredPengurus.length },
    ];

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-sky-500" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar role={role} />
            <main className="lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">Kelola Profil Organisasi</h1>
                        <p className="text-gray-500 text-sm">Kelola kabinet, divisi, dan pengurus SKI</p>
                    </div>
                    <button
                        onClick={() => router.push(`/admin/${role}/profil/new?tab=${activeTab}`)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <Plus size={20} />
                        {activeTab === "kabinet" ? "Tambah Kabinet" : activeTab === "divisi" ? "Tambah Divisi" : "Tambah Pengurus"}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm w-fit">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-sky-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
                            {tab.icon} {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Filter Kabinet (untuk tab divisi dan pengurus) */}
                {(activeTab === "divisi" || activeTab === "pengurus") && (
                    <div className="mb-4 flex items-center gap-3">
                        <Building2 size={16} className="text-sky-500" />
                        <label className="text-sm font-semibold text-gray-600">Filter Kabinet:</label>
                        <select
                            value={filterKabinetId}
                            onChange={e => { setFilterKabinetId(e.target.value); setSearchQuery(""); }}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium text-gray-700"
                        >
                            <option value="">Semua Kabinet</option>
                            {kabinets.map(k => (
                                <option key={k.id} value={k.id}>
                                    {k.name} ({k.period}){k.is_active ? " ✓ Aktif" : ""}
                                </option>
                            ))}
                        </select>
                        {filterKabinetId && (
                            <span className="text-xs text-sky-600 font-semibold bg-sky-50 px-2 py-1 rounded-lg">
                                {kabinets.find(k => k.id === filterKabinetId)?.name}
                            </span>
                        )}
                    </div>
                )}

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Cari ${activeTab}...`}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                </div>

                {/* ======= TAB KABINET ======= */}
                {activeTab === "kabinet" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredKabinets.map((kab) => (
                            <motion.div key={kab.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="h-2 bg-gradient-to-r from-sky-500 to-blue-600" />
                                <div className="p-5">
                                    <div className="flex items-start gap-3 mb-4">
                                        {kab.logo_url ? (
                                            <img src={kab.logo_url} alt={kab.name} className="w-14 h-14 object-contain rounded-xl bg-gray-50 p-1 border border-gray-100" />
                                        ) : (
                                            <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center border border-sky-100">
                                                <Crown size={24} className="text-sky-500" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-800 truncate">{kab.name}</h3>
                                                {kab.is_active && (
                                                    <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        <CheckCircle2 size={10} /> Aktif
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-sky-600 font-semibold">{kab.period}</p>
                                            {kab.tagline && <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">"{kab.tagline}"</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                        {!kab.is_active && (
                                            <button onClick={() => handleSetActive(kab.id)}
                                                className="flex-1 px-3 py-2 text-xs font-semibold text-green-600 border border-green-200 rounded-xl hover:bg-green-50 transition-colors">
                                                Set Aktif
                                            </button>
                                        )}
                                        <button onClick={() => router.push(`/admin/${role}/profil/kabinet/${kab.id}/edit`)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs border border-gray-200 rounded-xl text-gray-600 hover:border-sky-500 hover:text-sky-600 transition-colors">
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete("kabinets", kab.id, `Kabinet ${kab.name}`)}
                                            disabled={deletingId === kab.id}
                                            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                            {deletingId === kab.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {filteredKabinets.length === 0 && (
                            <div className="col-span-3 bg-white rounded-2xl p-12 text-center border border-gray-100">
                                <Crown size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 mb-4">Belum ada kabinet</p>
                                <button onClick={() => router.push(`/admin/${role}/profil/new?tab=kabinet`)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold">
                                    <Plus size={18} /> Tambah Kabinet Pertama
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ======= TAB DIVISI ======= */}
                {activeTab === "divisi" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDivisions.map((div) => {
                            const kabinet = (div.kabinets as any);
                            return (
                                <motion.div key={div.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 text-lg">
                                            {div.icon || <Briefcase size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-800 truncate">{div.name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{div.description || "Tidak ada deskripsi"}</p>
                                            {kabinet && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    <span className="text-[10px] bg-sky-100 text-sky-700 font-semibold px-2 py-0.5 rounded-full">
                                                        {kabinet.name} {kabinet.period}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                        <button onClick={() => router.push(`/admin/${role}/profil/divisi/${div.id}/edit`)}
                                            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-sky-500 hover:text-sky-600 transition-colors">
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete("divisions", div.id, `Divisi ${div.name}`)}
                                            disabled={deletingId === div.id}
                                            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                            {deletingId === div.id ? (
                                                <Loader2 size={15} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={15} />
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {filteredDivisions.length === 0 && (
                            <div className="col-span-3 bg-white rounded-2xl p-12 text-center border border-gray-100">
                                <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 mb-4">Belum ada divisi</p>
                                <button onClick={() => router.push(`/admin/${role}/profil/new?tab=divisi`)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold">
                                    <Plus size={18} /> Tambah Divisi Pertama
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ======= TAB PENGURUS ======= */}
                {activeTab === "pengurus" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {filteredPengurus.length === 0 ? (
                            <div className="p-12 text-center">
                                <UserCircle size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 mb-4">Belum ada pengurus</p>
                                <button onClick={() => router.push(`/admin/${role}/profil/new?tab=pengurus`)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold">
                                    <Plus size={18} /> Tambah Pengurus
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px]">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Nama</th>
                                            <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Jabatan</th>
                                            <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Kabinet</th>
                                            <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Divisi</th>
                                            <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                            <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredPengurus.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {p.photo_url ? (
                                                            <img src={p.photo_url} alt={p.full_name} className="w-9 h-9 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center">
                                                                <UserCircle size={20} className="text-sky-500" />
                                                            </div>
                                                        )}
                                                        <span className="font-semibold text-gray-800 text-sm">{p.full_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">{p.jabatan || "-"}</td>
                                                <td className="p-4 text-sm text-gray-600">{(p.kabinets as any)?.name || "-"}</td>
                                                <td className="p-4 text-sm text-gray-600">{(p.divisions as any)?.name || "-"}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                        {p.status === "active" ? "Aktif" : "Non-Aktif"}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => router.push(`/admin/${role}/profil/pengurus/${p.id}/edit`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                            <Edit size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete("pengurus", p.id!, `Pengurus ${p.full_name}`)}
                                                            disabled={deletingId === p.id}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                            {deletingId === p.id ? (
                                                                <Loader2 size={15} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={15} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}