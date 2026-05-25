import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Target, Flag, Compass, User, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const { data } = await supabase
        .from("divisions")
        .select("name, description")
        .ilike("name", decodeURIComponent(slug))
        .single();
    if (!data) return { title: "Divisi Tidak Ditemukan" };
    return { title: `${data.name} | SKI Telkom Purwokerto`, description: data.description };
}

export default async function DivisiDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Cari divisi
    const { data: division } = await supabase
        .from("divisions")
        .select("*")
        .ilike("name", decodedSlug)
        .single();

    if (!division) notFound();

    // Ambil kabinet aktif
    const { data: kabinet } = await supabase
        .from("kabinets")
        .select("*")
        .eq("is_active", true)
        .single();

    // Ambil pengurus divisi ini dari kabinet aktif
    const { data: pengurusList } = await supabase
        .from("pengurus")
        .select("*")
        .eq("division_id", division.id)
        .eq("kabinet_id", kabinet?.id ?? "")
        .order("role_level");

    // Ambil program kerja dari tabel prokers (kabinet aktif)
    const { data: prokers } = await supabase
        .from("prokers")
        .select("*")
        .eq("division_id", division.id)
        .eq("kabinet_id", kabinet?.id ?? "")
        .order("created_at", { ascending: false });

    const coordinator = pengurusList?.find(p =>
        ["div_ketua", "lso_ketua", "ketuum"].includes(p.role_level)
    );
    const staffMembers = pengurusList?.filter(p =>
        !["div_ketua", "lso_ketua", "ketuum"].includes(p.role_level)
    ) ?? [];

    const statusIcon = (status: string) => {
        if (status === "selesai") return <CheckCircle2 size={12} className="text-green-500" />;
        if (status === "berjalan") return <Clock size={12} className="text-sky-500" />;
        return <AlertCircle size={12} className="text-amber-500" />;
    };
    const statusLabel = (status: string) => {
        if (status === "selesai") return "Selesai";
        if (status === "berjalan") return "Berjalan";
        return "Direncanakan";
    };
    const statusColor = (status: string) => {
        if (status === "selesai") return "bg-green-50 text-green-700 border-green-200";
        if (status === "berjalan") return "bg-sky-50 text-sky-700 border-sky-200";
        return "bg-amber-50 text-amber-700 border-amber-200";
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen">

            {/* Hero Section */}
            <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-900">
                {division.hero_image_url ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center scale-105"
                        style={{ backgroundImage: `url(${division.hero_image_url})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-800 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 container mx-auto">
                    <Link
                        href="/profil"
                        className="inline-flex items-center gap-2 text-sky-300 hover:text-white font-semibold text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} /> Kembali ke Profil
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-5xl sm:text-6xl drop-shadow-lg">{division.icon || "🏛️"}</span>
                        <div>
                            <p className="text-sky-300 text-xs font-bold uppercase tracking-widest mb-1">
                                {kabinet?.name ?? "Kabinet Aktif"}
                            </p>
                            <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-md">
                                {division.name}
                            </h1>
                            {division.description && (
                                <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-2xl">
                                    {division.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 lg:px-12 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ===================== LEFT / MAIN COLUMN ===================== */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Visi & Misi */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-black text-[#1e293b] mb-6 flex items-center gap-2">
                                <Target size={20} className="text-[#0ea5e9]" /> Visi & Misi
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
                                            <Target size={14} className="text-white" />
                                        </div>
                                        <h3 className="font-black text-[#1e293b] text-sm">Visi</h3>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {division.vision || "Belum ada visi yang ditulis."}
                                    </p>
                                </div>
                                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                                            <Flag size={14} className="text-white" />
                                        </div>
                                        <h3 className="font-black text-[#1e293b] text-sm">Misi</h3>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {division.mission || "Belum ada misi yang ditulis."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Program Kerja */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-black text-[#1e293b] mb-6 flex items-center gap-2">
                                <Compass size={20} className="text-[#0ea5e9]" /> Program Kerja
                                <span className="ml-auto text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                                    {prokers?.length ?? 0} Proker
                                </span>
                            </h2>
                            {!prokers || prokers.length === 0 ? (
                                <div className="text-center py-12">
                                    <Compass size={40} className="mx-auto text-gray-200 mb-3" />
                                    <p className="text-gray-400 text-sm">Belum ada program kerja yang ditambahkan.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {prokers.map((proker: any) => (
                                        <div
                                            key={proker.id}
                                            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
                                        >
                                            {proker.image_url && (
                                                <div
                                                    className="h-36 bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${proker.image_url})` }}
                                                />
                                            )}
                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h3 className="font-black text-[#1e293b] text-sm leading-tight">{proker.name}</h3>
                                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap flex-shrink-0 ${statusColor(proker.status)}`}>
                                                        {statusIcon(proker.status)} {statusLabel(proker.status)}
                                                    </span>
                                                </div>
                                                {proker.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{proker.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ===================== RIGHT / SIDEBAR COLUMN ===================== */}
                    <div className="space-y-6">

                        {/* Koordinator Card */}
                        <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg">
                            <p className="text-[10px] font-black uppercase tracking-widest text-sky-200 mb-4">Koordinator</p>
                            {coordinator ? (
                                <div className="flex items-center gap-4">
                                    {coordinator.photo_url ? (
                                        <img
                                            src={coordinator.photo_url}
                                            alt={coordinator.full_name}
                                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-md flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <User size={28} className="text-white" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-black text-lg leading-tight">{coordinator.full_name}</h3>
                                        <p className="text-sky-200 text-xs font-bold uppercase tracking-wider mt-1">
                                            {coordinator.jabatan}
                                        </p>
                                        {coordinator.nim && (
                                            <p className="text-white/60 text-[10px] mt-1">{coordinator.nim} • {coordinator.prodi}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-white/60 text-sm">Belum ada koordinator ditunjuk.</p>
                            )}
                        </div>

                        {/* Staff Anggota */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-black text-[#1e293b] mb-4 flex items-center gap-2 text-sm">
                                <Users size={16} className="text-[#0ea5e9]" />
                                Staff & Anggota
                                <span className="ml-auto text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{staffMembers.length}</span>
                            </h2>
                            {staffMembers.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-6">Belum ada anggota.</p>
                            ) : (
                                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                    {staffMembers.map((staff: any) => (
                                        <div
                                            key={staff.id}
                                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                        >
                                            {staff.photo_url ? (
                                                <img src={staff.photo_url} alt={staff.full_name} className="w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                    <User size={16} className="text-slate-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold text-[#1e293b] text-sm truncate">{staff.full_name}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{staff.jabatan || "Staff"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
