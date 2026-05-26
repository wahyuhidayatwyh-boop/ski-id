"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Package,
    DollarSign,
    AlertTriangle,
    Plus,
    ArrowRight,
    TrendingUp,
    ShoppingCart,
    Activity,
    FileText,
    TrendingDown,
    Award
} from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    min_stock: number;
    sold_count: number;
    image_url: string;
    status: string;
}

interface Stats {
    totalProducts: number;
    totalStock: number;
    totalSold: number;
    totalRevenue: number;
    totalExpense: number;
    totalProfit: number;
    lowStock: number;
}

export default function Admin2Dashboard() {
    const router = useRouter();
    const role = "admin2";
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        totalStock: 0,
        totalSold: 0,
        totalRevenue: 0,
        totalExpense: 0,
        totalProfit: 0,
        lowStock: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Products
            const { data: prodData, error: prodError } = await supabase
                .from("products")
                .select("*")
                .order("sold_count", { ascending: false });
            if (prodError) throw prodError;

            // Fetch Sales for revenue/profit
            const { data: salesData, error: salesError } = await supabase
                .from("sales")
                .select("total_price, total_profit, quantity");
            if (salesError) throw salesError;

            // Fetch Expenses
            const { data: expData, error: expError } = await supabase
                .from("expenses")
                .select("amount");
            if (expError) throw expError;

            setProducts(prodData || []);

            // Calculate stats
            const totalProducts = prodData?.length || 0;
            const totalStock = prodData?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0;
            const lowStock = prodData?.filter((p) => p.stock > 0 && p.stock <= (p.min_stock || 5)).length || 0;

            const totalRevenue = salesData?.reduce((sum, s) => sum + s.total_price, 0) || 0;
            const grossProfit = salesData?.reduce((sum, s) => sum + s.total_profit, 0) || 0;
            const totalSold = salesData?.reduce((sum, s) => sum + s.quantity, 0) || 0;
            
            const totalExpense = expData?.reduce((sum, e) => sum + e.amount, 0) || 0;
            
            const netProfit = grossProfit - totalExpense;

            setStats({ 
                totalProducts, 
                totalStock, 
                totalSold, 
                totalRevenue, 
                totalExpense, 
                totalProfit: netProfit, 
                lowStock 
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Pemasukan",
            value: `Rp ${stats.totalRevenue.toLocaleString()}`,
            icon: <TrendingUp size={24} />,
            color: "from-emerald-500 to-emerald-600",
            textColor: "text-emerald-600",
        },
        {
            title: "Pengeluaran",
            value: `Rp ${stats.totalExpense.toLocaleString()}`,
            icon: <TrendingDown size={24} />,
            color: "from-rose-500 to-rose-600",
            textColor: "text-rose-600",
        },
        {
            title: "Keuntungan Bersih",
            value: `Rp ${stats.totalProfit.toLocaleString()}`,
            icon: <DollarSign size={24} />,
            color: "from-blue-500 to-blue-600",
            textColor: "text-blue-600",
        },
        {
            title: "Barang Terjual",
            value: `${stats.totalSold} item`,
            icon: <ShoppingCart size={24} />,
            color: "from-indigo-500 to-indigo-600",
            textColor: "text-indigo-600",
        },
        {
            title: "Total Produk",
            value: stats.totalProducts,
            icon: <Package size={24} />,
            color: "from-purple-500 to-purple-600",
            textColor: "text-purple-600",
        },
        {
            title: "Stok Menipis",
            value: stats.lowStock,
            icon: <AlertTriangle size={24} />,
            color: stats.lowStock > 0 ? "from-red-500 to-red-600" : "from-orange-500 to-orange-600",
            textColor: stats.lowStock > 0 ? "text-red-600" : "text-orange-600",
            alert: stats.lowStock > 0,
        },
    ];

    const quickActions = [
        { label: "Kasir POS", icon: <Activity size={20} />, href: `/admin/${role}/penjualan`, bg: "bg-indigo-50", text: "text-indigo-600" },
        { label: "Tambah Pengeluaran", icon: <FileText size={20} />, href: `/admin/${role}/pengeluaran`, bg: "bg-rose-50", text: "text-rose-600" },
        { label: "Tambah Produk", icon: <Plus size={20} />, href: `/admin/${role}/katalog/new`, bg: "bg-blue-50", text: "text-blue-600" },
    ];

    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= (p.min_stock || 5));
    const topProducts = [...products].sort((a, b) => b.sold_count - a.sold_count).slice(0, 5);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
            <AdminSidebar role={role} />

            <main className="lg:ml-64 p-4 md:p-5 lg:p-6 pt-16 lg:pt-4">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white">
                                <LayoutDashboard size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard POS</h1>
                                <p className="text-sm text-gray-500">Ringkasan penjualan, inventori, dan keuangan</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => router.push(action.href)}
                                className={`flex items-center gap-2 px-4 py-2 ${action.bg} ${action.text} rounded-lg font-medium hover:opacity-80 transition-opacity`}
                            >
                                {action.icon}
                                <span className="hidden sm:inline">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-white rounded-2xl p-6 shadow-sm border ${card.alert ? "border-red-200" : "border-gray-100"
                                } relative overflow-hidden`}
                        >
                            {card.alert && (
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                            )}
                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
                                    {card.icon}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                    {loading ? (
                                        <span className="inline-block w-24 h-8 bg-gray-200 animate-pulse rounded-lg" />
                                    ) : (
                                        card.value
                                    )}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Award className="text-yellow-500" size={24} />
                                Produk Terlaris
                            </h2>
                        </div>
                        
                        {topProducts.length > 0 && topProducts[0].sold_count > 0 ? (
                            <div className="space-y-4">
                                {topProducts.map((product, index) => (
                                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 flex-shrink-0">
                                            #{index + 1}
                                        </div>
                                        <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500">Rp {product.price.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-indigo-600">{product.sold_count} terjual</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <ShoppingCart size={48} className="mx-auto mb-3 opacity-20" />
                                <p>Belum ada data penjualan.</p>
                            </div>
                        )}
                    </div>

                    {/* Low Stock Alert */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full" />
                                Peringatan Stok Menipis
                            </h2>
                            <AlertTriangle size={18} className={stats.lowStock > 0 ? "text-red-500" : "text-gray-400"} />
                        </div>

                        {lowStockProducts.length > 0 ? (
                            <div className="space-y-3 overflow-y-auto max-h-[300px]">
                                {lowStockProducts.map((product) => (
                                    <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                                        <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate text-sm">{product.name}</p>
                                            <p className="text-xs text-red-600 font-medium">Sisa Stok: {product.stock} unit</p>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/admin/${role}/katalog/${product.id}/edit`)}
                                            className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0"
                                        >
                                            Restock
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp size={28} className="text-emerald-600" />
                                </div>
                                <p className="text-gray-700 font-medium text-sm">Semua stok aman</p>
                                <p className="text-gray-400 text-xs mt-1">Tidak ada produk di bawah batas minimum</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}