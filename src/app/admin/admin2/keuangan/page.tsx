"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { DollarSign, Upload, Download, Plus, Check, X, Search, FileText } from "lucide-react";

interface Transaction {
    id: string;
    type: string;
    category: string;
    amount: number;
    description: string;
    proof_url: string;
    status: string;
    created_at: string;
    pengurus?: { full_name: string };
    proker?: { name: string };
}

export default function KeuanganDashboard() {
    const role = "admin2"; // Bendahara
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'pemasukan',
        category: 'kas_rutin',
        amount: '',
        description: '',
        proof_url: ''
    });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                pengurus:created_by(full_name),
                proker:proker_id(name)
            `)
            .order('created_at', { ascending: false });
            
        if (data) setTransactions(data);
        setLoading(false);
    };

    const uploadFileToSupabase = async (file: File) => {
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
        setIsUploading(false);

        if (uploadError) {
            alert('Upload gagal: ' + uploadError.message);
            return null;
        }

        const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const userStr = localStorage.getItem("user");
        let userId = null;
        if (userStr) {
            const user = JSON.parse(userStr);
            userId = user.id;
        }

        const { error } = await supabase.from('transactions').insert([{
            type: formData.type,
            category: formData.category,
            amount: parseFloat(formData.amount),
            description: formData.description,
            proof_url: formData.proof_url,
            created_by: userId,
            status: 'approved' // Auto approved since it's bendahara filling it? Or pending? Let's make it approved
        }]);

        if (error) {
            alert("Gagal menyimpan transaksi: " + error.message);
        } else {
            setShowForm(false);
            setFormData({ type: 'pemasukan', category: 'kas_rutin', amount: '', description: '', proof_url: '' });
            fetchTransactions();
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
        if (!error) fetchTransactions();
    };

    const handleExportCSV = () => {
        if (transactions.length === 0) return;
        
        // Define CSV headers
        const headers = ["ID", "Tipe", "Kategori", "Jumlah", "Deskripsi", "Status", "Tanggal"];
        const rows = transactions.map(t => [
            t.id,
            t.type.toUpperCase(),
            t.category.toUpperCase(),
            t.amount.toString(),
            `"${t.description?.replace(/"/g, '""') || ''}"`,
            t.status.toUpperCase(),
            new Date(t.created_at).toLocaleDateString("id-ID")
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Laporan_Keuangan_DakwahOS_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate totals
    const totalPemasukan = transactions.filter(t => t.type === 'pemasukan' && t.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);
    const totalPengeluaran = transactions.filter(t => t.type === 'pengeluaran' && t.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);
    const saldo = totalPemasukan - totalPengeluaran;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar role={role} />
            <main className="flex-1 lg:ml-64 p-6 pt-20 lg:pt-6">
                <div className="max-w-6xl mx-auto space-y-6">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-50 rounded-full opacity-50"/>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Total Saldo</p>
                            <h3 className="text-3xl font-black text-slate-900 relative z-10">Rp {saldo.toLocaleString("id-ID")}</h3>
                        </div>
                        <div className="bg-green-500 p-6 rounded-3xl text-white shadow-lg shadow-green-500/20 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"/>
                            <p className="text-sm font-bold text-green-100 uppercase tracking-wider mb-2 relative z-10">Total Pemasukan</p>
                            <h3 className="text-3xl font-black relative z-10">Rp {totalPemasukan.toLocaleString("id-ID")}</h3>
                        </div>
                        <div className="bg-red-500 p-6 rounded-3xl text-white shadow-lg shadow-red-500/20 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"/>
                            <p className="text-sm font-bold text-red-100 uppercase tracking-wider mb-2 relative z-10">Total Pengeluaran</p>
                            <h3 className="text-3xl font-black relative z-10">Rp {totalPengeluaran.toLocaleString("id-ID")}</h3>
                        </div>
                    </div>

                    {/* Form Input */}
                    {showForm && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-md border border-sky-200">
                            <h3 className="font-black text-lg text-slate-900 mb-4">Input Transaksi Baru</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tipe Transaksi</label>
                                        <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                            <option value="pemasukan">Pemasukan (+)</option>
                                            <option value="pengeluaran">Pengeluaran (-)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                                        <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                            <option value="dana_kampus">Dana Kampus</option>
                                            <option value="donasi_umat">Donasi Umat</option>
                                            <option value="kas_rutin">Kas Rutin Pengurus</option>
                                            <option value="proker">Program Kerja</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                                        <input required type="number" placeholder="100000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-sm" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Singkat</label>
                                    <input required type="text" placeholder="Pembayaran DP Ruangan untuk Kajian Akbar" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Upload Bukti (E-Kuitansi / Transfer)</label>
                                    <div className="flex gap-2">
                                        <input type="file" accept="image/*,.pdf" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-sm" onChange={async (e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                const url = await uploadFileToSupabase(e.target.files[0]);
                                                if (url) setFormData({...formData, proof_url: url});
                                            }
                                        }} />
                                        {formData.proof_url && <a href={formData.proof_url} target="_blank" className="flex items-center justify-center bg-green-100 text-green-700 px-4 rounded-xl text-sm font-bold"><Check size={16}/> Terupload</a>}
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

                    {/* Transactions List */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-black text-slate-900 text-lg">Riwayat Transaksi</h3>
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
                                        <th className="py-4 px-6 font-bold text-slate-500">Aksi</th>
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
                                                <td className="py-4 px-6 text-slate-500 font-medium">{new Date(t.created_at).toLocaleDateString("id-ID")}</td>
                                                <td className="py-4 px-6">
                                                    <p className="font-bold text-slate-900">{t.description}</p>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400">Input: {t.pengurus?.full_name || 'System'}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                                                        {t.category.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`font-black ${t.type === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {t.type === 'pemasukan' ? '+' : '-'} Rp {t.amount.toLocaleString("id-ID")}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {t.proof_url ? (
                                                        <a href={t.proof_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold text-xs bg-sky-50 px-3 py-1.5 rounded-lg w-max">
                                                            <FileText size={14} /> Lihat
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 font-medium">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    {t.status === 'pending' ? (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => updateStatus(t.id, 'approved')} className="text-green-600 hover:text-green-700 bg-green-50 p-1.5 rounded-md"><Check size={16}/></button>
                                                            <button onClick={() => updateStatus(t.id, 'rejected')} className="text-red-600 hover:text-red-700 bg-red-50 p-1.5 rounded-md"><X size={16}/></button>
                                                        </div>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {t.status}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
