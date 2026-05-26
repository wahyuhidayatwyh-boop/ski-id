"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { 
    FileText, 
    Download, 
    Printer, 
    Loader2,
    Calendar,
    Search,
    Filter,
    Activity
} from "lucide-react";

export default function Admin2Laporan() {
    const role = "admin2";
    const [sales, setSales] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1); // First day of current month
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // End date should include the whole day, so we add 23:59:59
            const endDateString = `${endDate}T23:59:59.999Z`;
            const startDateString = `${startDate}T00:00:00.000Z`;

            // Fetch Sales
            const { data: salesData, error: salesError } = await supabase
                .from("sales")
                .select("*, products(name)")
                .gte("created_at", startDateString)
                .lte("created_at", endDateString)
                .order("created_at", { ascending: false });

            if (salesError) throw salesError;
            setSales(salesData || []);

            // Fetch Expenses
            const { data: expData, error: expError } = await supabase
                .from("expenses")
                .select("*")
                .gte("expense_date", startDateString)
                .lte("expense_date", endDateString)
                .order("expense_date", { ascending: false });

            if (expError) throw expError;
            setExpenses(expData || []);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Sales Section
        csvContent += "=== DATA PENJUALAN ===\n";
        csvContent += "Tanggal,Produk,Pembeli,Telepon,Jumlah,Total Harga,Keuntungan\n";
        sales.forEach(s => {
            const date = new Date(s.created_at).toLocaleDateString('id-ID');
            const product = s.products?.name || "Unknown";
            const row = `"${date}","${product}","${s.buyer_name}","${s.buyer_phone || ''}",${s.quantity},${s.total_price},${s.total_profit}`;
            csvContent += row + "\n";
        });
        
        csvContent += "\n\n=== DATA PENGELUARAN ===\n";
        csvContent += "Tanggal,Keterangan,Kategori,Nominal\n";
        expenses.forEach(e => {
            const date = new Date(e.expense_date).toLocaleDateString('id-ID');
            const row = `"${date}","${e.name}","${e.category}",${e.amount}`;
            csvContent += row + "\n";
        });
        
        const totalSales = sales.reduce((sum, s) => sum + s.total_price, 0);
        const totalProfit = sales.reduce((sum, s) => sum + s.total_profit, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalProfit - totalExpense;
        
        csvContent += "\n\n=== RINGKASAN ===\n";
        csvContent += `Total Pemasukan,${totalSales}\n`;
        csvContent += `Keuntungan Kotor,${totalProfit}\n`;
        csvContent += `Total Pengeluaran,${totalExpense}\n`;
        csvContent += `Keuntungan Bersih,${netProfit}\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Laporan_Keuangan_SKI_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalSales = sales.reduce((sum, s) => sum + s.total_price, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.total_profit, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalProfit - totalExpense;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="print:hidden">
                <AdminSidebar role={role} />
            </div>

            <main className="lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 print:m-0 print:p-0">
                {/* Header (Hidden in print) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
                            <p className="text-sm text-gray-500">Riwayat transaksi dan pengeluaran</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 transition-colors border border-emerald-200"
                        >
                            <Download size={18} />
                            Export Excel/CSV
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors border border-indigo-200"
                        >
                            <Printer size={18} />
                            Cetak PDF
                        </button>
                    </div>
                </div>

                {/* Filter Box (Hidden in print) */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 print:hidden">
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        <div className="w-full md:w-auto">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            onClick={fetchData}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors w-full md:w-auto"
                        >
                            <Filter size={18} />
                            Terapkan Filter
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
                ) : (
                    <div className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
                        {/* Print Header */}
                        <div className="text-center mb-8 border-b pb-6">
                            <h2 className="text-2xl font-bold text-gray-900">LAPORAN KEUANGAN &ANUSAN SKI</h2>
                            <p className="text-gray-600 mt-1">Periode: {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}</p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                <p className="text-sm text-gray-500 font-medium">Total Pemasukan</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">Rp {totalSales.toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-100 bg-emerald-50">
                                <p className="text-sm text-emerald-600 font-medium">Keuntungan Kotor</p>
                                <p className="text-xl font-bold text-emerald-700 mt-1">Rp {totalProfit.toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-100 bg-rose-50">
                                <p className="text-sm text-rose-600 font-medium">Total Pengeluaran</p>
                                <p className="text-xl font-bold text-rose-700 mt-1">Rp {totalExpense.toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-100 bg-indigo-50">
                                <p className="text-sm text-indigo-600 font-medium">Keuntungan Bersih</p>
                                <p className="text-xl font-bold text-indigo-700 mt-1">Rp {netProfit.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Penjualan Table */}
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-emerald-500" />
                                Riwayat Penjualan
                            </h3>
                            {sales.length === 0 ? (
                                <p className="text-gray-500 italic">Tidak ada transaksi penjualan pada periode ini.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                                <th className="p-3 font-semibold">Tanggal</th>
                                                <th className="p-3 font-semibold">Produk</th>
                                                <th className="p-3 font-semibold">Pembeli</th>
                                                <th className="p-3 font-semibold text-center">Jml</th>
                                                <th className="p-3 font-semibold text-right">Total</th>
                                                <th className="p-3 font-semibold text-right">Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sales.map(s => (
                                                <tr key={s.id}>
                                                    <td className="p-3 text-gray-600">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                                                    <td className="p-3 font-medium">{s.products?.name || "-"}</td>
                                                    <td className="p-3">{s.buyer_name}</td>
                                                    <td className="p-3 text-center">{s.quantity}</td>
                                                    <td className="p-3 text-right">Rp {s.total_price.toLocaleString()}</td>
                                                    <td className="p-3 text-right text-emerald-600 font-medium">Rp {s.total_profit.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pengeluaran Table */}
                        <div className="pt-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-rose-500" />
                                Riwayat Pengeluaran
                            </h3>
                            {expenses.length === 0 ? (
                                <p className="text-gray-500 italic">Tidak ada pengeluaran pada periode ini.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                                <th className="p-3 font-semibold">Tanggal</th>
                                                <th className="p-3 font-semibold">Keterangan</th>
                                                <th className="p-3 font-semibold">Kategori</th>
                                                <th className="p-3 font-semibold text-right">Nominal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {expenses.map(e => (
                                                <tr key={e.id}>
                                                    <td className="p-3 text-gray-600">{new Date(e.expense_date).toLocaleDateString('id-ID')}</td>
                                                    <td className="p-3 font-medium">{e.name}</td>
                                                    <td className="p-3">{e.category}</td>
                                                    <td className="p-3 text-right text-rose-600 font-medium">Rp {e.amount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
            
            <style jsx global>{`
                @media print {
                    body {
                        background-color: white !important;
                    }
                }
            `}</style>
        </div>
    );
}
