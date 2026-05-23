import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Calendar, Tag, ArrowLeft, Image as ImageIcon, ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Gallery {
  id: string;
  title: string;
  description: string;
  image_url: string;
  type: "photo" | "video";
  created_at: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from("galleries").select("title, description").eq("id", id).single();
  if (!data) return { title: "Dokumentasi Tidak Ditemukan" };
  return {
    title: `${data.title} | Dokumentasi SKI`,
    description: data.description,
  };
}

export default async function DokumentasiDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: doc } = await supabase.from("galleries").select("*").eq("id", id).single();
  if (!doc) notFound();

  const { data: otherDocs } = await supabase
    .from("galleries")
    .select("id, title, image_url, type, created_at")
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 sm:py-16">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">

        {/* Breadcrumb */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <Link href="/dokumentasi" className="flex items-center gap-1.5 text-gray-600 hover:text-[#0ea5e9] font-semibold transition-colors">
            <ArrowLeft size={16} /> Kembali ke Dokumentasi
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{doc.title}</span>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-5 sm:p-8 mb-12">
          {/* Type badge */}
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border bg-sky-50 text-sky-600 border-sky-200 flex items-center gap-1 w-fit">
              <Tag size={12} /> {doc.type === "photo" ? "Foto" : "Video"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] mb-4">{doc.title}</h1>

          {/* Meta */}
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-8">
            <Calendar size={14} className="text-[#0ea5e9]" />
            <span>{formatDate(doc.created_at)}</span>
          </div>

          {/* Media */}
          {doc.image_url ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-8 bg-gray-100">
              {doc.type === "video" ? (
                <video src={doc.image_url} controls className="w-full h-full object-cover" />
              ) : (
                <img src={doc.image_url} alt={doc.title} className="w-full h-full object-cover" />
              )}
            </div>
          ) : (
            <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-8">
              <ImageIcon className="text-[#0ea5e9]" size={64} />
            </div>
          )}

          {/* Description */}
          <div className="prose max-w-none text-gray-600 border-t border-gray-100 pt-6">
            <p>{doc.description}</p>
          </div>

          {/* Open full */}
          {doc.image_url && (
            <a href={doc.image_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[#0ea5e9] text-white rounded-xl text-sm font-semibold hover:bg-[#0284c7] transition-colors">
              <ExternalLink size={16} /> Buka {doc.type === "photo" ? "Foto" : "Video"} Penuh
            </a>
          )}
        </div>

        {/* Other docs */}
        {otherDocs && otherDocs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#1e293b] mb-6 pb-3 border-b border-gray-100">Dokumentasi Lainnya</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherDocs.map((item) => (
                <Link key={item.id} href={`/dokumentasi/${item.id}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 hover:border-[#0ea5e9]/30 transition-all">
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                          <ImageIcon className="text-[#0ea5e9]" size={32} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2 font-semibold">
                        <Calendar size={11} className="text-[#0ea5e9]" />
                        {formatDate(item.created_at)}
                      </div>
                      <h4 className="font-bold text-[#1e293b] text-sm group-hover:text-[#0ea5e9] transition-colors line-clamp-2">{item.title}</h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
