import { Metadata } from "next";
import DokumentasiClient from "./DokumentasiClient";

export const metadata: Metadata = {
  title: "Dokumentasi Acara & Kegiatan | SKI Telkom University Purwokerto",
  description: "Galeri dokumentasi foto dan arsip kegiatan dakwah serta sosial Sentral Kerohanian Islam Telkom University Purwokerto.",
};

export default function DokumentasiPage() {
  return <DokumentasiClient />;
}
