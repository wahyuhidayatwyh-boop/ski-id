"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { 
    Activity, 
    Save, 
    Loader2, 
    ShoppingCart, 
    User, 
    Phone, 
    FileText, 
    Search,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface Product {
    id: string;
    name: string;
    price: number;
    cost_price: number;
    stock: number;
    min_stock: number;
    sold_count: number;
    image_url: string;
}

export default function Admin2Penjualan() {
    const role = "admin2";
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Form state
    const [buyerName, setBuyerName] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("id, name, price, cost_price, stock, min_stock, sold_count, image_url")
                .eq("status", "available")
                .order("name", { ascending: true });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const selectedProduct = products.find(p => p.id === selectedProductId);
    const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;
    const totalCost = selectedProduct ? selectedProduct.cost_price * quantity : 0;
    const totalProfit = totalPrice - totalCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedProduct) {
            alert("Silakan pilih produk terlebih dahulu!");
            return;
        }
        
        if (quantity < 1) {
            alert("Jumlah pembelian minimal 1!");
            return;
        }
        
        if (selectedProduct.stock < quantity) {
            alert(`Stok tidak mencukupi! Stok tersisa: ${selectedProduct.stock}`);
            return;
        }

        setSaving(true);
        setSuccessMessage("");

        try {
            // 1. Insert into sales table
            const { error: salesError } = await supabase.from("sales").insert([{
                product_id: selectedProductId,
                buyer_name: buyerName,
                buyer_phone: buyerPhone,
                quantity: quantity,
                total_price: totalPrice,
                total_cost: totalCost,
                total_profit: totalProfit,
                notes: notes
            }]);

            if (salesError) throw salesError;

            // 2. Update product stock and sold_count
            const { error: updateError } = await supabase
                .from("products")
                .update({ 
                    stock: selectedProduct.stock - quantity,
                    sold_count: selectedProduct.sold_count + quantity
                })
                .eq("id", selectedProductId);

            if (updateError) throw updateError;

            setSuccessMessage("Transaksi berhasil disimpan! Stok telah dikurangi otomatis.");
            
            // Reset form
            setBuyerName("");
            setBuyerPhone("");
            setSelectedProductId("");
            setQuantity(1);
            setNotes("");
            
            // Refresh products to get updated stock
            fetchProducts();
            
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error: any) {
            console.error("Error saving transaction:", error);
            alert(`Gagal menyimpan transaksi: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar role={role} />

            <main className="lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                            <Activity size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kasir / POS</h1>
                            <p className="text-sm text-gray-500">
                                Catat transaksi penjualan manual (pemesanan via WA)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Kiri */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            {successMessage && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-3 border border-emerald-100"
                                >
                                    <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Berhasil!</h4>
                                        <p className="text-sm opacity-90">{successMessage}</p>
                                    </div>
                                </motion.div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="font-bold text-gray-800 text-lg border-b pb-3">Informasi Pembeli</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nama Pembeli *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={buyerName}
                                                onChange={(e) => setBuyerName(e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Nama lengkap pembeli"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            No. WhatsApp (Opsional)
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={buyerPhone}
                                                onChange={(e) => setBuyerPhone(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Contoh: 0812..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-800 text-lg border-b pb-3 pt-4">Informasi Produk</h3>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Pilih Produk *
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            value={selectedProductId}
                                            onChange={(e) => setSelectedProductId(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                                        >
                                            <option value="">-- Pilih produk yang dibeli --</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                                                    {p.name} - Rp {p.price.toLocaleString()} {p.stock <= 0 ? '(Habis)' : `(Stok: ${p.stock})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Jumlah Beli *
                                        </label>
                                        <div className="relative">
                                            <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                                required
                                                min="1"
                                                max={selectedProduct?.stock || 1}
                                                disabled={!selectedProductId}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Catatan / Alamat (Opsional)
                                        </label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                rows={2}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Catatan tambahan..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving || loading || !selectedProductId || quantity < 1}
                                        className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 w-full md:w-auto justify-center"
                                    >
                                        {saving ? (
                                            <><Loader2 className="animate-spin" size={20} /> Memproses...</>
                                        ) : (
                                            <><Save size={20} /> Simpan Transaksi</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Ringkasan Kanan */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-800 text-lg border-b pb-3 mb-4">Ringkasan Pembayaran</h3>
                            
                            {!selectedProduct ? (
                                <div className="text-center py-10 flex flex-col items-center text-gray-400">
                                    <ShoppingCart size={48} className="mb-3 opacity-20" />
                                    <p>Pilih produk terlebih dahulu</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-16 h-16 rounded-xl object-cover border" />
                                        <div>
                                            <h4 className="font-semibold text-gray-800 line-clamp-1">{selectedProduct.name}</h4>
                                            <p className="text-sm text-gray-500">Rp {selectedProduct.price.toLocaleString()} x {quantity}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Harga Satuan</span>
                                            <span className="font-semibold">Rp {selectedProduct.price.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Jumlah</span>
                                            <span className="font-semibold">{quantity} item</span>
                                        </div>
                                        
                                        <div className="pt-3 border-t border-dashed flex justify-between items-center">
                                            <span className="text-gray-700 font-bold">Total Pembayaran</span>
                                            <span className="text-xl font-bold text-indigo-600">Rp {totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    {selectedProduct.stock - quantity <= selectedProduct.min_stock && (
                                        <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-xs flex gap-2 items-start">
                                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                            <p>Peringatan: Stok setelah transaksi ini akan menjadi {selectedProduct.stock - quantity}.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
