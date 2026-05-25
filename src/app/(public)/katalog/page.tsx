import { Metadata } from "next";
import KatalogClient from "./KatalogClient";

export const metadata: Metadata = {
  title: "Katalog Produk & Merchandise | SKI Telkom University Purwokerto",
  description: "Dukung kegiatan dakwah dan operasional SKI dengan membeli merchandise resmi berkualitas tinggi.",
};

import { Suspense } from "react";

export default function KatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <KatalogClient />
    </Suspense>
  );
}
