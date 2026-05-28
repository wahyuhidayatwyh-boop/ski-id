"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { 
    ChevronLeft, Loader2, Download, Printer, CheckCircle, AlertCircle, XCircle 
} from "lucide-react";
import Link from "next/link";

interface Acara { id: string; title: string; start_time: string; location: string; status: string; kabinet_id: string; }

export default function AbsensiManualPage() {
    const role = "admin1";
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const acaraId = params?.id;
    
    const [loading, setLoading] = useState(true);
    const [acara, setAcara] = useState<Acara | null>(null);
    const [absensiData, setAbsensiData] = useState<any[]>([]); // { pengurus_id, full_name, status, absensi_id, jabatan }
    
    useEffect(() => {
        if (acaraId) {
            fetchData();
        }
    }, [acaraId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Acara details
            const { data: acaraData, error: acaraError } = await supabase.from("acara_internal").select("*").eq("id", acaraId).single();
            if (acaraError || !acaraData) throw new Error("Acara tidak ditemukan");
            setAcara(acaraData);
            
            // Fetch all pengurus in this kabinet
            const { data: pengurus } = await supabase.from("pengurus").select("id, full_name, jabatan").eq("kabinet_id", acaraData.kabinet_id);
            // Fetch existing absensi for this acara
            const { data: absensi } = await supabase.from("absensi_digital").select("*").eq("acara_id", acaraId);
            
            if (pengurus) {
                const absMap: Record<string, any> = {};
                absensi?.forEach(a => absMap[a.pengurus_id] = a);
                
                const combined = pengurus.map(p => ({
                    pengurus_id: p.id,
                    full_name: p.full_name,
                    jabatan: p.jabatan,
                    status: absMap[p.id]?.status || null,
                    absensi_id: absMap[p.id]?.id || null
                }));
                // Sort by name
                combined.sort((a, b) => a.full_name.localeCompare(b.full_name));
                setAbsensiData(combined);
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAbsensiStatus = async (pengurus_id: string, newStatus: string) => {
        const existing = absensiData.find(a => a.pengurus_id === pengurus_id);
        
        try {
            if (existing?.absensi_id) {
                // Update existing
                const { error } = await supabase.from("absensi_digital").update({ status: newStatus }).eq("id", existing.absensi_id);
                if (error) throw error;
            } else {
                // Insert new
                const { data, error } = await supabase.from("absensi_digital").insert([{
                    acara_id: acaraId,
                    pengurus_id,
                    status: newStatus
                }]).select().single();
                
                if (error) throw error;
                
                if (data) {
                    setAbsensiData(prev => prev.map(a => a.pengurus_id === pengurus_id ? { ...a, absensi_id: data.id } : a));
                }
            }
            
            // Update local state for immediate UI feedback
            setAbsensiData(prev => prev.map(a => a.pengurus_id === pengurus_id ? { ...a, status: newStatus } : a));
        } catch (error: any) {
            console.error("Gagal mengupdate absensi:", error);
            alert(`Gagal menyimpan absensi: ${error.message}`);
        }
    };

    const handleDownloadCSV = () => {
        if (!acara) return;
        const headers = ["Nama Pengurus", "Jabatan", "Status Kehadiran"];
        const rows = absensiData.map(a => [
            `"${a.full_name}"`, 
            `"${a.jabatan || '-'}"`, 
            a.status ? a.status.toUpperCase() : "BELUM ABSEN"
        ]);
        
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Absensi_${acara.title.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <div className="print:hidden">
                <AdminSidebar role={role} />
            </div>
            <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 print:m-0 print:p-4 print:pt-4 w-full">
                {loading ? (
                    <div className="flex items-center justify-center h-64 print:hidden">
                        <Loader2 className="animate-spin text-sky-500" size={40} />
                    </div>
                ) : acara ? (
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-6 flex justify-between items-end print:hidden">
                            <div>
                                <Link href="/admin/admin1/dakwah-os" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 font-medium transition-colors">
                                    <ChevronLeft size={16} /> Kembali ke Dakwah-OS
                                </Link>
                                <h1 className="text-2xl font-black text-gray-900">Rekap Absensi: {acara.title}</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    {new Date(acara.start_time).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} di {acara.location || '-'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleDownloadCSV} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all">
                                    <Download size={16} /> Download CSV
                                </button>
                                <button onClick={handlePrint} className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all">
                                    <Printer size={16} /> Cetak Laporan
                                </button>
                            </div>
                        </div>

                        {/* Print Header - Kop Surat Resmi */}
                        <div className="hidden print:block mb-6">
                            {/* Kop Surat */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid black', paddingBottom: '12px', marginBottom: '16px' }}>
                                {/* Logo Telkom (kiri) */}
                                <img src="/LogoTup.png" alt="Logo Telkom University Purwokerto" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
                                
                                {/* Teks Tengah */}
                                <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 2px 0', letterSpacing: '1px' }}>Unit Kegiatan Mahasiswa</p>
                                    <p style={{ fontFamily: 'serif', fontSize: '28px', fontWeight: 'bold', fontStyle: 'italic', margin: '0 0 2px 0', lineHeight: 1.1 }}>Sentral Kerohanian Islam</p>
                                    <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '1px' }}>Telkom University Purwokerto</p>
                                    <p style={{ fontSize: '10px', margin: '0', color: '#333' }}>Jl. DI. Panjaitan No.128 Purwokerto 53147</p>
                                    <p style={{ fontSize: '10px', margin: '0', color: '#333' }}>Telp. 082383600586 | Email : ski@ittelkom-pwt.ac.id</p>
                                </div>
                                
                                {/* Logo SKI (kanan) */}
                                <img src="/Logo SKI TEL-U P.png" alt="Logo SKI TEL-U Purwokerto" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
                            </div>

                            {/* Judul Dokumen */}
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Daftar Hadir Pengurus</p>
                                <p style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 4px 0' }}>UKM Sentral Kerohanian Islam Periode 2025/2026</p>
                                <p style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0' }}>Telkom University Purwokerto</p>
                            </div>

                            {/* Info Kegiatan */}
                            <div style={{ fontSize: '12px', marginBottom: '16px', paddingLeft: '8px' }}>
                                <table style={{ borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '2px 0', width: '80px' }}>Kegiatan</td>
                                            <td style={{ padding: '2px 4px' }}>:</td>
                                            <td style={{ padding: '2px 0', fontWeight: 'bold' }}>{acara.title}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '2px 0' }}>Tanggal</td>
                                            <td style={{ padding: '2px 4px' }}>:</td>
                                            <td style={{ padding: '2px 0', fontWeight: 'bold' }}>{new Date(acara.start_time).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '2px 0' }}>Tempat</td>
                                            <td style={{ padding: '2px 4px' }}>:</td>
                                            <td style={{ padding: '2px 0', fontWeight: 'bold' }}>{acara.location || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse print:text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 print:bg-transparent border-b border-gray-200 print:border-black">
                                            <th className="p-4 print:p-2 text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black">No</th>
                                            <th className="p-4 print:p-2 text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black">Nama Pengurus</th>
                                            <th className="p-4 print:p-2 text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black">Jabatan</th>
                                            <th className="p-4 print:p-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-center print:text-black">Status Kehadiran</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right print:hidden">Ubah Status (Manual)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                                        {absensiData.map((a, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 print:p-2 font-medium text-gray-500 text-sm">{i + 1}</td>
                                                <td className="p-4 print:p-2 font-bold text-gray-900 text-sm print:text-black">{a.full_name}</td>
                                                <td className="p-4 print:p-2 text-gray-600 text-sm print:text-black">{a.jabatan || '-'}</td>
                                                <td className="p-4 print:p-2 text-center">
                                                    {a.status ? (
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase print:border print:bg-transparent print:text-black ${
                                                            a.status === 'hadir' ? 'bg-green-100 text-green-700' : 
                                                            a.status === 'izin' ? 'bg-amber-100 text-amber-700' : 
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {a.status === 'hadir' && <CheckCircle size={12} className="print:hidden" />}
                                                            {a.status === 'izin' && <AlertCircle size={12} className="print:hidden" />}
                                                            {a.status !== 'hadir' && a.status !== 'izin' && <XCircle size={12} className="print:hidden" />}
                                                            {a.status}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-slate-100 text-slate-500 print:bg-transparent print:border print:text-black">
                                                            Belum Absen
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right print:hidden">
                                                    <select 
                                                        className="text-sm font-medium border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[120px]"
                                                        value={a.status || ""}
                                                        onChange={(e) => handleUpdateAbsensiStatus(a.pengurus_id, e.target.value)}
                                                    >
                                                        <option value="" disabled>-- Pilih Status --</option>
                                                        <option value="hadir">Hadir</option>
                                                        <option value="izin">Izin</option>
                                                        <option value="sakit">Sakit</option>
                                                        <option value="alpa">Alpa</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">Data acara tidak ditemukan.</div>
                )}
            </main>
        </div>
    );
}
