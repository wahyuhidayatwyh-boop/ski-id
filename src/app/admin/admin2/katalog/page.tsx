"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    Package,
    Plus,
    Edit,
    Trash2,
    Search,
    Loader2,
    Eye,
    DollarSign,
    Filter,
    Grid,
    List,
    ArrowUpDown,
    AlertCircle,
    CheckCircle,
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

type ViewMode = "grid" | "list";
type SortMode = "newest" | "price-low" | "price-high" | "name";

export default function Admin2Katalog() {
    const router = useRouter();
    const role = "admin2";
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortMode, setSortMode] = useState<SortMode>("newest");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

        try {
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw error;
            setProducts(products.filter((p) => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Gagal menghapus produk.");
        }
    };

    // Get unique categories
    const categories = [...new Set(products.map((p) => p.category))].filter(Boolean);

    // Filter and sort products
    const filteredProducts = products
        .filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            const matchesStatus = !statusFilter || product.status === statusFilter;
            return matchesSearch && matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortMode) {
                case "newest":
                    return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "name":
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

    const clearFilters = () => {
        setSearchQuery("");
        setCategoryFilter("");
        setStatusFilter("");
    };

    const hasActiveFilters = searchQuery || categoryFilter || statusFilter;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="animate-spin text-sky-500" size={36} />
                    </div>
                    <p className="text-gray-600 font-medium">Memuat data produk...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <AdminSidebar role={role} />

            <main className="lg:ml-64 p-4 md:p-5 lg:p-6 pt-16 lg:pt-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white">
                                <Package size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kelola Katalog</h1>
                                <p className="text-sm text-gray-500">
                                    {filteredProducts.length} dari {products.length} produk
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/admin/${role}/katalog/new`)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-sky-500/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Tambah Produk Baru
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama atau deskripsi produk..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Category Filter */}
                        {categories.length > 0 && (
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[160px] appearance-none cursor-pointer"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-4 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[140px] appearance-none cursor-pointer"
                            >
                                <option value="">Semua Status</option>
                                <option value="available">Tersedia</option>
                                <option value="unavailable">Habis</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={sortMode}
                                onChange={(e) => setSortMode(e.target.value as SortMode)}
                                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white min-w-[160px] appearance-none cursor-pointer"
                            >
                                <option value="newest">Terbaru</option>
                                <option value="price-low">Harga Terendah</option>
                                <option value="price-high">Harga Tertinggi</option>
                                <option value="name">Nama A-Z</option>
                            </select>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-all ${viewMode === "grid"
                                    ? "bg-white text-sky-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                                title="Tampilan Grid"
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-all ${viewMode === "list"
                                    ? "bg-white text-sky-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                                title="Tampilan List"
                            >
                                <List size={18} />
                            </button>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
                            >
                                <AlertCircle size={16} />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Products Grid/List */}
                {filteredProducts.length > 0 ? (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ y: -4 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-square overflow-hidden">
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${product.status === "available"
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-gray-500 text-white"
                                                    }`}
                                            >
                                                {product.status === "available" ? "Tersedia" : "Habis"}
                                            </span>
                                        </div>
                                        {product.stock <= 5 && product.stock > 0 && product.status === "available" && (
                                            <div className="absolute top-3 left-3">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow-sm">
                                                    Stok menipis!
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="mb-2">
                                            {product.category && (
                                                <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg">
                                                    {product.category}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[2.5rem]">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div>
                                                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                                    <DollarSign size={16} />
                                                    <span className="text-lg">Rp {product.price.toLocaleString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Stok:{" "}
                                                    <span
                                                        className={
                                                            product.stock <= 5 ? "text-red-500 font-medium" : ""
                                                        }
                                                    >
                                                        {product.stock} unit
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() =>
                                                        router.push(`/admin/${role}/katalog/${product.id}/edit`)
                                                    }
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/katalog?search=${encodeURIComponent(product.name)}`, "_blank")}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Lihat"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id!)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {filteredProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {product.category && (
                                                    <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                                                        {product.category}
                                                    </span>
                                                )}
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.status === "available"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-gray-100 text-gray-600"
                                                        }`}
                                                >
                                                    {product.status === "available" ? "Tersedia" : "Habis"}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                            <p className="text-sm text-gray-500 truncate">{product.description}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-emerald-600">
                                                Rp {product.price.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400">Stok: {product.stock}</p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => router.push(`/admin/${role}/katalog/${product.id}/edit`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => window.open(`/katalog?search=${encodeURIComponent(product.name)}`, "_blank")}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Lihat"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id!)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Package size={36} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {products.length === 0
                                ? "Belum ada produk"
                                : hasActiveFilters
                                    ? "Tidak ada produk ditemukan"
                                    : "Katalog kosong"}
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {products.length === 0
                                ? "Mulai tambahkan produk untuk danusan SKI"
                                : hasActiveFilters
                                    ? "Coba ubah filter atau kata kunci pencarian"
                                    : "Belum ada produk yang ditambahkan"}
                        </p>
                        {hasActiveFilters ? (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                <Filter size={18} />
                                Reset Filter
                            </button>
                        ) : (
                            products.length === 0 && (
                                <button
                                    onClick={() => router.push(`/admin/${role}/katalog/new`)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    <Plus size={20} />
                                    Tambah Produk Pertama
                                </button>
                            )
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}