"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign, Upload, Download, Plus, Check, X, Search, FileText, Image as ImageIcon, ExternalLink,
    ChevronLeft, ChevronRight, Eye, Users, Wallet, Receipt, Filter, Calendar, Heart
} from "lucide-react";
import NextImage from "next/image";

interface Transaction {
    id: string;
    type: string;
    kategori: string;
    amount: number;
    description: string;
    bukti_url: string | null;
    tanggal: string;
    created_at: string;
    donasi_transaksi_id?: string;
    donasi_transaksi?: {
        nama_donatur: string;
        email_donatur: string;
        no_hp_donatur: string;
        jenis_donasi: string;
        pesan: string;
        metode_pembayaran: string;
        is_anonymous: boolean;
        status: string;
        bukti_transfer_url: string;
    };
}

interface DonasiTransaksi {
    id: string;
    nama_donatur: string;
    email_donatur: string;
    no_hp_donatur: string;
    jenis_donasi: string;
    nominal: number;
    pesan: string;
    metode_pembayaran: string;
    bukti_transfer_url: string;
    is_anonymous: boolean;
    status: string;
    created_at: string;
    catatan_admin: string;
}

interface PembayaranKas {
    id: string;
    pengurus_id: string;
    amount: number;
    bulan: number;
    tahun: number;
    bukti_url: string;
    status: string;
    created_at: string;
    catatan: string;
    pengurus?: {
        full_name: string;
        division_id: string;
        divisions?: {
            name: string;
        };
    };
}

const ITEMS_PER_PAGE = 10;

