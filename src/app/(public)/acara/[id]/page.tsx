import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Calendar, Tag, MessageCircle, ArrowLeft, Building2, MapPin, Users, ExternalLink, Loader2 } from "lucide-react";

// Force dynamic rendering to ensure environment variables are available at request time
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail_url: string;
  start_date: string;
  end_date: string;
  location: string;
  quota: number;
  status: "upcoming" | "ongoing" | "finished";
  is_registration_open: boolean;
  registration_link: string;
  contact_phone: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-sky-50 text-sky-600 border-sky-200",
  ongoing: "bg-emerald-50 text-emerald-600 border-emerald-200",
  finished: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Akan Datang",
  ongoing: "Sedang Berlangsung",
  finished: "Selesai",
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const { data: event } = await supabase
    .from("events")
    .select("title, description, thumbnail_url")
    .eq("id", id)
    .single();

  if (!event) {
    return { title: "Acara Tidak Ditemukan" };
  }

  return {
    title: `${event.title} | SKI Telkom University Purwokerto`,
    description: event.description,
    openGraph: {
      images: event.thumbnail_url ? [event.thumbnail_url] : [],
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    notFound();
  }

  // Other events (excluding current)
  const { data: otherEvents } = await supabase
    .from("events")
    .select("id, title, thumbnail_url, start_date, status")
    .neq("id", id)
    .order("start_date", { ascending: false })
    .limit(3);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 sm:py-16">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">

        {/* Back Button & Breadcrumbs */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <Link
            href="/acara"
            className="flex items-center gap-1.5 text-gray-600 hover:text-[#0ea5e9] font-semibold transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Acara
          </Link>
          <span className="text-gray-300">/</span>
          <span>Detail Acara</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{event.title}</span>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

          {/* Main Area */}
          <div className="lg:col-span-8 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-5 sm:p-8">
            {/* Event Photo */}
            {event.thumbnail_url ? (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-8 bg-gray-100">
                <img
                  src={event.thumbnail_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-8">
                <Calendar className="text-[#0ea5e9]" size={64} />
              </div>
            )}

            {/* Status badge */}
            <div className="mb-4">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border ${STATUS_COLORS[event.status]}`}>
                {STATUS_LABELS[event.status]}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1e293b] leading-tight mb-6">
              {event.title}
            </h1>

            {/* Content */}
            <div className="prose max-w-none text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-100 pt-6">
              {event.content ? (
                <div dangerouslySetInnerHTML={{ __html: event.content.replace(/\n/g, "<br/>") }} />
              ) : (
                <p>{event.description}</p>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Event Info Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-[#1e293b] mb-6 pb-3 border-b border-gray-50">
                Detail Pelaksanaan
              </h3>

              <div className="flex flex-col gap-5 mb-8">
                {/* Tanggal Mulai */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-[#0ea5e9] shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Tanggal Mulai</span>
                    <span className="text-sm font-semibold text-[#1e293b]">{formatDate(event.start_date)}</span>
                  </div>
                </div>

                {/* Tanggal Selesai */}
                {event.end_date && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Tanggal Selesai</span>
                      <span className="text-sm font-semibold text-[#1e293b]">{formatDate(event.end_date)}</span>
                    </div>
                  </div>
                )}

                {/* Lokasi */}
                {event.location && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Lokasi</span>
                      <span className="text-sm font-semibold text-[#1e293b]">{event.location}</span>
                    </div>
                  </div>
                )}

                {/* Kuota */}
                {event.quota > 0 && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Kuota Peserta</span>
                      <span className="text-sm font-semibold text-[#1e293b]">{event.quota} orang</span>
                    </div>
                  </div>
                )}

                {/* Institusi */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0ea5e9] shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Institusi</span>
                    <span className="text-sm font-semibold text-[#1e293b]">Sentral Kerohanian Islam (SKI)</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {event.is_registration_open && event.registration_link && (
                  <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-2xl font-bold text-center flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
                  >
                    <ExternalLink size={18} />
                    Daftar Sekarang
                  </a>
                )}
                <a
                  href={`https://wa.me/${event.contact_phone || '628123456789'}?text=Assalamualaikum%20admin%20SKI,%20saya%20ingin%20bertanya%20mengenai%20acara%20${encodeURIComponent(event.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-center flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
                >
                  <MessageCircle size={18} />
                  Hubungi Narahubung via WA
                </a>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-[#0ea5e9]/10 to-[#0284c7]/10 border border-[#0ea5e9]/20 rounded-3xl p-6 text-center">
              <span className="text-xs font-bold text-[#0ea5e9] uppercase tracking-wider block mb-1">Informasi Penting</span>
              <p className="text-xs text-[#0284c7] leading-relaxed">
                *Pastikan Anda melakukan pendaftaran tepat waktu sebelum kuota penuh. Info narahubung dapat dihubungi kapan saja pada jam kerja.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Area: Other Events */}
        {otherEvents && otherEvents.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1e293b] mb-8 pb-3 border-b border-gray-100">
              Acara Menarik Lainnya
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherEvents.map((item) => (
                <Link key={item.id} href={`/acara/${item.id}`} className="group cursor-pointer">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 hover:border-[#0ea5e9]/30 transition-all h-full flex flex-col">
                    <div className="relative aspect-video w-full overflow-hidden shrink-0 bg-gray-100">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                          <Calendar className="text-[#0ea5e9]" size={32} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${STATUS_COLORS[item.status] ?? "bg-white text-gray-700 border-gray-200"}`}>
                          {STATUS_LABELS[item.status]}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2 font-semibold">
                        <Calendar size={12} className="text-[#0ea5e9]" />
                        <span>{formatDate(item.start_date)}</span>
                      </div>
                      <h4 className="font-bold text-[#1e293b] text-sm sm:text-base leading-snug group-hover:text-[#0ea5e9] transition-colors line-clamp-2">
                        {item.title}
                      </h4>
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
