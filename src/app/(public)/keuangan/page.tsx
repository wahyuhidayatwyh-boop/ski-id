import KeuanganClient from "@/components/keuangan/KeuanganClient";

export const metadata = {
  title: "Transparansi Keuangan | Sentral Kerohanian Islam",
  description: "Laporan keuangan terbuka SKI Telkom University Purwokerto — pemasukan, pengeluaran, donasi, dan alokasi dana per divisi.",
};

export default function KeuanganPage() {
  return <KeuanganClient />;
}
