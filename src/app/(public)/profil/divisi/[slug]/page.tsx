import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Target, Calendar, Award, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const { data } = await supabase.from("divisions").select("name, description").eq("name", decodeURIComponent(slug)).single();
    if (!data) return { title: "Divisi Tidak Ditemukan" };
    return { title: `Divisi ${data.name} | SKI`, description: data.description };
}

export default async function DivisiDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Cari divisi berdasarkan name atau slug
    const { data: division } = await supabase.from("divisions").select("*").or(`name.ilike.%${decodedSlug}%`).single();

    if (!division) notFound();

    // Ambil pengurus yang ada di divisi ini
    const { data: pengurusList } = await supabase
        .from("pengurus")
        .select("*")
        .eq("division_id", division.id)
        .eq("status", "active")
        .order("role_level");

    // Ambil program kerja dari tabel program_kerja
    const { data: programKerjaData, error: progError } = await supabase
        .from("program_kerja")
        .select("*")
        .eq("division_id", division.id)
        .order("created_at", { ascending: false });

    if (progError) {
        console.error('Error fetching program kerja:', progError);
    }

    const programKerja = programKerjaData || [];

    // Debug info (remove after testing)
    const showDebug = process.env.NODE_ENV === 'development';

    return (
        <div className="bg-[#f8fafc] min-h-screen py-10 sm:py-16">
            <div className="container mx-auto px-4 md:px-8 lg:px-12">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link href="/profil" className="flex items-center gap-1.5 text-gray-600 hover:text-[#0ea5e9] font-semibold transition-colors w-fit">
                        <ArrowLeft size={16} /> Kembali ke Profil
                    </Link>
                </div>

                {/* Header */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl flex-shrink-0">
                            {division.icon || <Users size={28} />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#1e293b] mb-2">{division.name}</h1>
                            <p className="text-gray-500">{division.description || "Divisi SKI Universitas Telkom Purwokerto"}</p>
                        </div>
                    </div>
                </div>

                {/* Debug Info */}
                {showDebug && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
                        <p className="text-sm font-mono">
                            Division ID: {division.id}<br />
                            Program Kerja Count: {programKerja.length}
                        </p>
                    </div>
                )}

                {/* Program Kerja */}
                {programKerja.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
                        <h2 className="text-xl font-bold text-[#1e293b] mb-6 flex items-center gap-2">
                            <Target size={20} className="text-[#0ea5e9]" /> Program Kerja
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {programKerja.map((prog: any, idx: number) => (
                                <div key={prog.id || idx} className="flex gap-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
                                    {prog.photo_url ? (
                                        <img src={prog.photo_url} alt={prog.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                                    ) : (
                                        <div className="w-24 h-24 bg-sky-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <ImageIcon size={32} className="text-sky-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 mb-1">{prog.name}</h3>
                                        {prog.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">{prog.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pengurus Divisi */}
                {pengurusList && pengurusList.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-[#1e293b] mb-6 flex items-center gap-2">
                            <Users size={20} className="text-[#0ea5e9]" /> Pengurus Divisi
                        </h2>

                        {/* Koordinator */}
                        {(() => {
                            const koordinator = pengurusList.filter(p =>
                                p.role_level === 'div_ketua' || p.role_level === 'lso_ketua'
                            );
                            if (koordinator.length > 0) {
                                return (
                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Koordinator</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {koordinator.map((p) => (
                                                <div key={p.id} className="flex flex-col items-center text-center bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-4 border border-sky-200">
                                                    {p.photo_url ? (
                                                        <img src={p.photo_url} alt={p.full_name} className="w-20 h-20 rounded-full object-cover border-2 border-sky-300 mb-3" />
                                                    ) : (
                                                        <div className="w-20 h-20 rounded-full bg-sky-200 flex items-center justify-center mb-3">
                                                            <Users size={28} className="text-sky-500" />
                                                        </div>
                                                    )}
                                                    <h4 className="font-bold text-sm text-[#1e293b] leading-tight mb-1">{p.full_name}</h4>
                                                    <span className="text-[10px] font-semibold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-lg">{p.jabatan || "Koordinator"}</span>
                                                    {p.nim && <p className="text-[9px] text-gray-400 mt-1">{p.nim} • {p.prodi}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Staff */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Anggota / Staff</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {pengurusList.filter(p => p.role_level === 'staff').map((p) => (
                                    <div key={p.id} className="flex flex-col items-center text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        {p.photo_url ? (
                                            <img src={p.photo_url} alt={p.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-sky-100 mb-3" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-3">
                                                <Users size={24} className="text-sky-400" />
                                            </div>
                                        )}
                                        <h4 className="font-bold text-sm text-[#1e293b] leading-tight mb-1">{p.full_name}</h4>
                                        <span className="text-[10px] font-semibold text-[#0ea5e9] bg-sky-50 px-2 py-0.5 rounded-lg">{p.jabatan || "Staff"}</span>
                                        {p.nim && <p className="text-[9px] text-gray-400 mt-1">{p.nim} • {p.prodi}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(!pengurusList || pengurusList.length === 0) && (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                        <Users size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Belum ada data pengurus untuk divisi ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
