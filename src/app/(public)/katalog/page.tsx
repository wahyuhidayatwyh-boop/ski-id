import { Metadata } from "next";
import KatalogClient from "./KatalogClient";

export const metadata: Metadata = {
  title: "Katalog Produk & Merchandise | SKI Telkom University Purwokerto",
  description: "Dukung kegiatan dakwah dan operasional SKI dengan membeli merchandise resmi berkualitas tinggi.",
};

export default function KatalogPage() {
  return <KatalogClient />;
}
