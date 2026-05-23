"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Search, LayoutGrid, Tag, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  status: "available" | "unavailable";
  created_at: string;
}

export default function KatalogClient() {
  const whatsappNumber = "6281234567890";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Get unique categories dynamically from DB
  const categories = ["Semua", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const handleOrder = (productName: string) => {
    const text = encodeURIComponent(`Halo Admin SKI, saya ingin memesan produk: ${productName}. Apakah stoknya masih tersedia?`);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-[#0ea5e9]" size={48} />
          <p className="text-gray-500 font-medium">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1e293b] mb-4">
            Katalog Merchandise SKI
          </h1>
          <p className="text-gray-600 text-lg">
            Dukung kegiatan dakwah dan operasional SKI dengan membeli berbagai produk dan merchandise resmi berkualitas kami.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center mb-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          
          <div className="relative w-full lg:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-[#1e293b] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#0ea5e9] text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {paginatedProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 group flex flex-col h-full hover:border-[#0ea5e9]/30 transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                      <ShoppingCart className="text-[#0ea5e9]" size={48} />
                    </div>
                  )}
                  {product.category && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl shadow-sm border border-gray-100">
                      <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wider flex items-center gap-1">
                        <Tag size={12} />
                        {product.category}
                      </span>
                    </div>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      Stok Menipis
                    </div>
                  )}
                </div>
                
                {/* Product Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-extrabold text-[#1e293b] text-base mb-2 group-hover:text-[#0ea5e9] transition-colors line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-grow leading-relaxed">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[#0ea5e9] font-bold text-lg">
                      {formatPrice(product.price)}
                    </div>
                    <span className="text-xs text-gray-400">Stok: {product.stock}</span>
                  </div>
                  
                  {/* Order Button */}
                  <button
                    onClick={() => handleOrder(product.name)}
                    className="w-full mt-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
                  >
                    <ShoppingCart size={16} />
                    Pesan via WA
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                  currentPage === page
                    ? "bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/20"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <LayoutGrid className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-[#1e293b] mb-1">
              {products.length === 0 ? "Belum Ada Produk" : "Produk Tidak Ditemukan"}
            </h3>
            <p className="text-gray-500 text-sm">
              {products.length === 0
                ? "Belum ada produk yang tersedia saat ini."
                : "Tidak ada produk yang cocok dengan pencarian Anda."}
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
