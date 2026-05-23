"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Tag, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

export default function CatalogSection() {
  const whatsappNumber = "6281234567890";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, category, stock")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = (productName: string) => {
    const text = encodeURIComponent(`Halo Admin SKI, saya ingin memesan produk: ${productName}. Apakah stoknya masih tersedia?`);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 relative border-b border-gray-100">
        <div className="container mx-auto px-4 flex justify-center py-16">
          <Loader2 className="animate-spin text-[#0ea5e9]" size={40} />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50 relative border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-[#0ea5e9] mb-3 uppercase tracking-widest">Katalog Merchandise</h4>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] leading-tight">
              Produk & Merchandise SKI
            </h2>
          </div>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-[#0ea5e9] rounded-xl text-sm font-semibold hover:border-[#0ea5e9]/30 transition-all shadow-sm"
          >
            Lihat Semua Produk
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group flex flex-col h-full"
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
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wider flex items-center gap-1">
                      <Tag size={12} />
                      {product.category}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-extrabold text-[#1e293b] text-base mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-grow leading-relaxed">{product.description}</p>
                <div className="text-[#0ea5e9] font-bold text-lg mb-5">
                  {formatPrice(product.price)}
                </div>
                
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
        </div>

      </div>
    </section>
  );
}
