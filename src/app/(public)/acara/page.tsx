import AcaraClient from "@/components/acara/AcaraClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acara & Kegiatan | SKI Telkom University Purwokerto",
  description: "Daftar agenda acara dan kegiatan rutin dari setiap divisi Sentral Kerohanian Islam Telkom University Purwokerto.",
};

export default function AcaraPage() {
  return <AcaraClient />;
}