export default function KeuanganDashboard() {
    const role = "admin2"; // Bendahara
    const [activeTab, setActiveTab] = useState<"transaksi" | "donasi" | "kas">("transaksi");

    // Transaction state
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [transactionPage, setTransactionPage] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);

    // Donasi state
    const [donations, setDonations] = useState<DonasiTransaksi[]>([]);
    const [loadingDonations, setLoadingDonations] = useState(false);
    const [donasiPage, setDonasiPage] = useState(1);
    const [totalDonations, setTotalDonations] = useState(0);
    const [selectedDonation, setSelectedDonation] = useState<DonasiTransaksi | null>(null);

    // Kas state
    const [kasPayments, setKasPayments] = useState<PembayaranKas[]>([]);
    const [loadingKas, setLoadingKas] = useState(false);
    const [kasPage, setKasPage] = useState(1);
    const [totalKas, setTotalKas] = useState(0);
    const [selectedKas, setSelectedKas] = useState<PembayaranKas | null>(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'IN',
        kategori: 'Donasi',
        amount: '',
        description: '',
        bukti_url: '' as string | null
    });
    const [isUploading, setIsUploading] = useState(false);

    // Search states
    const [searchTerm, setSearchTerm] = useState("");

    // Filter dates for kas
    const [kasFilterBulan, setKasFilterBulan] = useState("");
    const [kasFilterTahun, setKasFilterTahun] = useState("");

    useEffect(() => {
        if (activeTab === "transaksi") {
            fetchTransactions();
        } else if (activeTab === "donasi") {
            fetchDonations();
        } else {
            fetchKasPayments();
        }
    }, [activeTab, transactionPage, donasiPage, kasPage, filter, kasFilterBulan, kasFilterTahun]);

    const fetchTransactions = async () => {
        setLoading(true);

        let query = supabase
            .from('keuangan_transaksi')
            .select(`
                *,
                donasi_transaksi (
                    nama_donatur,
                    email_donatur,
                    no_hp_donatur,
                    jenis_donasi,
                    pesan,
                    metode_pembayaran,
                    is_anonymous,
                    status,
                    bukti_transfer_url
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: false });

        // Apply filter
        if (filter === 'donasi') {
            query = query.eq('kategori', 'Donasi');
        } else if (filter === 'infaq') {
            query = query.eq('kategori', 'Infaq');
        } else if (filter === 'lainnya') {
            query = query.neq('kategori', 'Donasi').neq('kategori', 'Infaq');
        }

        // Apply pagination
        const from = (transactionPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching transactions:', error);
        } else if (data) {
            setTransactions(data);
            setTotalTransactions(count || 0);
        }
        setLoading(false);
    };

    const fetchDonations = async () => {
        setLoadingDonations(true);

        let query = supabase
            .from('donasi_transaksi')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        // Apply pagination
        const from = (donasiPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching donations:', error);
        } else if (data) {
            setDonations(data);
            setTotalDonations(count || 0);
        }
        setLoadingDonations(false);
    };

    const fetchKasPayments = async () => {
        setLoadingKas(true);

        let query = supabase
            .from('pembayaran_kas')
            .select(`
                *,
                pengurus (
                    full_name,
                    division_id,
                    divisions (
                        name
                    )
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: false });

        // Apply filters
        if (kasFilterBulan) {
            query = query.eq('bulan', parseInt(kasFilterBulan));
        }
        if (kasFilterTahun) {
            query = query.eq('tahun', parseInt(kasFilterTahun));
        }

        // Apply pagination
        const from = (kasPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching kas payments:', error);
        } else if (data) {
            setKasPayments(data);
            setTotalKas(count || 0);
        }
        setLoadingKas(false);
    };

    const uploadFileToSupabase = async (file: File) => {
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `keuangan/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('kas-bukti').upload(filePath, file);
        setIsUploading(false);

        if (uploadError) {
            alert('Upload gagal: ' + uploadError.message);
            return null;
        }

        const { data } = supabase.storage.from('kas-bukti').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await supabase.from('keuangan_transaksi').insert([{
            type: formData.type as 'IN' | 'OUT',
            kategori: formData.kategori,
            amount: parseFloat(formData.amount),
            description: formData.description,
            bukti_url: formData.bukti_url,
            tanggal: new Date().toISOString().split('T')[0],
        }]);

        if (error) {
            alert("Gagal menyimpan transaksi: " + error.message);
        } else {
            setShowForm(false);
            setFormData({ type: 'IN', kategori: 'Donasi', amount: '', description: '', bukti_url: null });
            fetchTransactions();
        }
    };

    const handleExportCSV = () => {
        if (activeTab === "transaksi" && transactions.length === 0) return;
        if (activeTab === "donasi" && donations.length === 0) return;
        if (activeTab === "kas" && kasPayments.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";

        if (activeTab === "transaksi") {
            csvContent += "Tanggal,Tipe,Kategori,Jumlah,Deskripsi,Bukti URL,Nama Donatur,Jenis Donasi,Status\n";
            transactions.forEach(t => {
                const row = `"${t.tanggal}","${t.type === 'IN' ? 'Pemasukan' : 'Pengeluaran'}","${t.kategori}","${t.amount}","${t.description || ''}","${t.bukti_url || ''}","${t.donasi_transaksi?.nama_donatur || '-'}","${t.donasi_transaksi?.jenis_donasi || '-'}","${t.donasi_transaksi?.status || '-'}"`;
                csvContent += row + "\n";
            });
        } else if (activeTab === "donasi") {
            csvContent += "Tanggal,Nama Donatur,Email,No HP,Jenis Donasi,Nominal,Pesan,Metode Pembayaran,Bukti Transfer,Status,Anonim\n";
            donations.forEach(d => {
                const row = `"${new Date(d.created_at).toLocaleDateString('id-ID')}","${d.nama_donatur}","${d.email_donatur || ''}","${d.no_hp_donatur || ''}","${d.jenis_donasi}","${d.nominal}","${d.pesan || ''}","${d.metode_pembayaran}","${d.bukti_transfer_url || ''}","${d.status}","${d.is_anonymous}"`;
                csvContent += row + "\n";
            });
        } else {
            csvContent += "Tanggal,Nama Pengurus,Divisi,Jumlah,Bulan,Tahun,Bukti URL,Status,Catatan\n";
            kasPayments.forEach(k => {
                const row = `"${new Date(k.created_at).toLocaleDateString('id-ID')}","${k.pengurus?.full_name || '-'}","${k.pengurus?.divisions?.name || '-'}","${k.amount}","${k.bulan}","${k.tahun}","${k.bukti_url}","${k.status}","${k.catatan || ''}"`;
                csvContent += row + "\n";
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Laporan_${activeTab === 'transaksi' ? 'Transaksi' : activeTab === 'donasi' ? 'Donasi' : 'Kas'}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate totals
    const totalPemasukan = transactions
        .filter(t => t.type === 'IN')
        .reduce((acc, curr) => acc + curr.amount, 0);
    const totalPengeluaran = transactions
        .filter(t => t.type === 'OUT')
        .reduce((acc, curr) => acc + curr.amount, 0);
    const saldo = totalPemasukan - totalPengeluaran;

    const totalDonasi = transactions
        .filter(t => t.kategori === 'Donasi' || t.kategori === 'Infaq')
        .filter(t => t.type === 'IN')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalPagesTransactions = Math.ceil(totalTransactions / ITEMS_PER_PAGE);
    const totalPagesDonations = Math.ceil(totalDonations / ITEMS_PER_PAGE);
    const totalPagesKas = Math.ceil(totalKas / ITEMS_PER_PAGE);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">Menunggu</span>;
            case 'verified':
                return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">Terverifikasi</span>;
            case 'rejected':
                return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Ditolak</span>;
            default:
                return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    const getMonthName = (month: number) => {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return months[month - 1] || '';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar role={role} />
            <main className="flex-1 lg:ml-64 p-6 pt-20 lg:pt-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <DollarSign className="text-sky-500" />
                                Financial Dashboard
                            </h1>
                            <p className="text-slate-500 font-medium">Sistem Keuangan Transparan & E-Kuitansi Dakwah-OS</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition-colors">
                                <Download size={18} /> Export CSV
                            </button>
                            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-md shadow-sky-500/20">
                                {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'Batal' : 'Tambah Transaksi'}
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-50 rounded-full opacity-50" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Total Saldo</p>
                            <h3 className="text-3xl font-black text-slate-900 relative z-10">Rp {saldo.toLocaleString("id-ID")}</h3>
                        </div>
                        <div className="bg-green-500 p-6 rounded-3xl text-white shadow-lg shadow-green-500/20 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                            <p className="text-sm font-bold text-green-100 uppercase tracking-wider mb-2 relative z-10">Total Pemasukan</p>
                            <h3 className="text-3xl font-black relative z-10">Rp {totalPemasukan.toLocaleString("id-ID")}</h3>
                        </div>
                        <div className="bg-red-500 p-6 rounded-3xl text-white shadow-lg shadow-red-500/20 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                            <p className="text-sm font-bold text-red-100 uppercase tracking-wider mb-2 relative z-10">Total Pengeluaran</p>
                            <h3 className="text-3xl font-black relative z-10">Rp {totalPengeluaran.toLocaleString("id-ID")}</h3>
                        </div>
                        <div className="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                            <p className="text-sm font-bold text-emerald-100 uppercase tracking-wider mb-2 relative z-10">Total Donasi/Infaq</p>
                            <h3 className="text-3xl font-black relative z-10">Rp {totalDonasi.toLocaleString("id-ID")}</h3>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveTab("transaksi")}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'transaksi'
                                    ? 'bg-sky-500 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                <Receipt size={16} />
                                Transaksi Keuangan
                            </button>
                            <button
                                onClick={() => setActiveTab("donasi")}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'donasi'
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                <Heart size={16} />
                                Bukti Donasi Umum
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{totalDonations}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("kas")}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'kas'
                                    ? 'bg-indigo-500 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                <Wallet size={16} />
                                Uang Kas Pengurus
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{totalKas}</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs for Transaksi */}
                    {activeTab === "transaksi" && (
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${filter === 'all' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    Semua Transaksi
                                </button>
                                <button
                                    onClick={() => setFilter('donasi')}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${filter === 'donasi' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    Donasi
                                </button>
                                <button
                                    onClick={() => setFilter('infaq')}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${filter === 'infaq' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    Infaq
                                </button>
                                <button
                                    onClick={() => setFilter('lainnya')}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${filter === 'lainnya' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    Lainnya
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filter for Kas */}
                    {activeTab === "kas" && (
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Bulan</label>
                                    <select
                                        value={kasFilterBulan}
                                        onChange={(e) => setKasFilterBulan(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium text-sm"
                                    >
                                        <option value="">Semua Bulan</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>{getMonthName(m)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tahun</label>
                                    <select
                                        value={kasFilterTahun}
                                        onChange={(e) => setKasFilterTahun(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium text-sm"
                                    >
                                        <option value="">Semua Tahun</option>
                                        <option value="2025">2025</option>
                                        <option value="2024">2024</option>
                                        <option value="2023">2023</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => { setKasFilterBulan(""); setKasFilterTahun(""); }}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Form Input */}
                    {showForm && activeTab === "transaksi" && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-md border border-sky-200">
                            <h3 className="font-black text-lg text-slate-900 mb-4">Input Transaksi Baru</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tipe Transaksi</label>
                                        <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-sm" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="IN">Pemasukan (+)</option>
                                            <option value="OUT">Pengeluaran (-)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                                        <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-sm" value={formData.kategori} onChange={e => setFormData({ ...formData, kategori: e.target.value })}>
                                            <option value="Donasi">Donasi</option>
                                            <option value="Infaq">Infaq</option>
                                            <option value="Kas Anggota">Kas Anggota</option>
                                            <option value="Dana Usaha">Dana Usaha</option>
                                            <option value="Operasional">Operasional</option>
                                            <option value="Proker Divisi">Proker Divisi</option>
                                            <option value="Lain-lain">Lain-lain</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                                        <input required type="number" placeholder="100000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-sm" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Singkat</label>
                                    <input required type="text" placeholder="Pembayaran DP Ruangan untuk Kajian Akbar" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-sm" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Upload Bukti (E-Kuitansi / Transfer)</label>
                                    <div className="flex gap-2">
                                        <input type="file" accept="image/*,.pdf" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-sm" onChange={async (e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                const url = await uploadFileToSupabase(e.target.files[0]);
                                                if (url) setFormData({ ...formData, bukti_url: url });
                                            }
                                        }} />
                                        {formData.bukti_url && <a href={formData.bukti_url} target="_blank" className="flex items-center justify-center bg-green-100 text-green-700 px-4 rounded-xl text-sm font-bold"><Check size={16} /> Terupload</a>}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button disabled={isUploading} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl transition-colors disabled:bg-slate-400">
                                        {isUploading ? 'Menunggu Upload...' : 'Simpan Transaksi'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* TRANSAKSI TAB */}
                    {activeTab === "transaksi" && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-black text-slate-900 text-lg">Riwayat Transaksi</h3>
                                <span className="text-sm text-slate-500 font-medium">{totalTransactions} transaksi</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white border-b border-slate-100">
                                        <tr>
                                            <th className="py-4 px-6 font-bold text-slate-500">Tanggal</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Deskripsi</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Kategori</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Nominal</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Bukti</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Info Donatur</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr><td colSpan={6} className="text-center py-8 text-slate-400 font-bold">Memuat data...</td></tr>
                                        ) : transactions.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center py-8 text-slate-400 font-bold">Belum ada transaksi tercatat.</td></tr>
                                        ) : (
                                            transactions.map(t => (
                                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 px-6 text-slate-500 font-medium">
                                                        {new Date(t.tanggal).toLocaleDateString("id-ID")}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <p className="font-bold text-slate-900">{t.description}</p>
                                                        {t.donasi_transaksi?.pesan && (
                                                            <p className="text-xs text-slate-400 mt-1 italic">"{t.donasi_transaksi.pesan}"</p>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${t.kategori === 'Donasi' || t.kategori === 'Infaq'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {t.kategori}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`font-black ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {t.type === 'IN' ? '+' : '-'} Rp {t.amount.toLocaleString("id-ID")}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {t.bukti_url ? (
                                                            <a
                                                                href={t.bukti_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold text-xs bg-sky-50 px-3 py-1.5 rounded-lg w-max"
                                                            >
                                                                <ImageIcon size={14} /> Lihat Bukti
                                                            </a>
                                                        ) : t.donasi_transaksi?.bukti_transfer_url ? (
                                                            <a
                                                                href={t.donasi_transaksi.bukti_transfer_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg w-max"
                                                            >
                                                                <ImageIcon size={14} /> Bukti Donasi
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-medium">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {t.donasi_transaksi ? (
                                                            <div className="space-y-1">
                                                                <p className="font-bold text-slate-900 text-xs">
                                                                    {t.donasi_transaksi.is_anonymous ? 'Hamba Allah' : t.donasi_transaksi.nama_donatur}
                                                                </p>
                                                                <p className="text-[10px] text-slate-500">
                                                                    {t.donasi_transaksi.jenis_donasi}
                                                                </p>
                                                                <p className="text-[10px] text-slate-500">
                                                                    Via: {t.donasi_transaksi.metode_pembayaran === 'transfer_bank' ? 'Transfer Bank' : 'E-Wallet'}
                                                                </p>
                                                                {getStatusBadge(t.donasi_transaksi.status)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-medium">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {totalPagesTransactions > 1 && (
                                <div className="p-4 border-t border-slate-100 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => setTransactionPage(p => Math.max(1, p - 1))}
                                        disabled={transactionPage === 1}
                                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-sm font-medium text-slate-600 px-4">
                                        Halaman {transactionPage} dari {totalPagesTransactions}
                                    </span>
                                    <button
                                        onClick={() => setTransactionPage(p => Math.min(totalPagesTransactions, p + 1))}
                                        disabled={transactionPage === totalPagesTransactions}
                                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* DONASI TAB - Bukti Donasi dari Umum */}
                    {activeTab === "donasi" && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                                        <Heart className="text-emerald-500" size={20} />
                                        Bukti Donasi dari Umum
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Semua bukti transfer donasi yang diupload oleh donatur melalui halaman /donasi</p>
                                </div>
                                <span className="text-sm text-emerald-700 font-bold bg-emerald-100 px-4 py-2 rounded-xl">{totalDonations} donasi</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white border-b border-slate-100">
                                        <tr>
                                            <th className="py-4 px-6 font-bold text-slate-500">Tanggal</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Donatur</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Jenis</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Nominal</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Metode</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Bukti Transfer</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Status</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loadingDonations ? (
                                            <tr><td colSpan={8} className="text-center py-8 text-slate-400 font-bold">Memuat data...</td></tr>
                                        ) : donations.length === 0 ? (
                                            <tr><td colSpan={8} className="text-center py-8 text-slate-400 font-bold">Belum ada donasi tercatat.</td></tr>
                                        ) : (
                                            donations.map(d => (
                                                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 px-6 text-slate-500 font-medium">
                                                        {new Date(d.created_at).toLocaleDateString("id-ID")}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <p className="font-bold text-slate-900 text-xs">
                                                            {d.is_anonymous ? 'Hamba Allah' : d.nama_donatur}
                                                        </p>
                                                        {d.email_donatur && (
                                                            <p className="text-[10px] text-slate-400">{d.email_donatur}</p>
                                                        )}
                                                        {d.no_hp_donatur && (
                                                            <p className="text-[10px] text-slate-400">{d.no_hp_donatur}</p>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                                            {d.jenis_donasi}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="font-black text-green-600">
                                                            Rp {d.nominal.toLocaleString("id-ID")}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-xs text-slate-500">
                                                            {d.metode_pembayaran === 'transfer_bank' ? 'Transfer Bank' : 'E-Wallet'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {d.bukti_transfer_url ? (
                                                            <a
                                                                href={d.bukti_transfer_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg w-max"
                                                            >
                                                                <ImageIcon size={14} /> Lihat Bukti
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-medium">Tidak ada bukti</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {getStatusBadge(d.status)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            onClick={() => setSelectedDonation(d)}
                                                            className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold text-xs bg-sky-50 px-3 py-1.5 rounded-lg w-max"
                                                        >
                                                            <Eye size={14} /> Detail
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {totalPagesDonations > 1 && (
                                <div className="p-4 border-t border-slate-100 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => setDonasiPage(p => Math.max(1, p - 1))}
                                        disabled={donasiPage === 1}
                                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-sm font-medium text-slate-600 px-4">
                                        Halaman {donasiPage} dari {totalPagesDonations}
                                    </span>
                                    <button
                                        onClick={() => setDonasiPage(p => Math.min(totalPagesDonations, p + 1))}
                                        disabled={donasiPage === totalPagesDonations}
                                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* KAS TAB - Uang Kas Pengurus */}
                    {activeTab === "kas" && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                                        <Wallet className="text-indigo-500" size={20} />
                                        Laporan Uang Kas Pengurus
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Riwayat pembayaran kas dari semua pengurus</p>
                                </div>
                                <span className="text-sm text-indigo-700 font-bold bg-indigo-100 px-4 py-2 rounded-xl">{totalKas} pembayaran</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white border-b border-slate-100">
                                        <tr>
                                            <th className="py-4 px-6 font-bold text-slate-500">Tanggal</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Pengurus</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Divisi</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Kas Untuk</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Nominal</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Bukti</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Status</th>
                                            <th className="py-4 px-6 font-bold text-slate-500">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loadingKas ? (
                                            <tr><td colSpan={8} className="text-center py-8 text-slate-400 font-bold">Memuat data...</td></tr>
                                        ) : kasPayments.length === 0 ? (
                                            <tr><td colSpan={8} className="text-center py-8 text-slate-400 font-bold">Belum ada pembayaran kas.</td></tr>
                                        ) : (
                                            kasPayments.map(k => (
                                                <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 px-6 text-slate-500 font-medium">
                                                        {new Date(k.created_at).toLocaleDateString("id-ID")}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <p className="font-bold text-slate-900 text-xs">
                                                            {k.pengurus?.full_name || '-'}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-xs text-slate-500">
                                                            {k.pengurus?.divisions?.name || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-xs font-medium text-slate-700">
                                                            {getMonthName(k.bulan)} {k.tahun}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="font-black text-green-600">
                                                            Rp {k.amount.toLocaleString("id-ID")}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {k.bukti_url ? (
                                                            <a
                                                                href={k.bukti_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg w-max"
                                                            >
                                                                <ImageIcon size={14} /> Lihat Bukti
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-medium">Tidak ada bukti</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {getStatusBadge(k.status)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            onClick={() => setSelectedKas(k)}
                                                            className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold text-xs bg-sky-50 px-3 py-1.5 rounded-lg w-max"
                                                        >
                                                            <Eye size={14} /> Detail
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {totalPagesKas > 1 && (
                                <div className="p-4 border-t border-slate-100 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => setKasPage(p => Math.max(1, p - 1))}
                                        disabled={kasPage === 1}
                                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-sm font-medium text-slate-600 px-4">
                                        Halaman {kasPage} dari {totalPagesKas}
                                    </span>
                                    <button
                                        onClick={() => setKasPage(p => Math.min(totalPagesKas, p + 1))}
                                        disabled={kasPage === totalPagesKas}
                                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Detail Donasi */}
            <AnimatePresence>
                {selectedDonation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedDonation(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                                    <Heart className="text-emerald-500" size={24} />
                                    Detail Donasi
                                </h3>
                                <button
                                    onClick={() => setSelectedDonation(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Nama Donatur</p>
                                        <p className="font-bold text-slate-900 mt-1">
                                            {selectedDonation.is_anonymous ? 'Hamba Allah (Anonim)' : selectedDonation.nama_donatur}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Jenis Donasi</p>
                                        <p className="font-bold text-slate-900 mt-1">{selectedDonation.jenis_donasi}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Nominal</p>
                                        <p className="font-black text-green-600 mt-1 text-xl">Rp {selectedDonation.nominal.toLocaleString("id-ID")}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Metode Pembayaran</p>
                                        <p className="font-bold text-slate-900 mt-1">
                                            {selectedDonation.metode_pembayaran === 'transfer_bank' ? 'Transfer Bank' : 'E-Wallet'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Tanggal</p>
                                        <p className="font-bold text-slate-900 mt-1">
                                            {new Date(selectedDonation.created_at).toLocaleDateString("id-ID", {
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Status</p>
                                        <div className="mt-1">{getStatusBadge(selectedDonation.status)}</div>
                                    </div>
                                </div>

                                {selectedDonation.email_donatur && (
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Email</p>
                                        <p className="font-medium text-slate-900 mt-1">{selectedDonation.email_donatur}</p>
                                    </div>
                                )}

                                {selectedDonation.no_hp_donatur && (
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">No. WhatsApp</p>
                                        <p className="font-medium text-slate-900 mt-1">{selectedDonation.no_hp_donatur}</p>
                                    </div>
                                )}

                                {selectedDonation.pesan && (
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                        <p className="text-xs text-emerald-600 font-bold uppercase">Pesan / Doa</p>
                                        <p className="font-medium text-emerald-800 mt-1 italic">"{selectedDonation.pesan}"</p>
                                    </div>
                                )}

                                {selectedDonation.bukti_transfer_url && (
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase mb-3">Bukti Transfer</p>
                                        <a
                                            href={selectedDonation.bukti_transfer_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block relative rounded-xl overflow-hidden border-2 border-slate-200 hover:border-emerald-500 transition-colors"
                                        >
                                            <NextImage src={selectedDonation.bukti_transfer_url} alt="Bukti transfer" width={600} height={400} className="w-full h-auto" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                                                <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                                                    <ExternalLink size={16} /> Buka Gambar
                                                </span>
                                            </div>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Detail Kas */}
            <AnimatePresence>
                {selectedKas && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedKas(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                                    <Wallet className="text-indigo-500" size={24} />
                                    Detail Pembayaran Kas
                                </h3>
                                <button
                                    onClick={() => setSelectedKas(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Nama Pengurus</p>
                                        <p className="font-bold text-slate-900 mt-1">{selectedKas.pengurus?.full_name || '-'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Divisi</p>
                                        <p className="font-bold text-slate-900 mt-1">{selectedKas.pengurus?.divisions?.name || '-'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Kas Untuk</p>
                                        <p className="font-bold text-slate-900 mt-1">{getMonthName(selectedKas.bulan)} {selectedKas.tahun}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Nominal</p>
                                        <p className="font-black text-green-600 mt-1 text-xl">Rp {selectedKas.amount.toLocaleString("id-ID")}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Tanggal Bayar</p>
                                        <p className="font-bold text-slate-900 mt-1">
                                            {new Date(selectedKas.created_at).toLocaleDateString("id-ID", {
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Status</p>
                                        <div className="mt-1">{getStatusBadge(selectedKas.status)}</div>
                                    </div>
                                </div>

                                {selectedKas.catatan && (
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <p className="text-xs text-indigo-600 font-bold uppercase">Catatan</p>
                                        <p className="font-medium text-indigo-800 mt-1">{selectedKas.catatan}</p>
                                    </div>
                                )}

                                {selectedKas.bukti_url && (
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-xs text-slate-500 font-bold uppercase mb-3">Bukti Pembayaran</p>
                                        <a
                                            href={selectedKas.bukti_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block relative rounded-xl overflow-hidden border-2 border-slate-200 hover:border-indigo-500 transition-colors"
                                        >
                                            <NextImage src={selectedKas.bukti_url} alt="Bukti kas" width={600} height={400} className="w-full h-auto" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                                                <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                                                    <ExternalLink size={16} /> Buka Gambar
                                                </span>
                                            </div>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}