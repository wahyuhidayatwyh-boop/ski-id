"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { 
    FileText, 
    Plus, 
    Trash2, 
    Loader2,
    Calendar,
    DollarSign,
    Tag,
    Save
} from "lucide-react";
import { motion } from "framer-motion";

interface Expense {
    id: string;
    name: string;
    amount: number;
    category: string;
    expense_date: string;
}

export default function Admin2Pengeluaran() {
    const role = "admin2";
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        amount: 0,
        category: "Operasional",
        expense_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const { data, error } = await supabase
                .from("expenses")
                .select("*")
                .order("expense_date", { ascending: false })
                .order("created_at", { ascending: false });

            if (error) throw error;
            setExpenses(data || []);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from("expenses").insert([formData]);
            if (error) throw error;
            
            setShowForm(false);
            setFormData({
                name: "",
                amount: 0,
                category: "Operasional",
                expense_date: new Date().toISOString().split('T')[0]
            });
            fetchExpenses();
        } catch (error: any) {
            console.error("Error saving expense:", error);
            alert(`Gagal menyimpan pengeluaran: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus pengeluaran ini?")) return;
        
        try {
            const { error } = await supabase.from("expenses").delete().eq("id", id);
            if (error) throw error;
            fetchExpenses();
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Gagal menghapus pengeluaran.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar role={role} />

            <main className="lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pengeluaran</h1>
                            <p className="text-sm text-gray-500">Catat dan kelola pengeluaran operasional</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <Plus size={20} />
                        {showForm ? "Tutup Form" : "Tambah Pengeluaran"}
                    </button>
                </div>

                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
                    >
                        <h3 className="font-bold text-lg mb-4 border-b pb-2">Form Pengeluaran Baru</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama / Keterangan</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    placeholder="Contoh: Beli Plastik Packing"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    placeholder="0"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                                >
                                    <option value="Operasional">Operasional</option>
                                    <option value="Produksi">Produksi</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.expense_date}
                                    onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            
                            <div className="md:col-span-2 pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                                    Simpan Pengeluaran
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-sky-500" size={32} /></div>
                    ) : expenses.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            <FileText size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Belum ada data pengeluaran.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                                        <th className="p-4 font-medium">Tanggal</th>
                                        <th className="p-4 font-medium">Keterangan</th>
                                        <th className="p-4 font-medium">Kategori</th>
                                        <th className="p-4 font-medium text-right">Nominal</th>
                                        <th className="p-4 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {expenses.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-600">
                                                {new Date(exp.expense_date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="p-4 font-medium text-gray-900">
                                                {exp.name}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-red-600">
                                                Rp {exp.amount.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(exp.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
