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
    Clock,
    ShoppingCart,
} from "lucide-react";

interface Product {
    id?: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    category: string;
    status: "available" | "unavailable";
    created_at?: string;
}

interface Stats {
    totalProducts: number;
    totalStock: number;
    totalValue: number;
    lowStock: number;
}

export default function Admin2Dashboard() {
    const router = useRouter();
    const role = "admin2";
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        totalStock: 0,
        totalValue: 0,
        lowStock: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProducts(data || []);

            // Calculate stats
            const totalProducts = data?.length || 0;
            const totalStock = data?.reduce((sum, p) => sum + p.stock, 0) || 0;
            const totalValue = data?.reduce((sum, p) => sum + p.price * p.stock, 0) || 0;
            const lowStock = data?.filter((p) => p.stock > 0 && p.stock <= 5).length || 0;

            setStats({ totalProducts, totalStock, totalValue, lowStock });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Produk",
            value: stats.totalProducts,
            icon: <Package size={24} />,
            color: "from-blue-500 to-blue-600",
            lightColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: "Total Stok",
            value: stats.totalStock,
            icon: <Package size={24} />,
            color: "from-emerald-500 to-emerald-600",
            lightColor: "bg-emerald-50",
            textColor: "text-emerald-600",
        },
        {
            title: "Nilai Inventori",
            value: `Rp ${stats.totalValue.toLocaleString()}`,
            icon: <DollarSign size={24} />,
            color: "from-purple-500 to-purple-600",
            lightColor: "bg-purple-50",
            textColor: "text-purple-600",
        },
        {
            title: "Stok Menipis",
            value: stats.lowStock,
            icon: <AlertTriangle size={24} />,
            color: stats.lowStock > 0 ? "from-red-500 to-red-600" : "from-orange-500 to-orange-600",
            lightColor: stats.lowStock > 0 ? "bg-red-50" : "bg-orange-50",
            textColor: stats.lowStock > 0 ? "text-red-600" : "text-orange-600",
            alert: stats.lowStock > 0,
        },
    ];

    const quickActions = [
        {
            label: "Tambah Produk",
            icon: <Plus size={20} />,
            href: `/admin/${role}/katalog/new`,
            description: "Tambah produk baru",
            color: "blue",
            variant: "dashed",
        },
        {
            label: "Lihat Katalog",
            icon: <ShoppingCart size={20} />,
            href: "/katalog",
            description: "Buka halaman publik",
            color: "emerald",
            external: true,
        },
        {
            label: "Kelola Semua",
            icon: <Package size={20} />,
            href: `/admin/${role}/katalog`,
            description: "Edit & hapus produk",
            color: "purple",
        },
    ];

    const colorVariants: Record<string, { bg: string; border: string; text: string; hover: string }> = {
        blue: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-600",
            hover: "hover:bg-blue-100 hover:border-blue-300",
        },
        emerald: {
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            text: "text-emerald-600",
            hover: "hover:bg-emerald-100 hover:border-emerald-300",
        },
        purple: {
            bg: "bg-purple-50",
            border: "border-purple-200",
            text: "text-purple-600",
            hover: "hover:bg-purple-100 hover:border-purple-300",
        },
    };

    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <AdminSidebar role={role} />

            <main className="lg:ml-64 p-4 md:p-5 lg:p-6 pt-16 lg:pt-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white">
                            <LayoutDashboard size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Katalog</h1>
                            <p className="text-sm text-gray-500">Kelola produk dan danusan SKI</p>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-4 max-w-2xl">
                        Pantau stok produk, nilai inventori, dan kelola katalog danusan SKI dengan mudah dari dashboard ini.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className={`bg-white rounded-2xl p-6 shadow-sm border ${card.alert ? "border-red-200" : "border-gray-100"
                                } hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden`}
                        >
                            {card.alert && (
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                            )}
                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}
                                >
                                    {card.icon}
                                </div>
                                <ArrowRight
                                    size={18}
                                    className="text-gray-300 group-hover:text-sky-500 transition-colors opacity-0 group-hover:opacity-100"
                                />
                            </div>
                            <div className="mt-2 relative z-10">
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                    {loading ? (
                                        <span className="inline-block w-16 h-10 bg-gray-200 animate-pulse rounded-lg" />
                                    ) : (
                                        card.value
                                    )}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                                {card.alert && stats.lowStock > 0 && (
                                    <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        Perlu perhatian!
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full" />
                                    Aksi Cepat
                                </h2>
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                    3 Menu
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {quickActions.map((action, index) => {
                                    const variant = colorVariants[action.color];
                                    const ActionComponent = action.external ? "a" : motion.a;
                                    return (
                                        <ActionComponent
                                            key={index}
                                            href={action.href}
                                            {...(!action.external && {
                                                initial: { opacity: 0, scale: 0.98 },
                                                animate: { opacity: 1, scale: 1 },
                                                transition: { delay: 0.3 + index * 0.05 },
                                                whileHover: { scale: 1.02 },
                                                whileTap: { scale: 0.98 },
                                            })}
                                            className={`flex items-center gap-4 p-4 rounded-xl border ${action.variant === "dashed"
                                                ? "border-2 border-dashed border-gray-300 hover:border-solid"
                                                : variant.border
                                                } ${variant.bg} hover:${variant.hover} transition-all duration-200 group`}
                                            {...(action.external && {
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                            })}
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-xl ${variant.bg} ${variant.text} flex items-center justify-center group-hover:scale-110 transition-transform`}
                                            >
                                                {action.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold ${variant.text}`}>{action.label}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                                            </div>
                                            <ArrowRight
                                                size={16}
                                                className={`${variant.text} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`}
                                            />
                                        </ActionComponent>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full" />
                                    Stok Menipis
                                </h2>
                                <AlertTriangle
                                    size={18}
                                    className={stats.lowStock > 0 ? "text-red-500" : "text-gray-400"}
                                />
                            </div>

                            {lowStockProducts.length > 0 ? (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {lowStockProducts.slice(0, 5).map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.05 }}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
                                        >
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate text-sm">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-red-600 font-medium">
                                                    Stok: {product.stock} unit
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/admin/${role}/katalog/${product.id}/edit`)}
                                                className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0"
                                            >
                                                Edit
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp size={28} className="text-emerald-600" />
                                    </div>
                                    <p className="text-gray-700 font-medium text-sm">Semua stok aman</p>
                                    <p className="text-gray-400 text-xs mt-1">Tidak ada produk yang menipis</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Products */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full" />
                            Produk Terbaru
                        </h2>
                        <button
                            onClick={() => router.push(`/admin/${role}/katalog`)}
                            className="text-sky-600 hover:text-sky-700 font-semibold text-sm flex items-center gap-1 group"
                        >
                            Lihat Semua
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.slice(0, 6).map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.03 }}
                                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-sky-200 hover:bg-sky-50/30 transition-all cursor-pointer group"
                                    onClick={() => router.push(`/admin/${role}/katalog/${product.id}/edit`)}
                                >
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded-xl flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-sm text-sky-600 font-semibold">
                                                Rp {product.price.toLocaleString()}
                                            </p>
                                            <span className="text-xs text-gray-400">•</span>
                                            <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${product.status === "available"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {product.status === "available" ? "Tersedia" : "Habis"}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <LayoutDashboard size={36} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">Belum ada produk</p>
                            <p className="text-gray-400 text-sm mt-1">Mulai tambahkan produk untuk danusan SKI</p>
                            <button
                                onClick={() => router.push(`/admin/${role}/katalog/new`)}
                                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                <Plus size={18} />
                                Tambah Produk Pertama
                            </button>
                        </div>
                    )}
                </div>

                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/4" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Package size={24} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold">Kelola Katalog Danusan SKI</h2>
                        </div>
                        <p className="text-white/80 max-w-2xl mb-6">
                            Dashboard ini membantu Anda mengelola produk dan danusan SKI. Pantau stok, tambahkan produk baru,
                            dan pastikan katalog selalu update untuk pengunjung website.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => router.push(`/admin/${role}/katalog/new`)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                            >
                                <Plus size={18} />
                                Tambah Produk Baru
                            </button>
                            <a
                                href="/katalog"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
                            >
                                <ShoppingCart size={18} />
                                Lihat Katalog Publik
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}