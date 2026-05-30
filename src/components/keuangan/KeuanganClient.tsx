"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, PieChart, TrendingUp, Filter, Heart, ShieldCheck, Users } from "lucide-react";

interface KeuanganTransaksi {
  id: string;
  kabinet_id: string;
  division_id: string | null;
  type: "IN" | "OUT";
  kategori: string;
  amount: number;
  description: string;
  tanggal: string;
  pengurus?: { full_name: string };
  divisions?: { name: string };
}

interface SaldoDivisi {
  division_id: string;
  division_name: string;
  kabinet_id: string;
  kabinet_name: string;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_akhir: number;
}

interface Kabinet {
  id: string;
  name: string;
  period: string;
  is_active: boolean;
}

const formatRupiah = (amount: number) =>
  "Rp " + Math.abs(amount).toLocaleString("id-ID");

const KATEGORI_COLORS: Record<string, string> = {
  Donasi: "bg-emerald-100 text-emerald-700",
  "Kas Anggota": "bg-blue-100 text-blue-700",
  "Jatah Anggaran Divisi": "bg-violet-100 text-violet-700",
  Operasional: "bg-amber-100 text-amber-700",
  "Proker Divisi": "bg-sky-100 text-sky-700",
  "Lain-lain": "bg-slate-100 text-slate-600",
};

export default function KeuanganClient() {
  const [kabinets, setKabinets] = useState<Kabinet[]>([]);
  const [selectedKabinetId, setSelectedKabinetId] = useState("");
  const [transaksi, setTransaksi] = useState<KeuanganTransaksi[]>([]);
  const [saldoDivisi, setSaldoDivisi] = useState<SaldoDivisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [filterKategori, setFilterKategori] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Load kabinets on mount
  useEffect(() => {
    supabase
      .from("kabinets")
      .select("id, name, period, is_active")
      .order("is_active", { ascending: false })
      .order("period", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setKabinets(data);
          const active = data.find((k) => k.is_active);
          setSelectedKabinetId(active?.id || data[0].id);
        }
      });
  }, []);

  // Load keuangan data when kabinet changes
  useEffect(() => {
    if (!selectedKabinetId) return;
    setLoading(true);
    Promise.all([
      supabase
        .from("keuangan_transaksi")
        .select("*, pengurus:created_by(full_name), divisions:division_id(name)")
        .eq("kabinet_id", selectedKabinetId)
        .in("kategori", ["Donasi"]) // Only show Infaq/Donasi for public page
        .order("tanggal", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("vw_saldo_divisi")
        .select("*")
        .eq("kabinet_id", selectedKabinetId)
        .order("division_name", { ascending: true }),
    ]).then(([trxRes, saldoRes]) => {
      setTransaksi((trxRes.data as any) || []);
      setSaldoDivisi((saldoRes.data as any) || []);
      setLoading(false);
    });
  }, [selectedKabinetId]);

  const filteredTransaksi = transaksi.filter((t) => {
    if (filterType !== "ALL" && t.type !== filterType) return false;
    if (filterKategori !== "ALL" && t.kategori !== filterKategori) return false;
    return true;
  });

  const allKategori = Array.from(new Set(transaksi.map((t) => t.kategori)));

  const totalPages = Math.max(1, Math.ceil(filteredTransaksi.length / ITEMS_PER_PAGE));
  const paginatedTransaksi = filteredTransaksi.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const selectedKabinet = kabinets.find((k) => k.id === selectedKabinetId);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ===== HERO SECTION ===== */}
      <section
        style={{
          background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 35%, #e0f7fa 65%, #ffffff 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(56,189,248,0.25)", filter: "blur(70px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(16,185,129,0.12)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(99,202,255,0.18)", filter: "blur(50px)", pointerEvents: "none" }} />

        {/* Dot grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(14,165,233,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16" style={{ position: "relative", zIndex: 10 }}>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", borderRadius: "9999px", padding: "6px 14px", marginBottom: "20px" }}>
            <ShieldCheck size={14} style={{ color: "#0284c7" }} />
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0284c7", letterSpacing: "0.1em", textTransform: "uppercase" }}>Laporan Keuangan Publik</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
            {/* Left: heading + stats */}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 900, color: "#0c4a6e", lineHeight: 1.1, marginBottom: "16px" }}>
                Transparansi<br />
                <span style={{ background: "linear-gradient(90deg, #1e3a8a, #0c4a6e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Keuangan SKI</span>
              </h1>
              <p style={{ color: "#0369a1", fontWeight: 500, maxWidth: "520px", lineHeight: 1.7, marginBottom: "32px", fontSize: "15px" }}>
                Kami berkomitmen pada transparansi penuh. Seluruh pemasukan, pengeluaran, dan alokasi dana Infaq &amp; Donasi dapat dipantau di sini secara publik — nyata, akuntabel, dan terbuka.
              </p>

              {/* Live stat pills */}
              {!loading && (() => {
                const totalInfaqMasuk = transaksi.filter(t => t.kategori === 'Donasi' && t.type === 'IN').reduce((s, t) => s + t.amount, 0);
                const saldoInfaq = transaksi.filter(t => t.kategori === 'Donasi').reduce((s, t) => s + (t.type === 'IN' ? t.amount : -t.amount), 0);
                const totalTrx = transaksi.length;
                return (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {[
                      { icon: <Heart size={14} />, color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.2)", labelColor: "#065f46", valueColor: "#064e3b", label: "Total Donasi Masuk", value: "Rp " + Math.abs(totalInfaqMasuk).toLocaleString('id-ID') },
                      { icon: <Wallet size={14} />, color: "#0284c7", bg: "rgba(2,132,199,0.08)", border: "rgba(2,132,199,0.2)", labelColor: "#075985", valueColor: "#0c4a6e", label: "Saldo Infaq", value: "Rp " + Math.abs(saldoInfaq).toLocaleString('id-ID') },
                      { icon: <TrendingUp size={14} />, color: "#7c3aed", bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.18)", labelColor: "#5b21b6", valueColor: "#4c1d95", label: "Total Transaksi", value: totalTrx + " catatan" },
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", background: s.bg, border: `1px solid ${s.border}`, borderRadius: "14px", padding: "10px 16px", backdropFilter: "blur(8px)", backgroundColor: "rgba(255,255,255,0.5)" }}>
                        <span style={{ color: s.color }}>{s.icon}</span>
                        <div>
                          <p style={{ fontSize: "10px", color: s.labelColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                          <p style={{ fontSize: "14px", fontWeight: 900, color: s.valueColor }}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Right: kabinet selector card */}
            <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(186,230,253,0.8)", borderRadius: "24px", padding: "24px", minWidth: "280px", maxWidth: "340px", width: "100%", boxShadow: "0 4px 24px rgba(14,165,233,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", background: "rgba(14,165,233,0.12)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
                  <Users size={18} />
                </div>
                <div>
                  <p style={{ fontSize: "10px", color: "#0369a1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Periode Kabinet</p>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#0c4a6e" }}>Pilih Tahun Laporan</p>
                </div>
              </div>
              <select
                value={selectedKabinetId}
                onChange={(e) => setSelectedKabinetId(e.target.value)}
                style={{ width: "100%", background: "#f0f9ff", color: "#0c4a6e", fontWeight: 700, fontSize: "14px", borderRadius: "12px", padding: "10px 14px", border: "1px solid #bae6fd", outline: "none", cursor: "pointer", appearance: "none" }}
              >
                {kabinets.map((k) => (
                  <option key={k.id} value={k.id} style={{ background: "#fff", color: "#0c4a6e" }}>
                    {k.name} {k.period} {k.is_active ? "✓ Aktif" : "(Arsip)"}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: "16px", padding: "12px", background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: "12px" }}>
                <p style={{ fontSize: "11px", color: "#065f46", fontWeight: 700, lineHeight: 1.5 }}>
                  ✦ Data ini dikelola oleh Bendahara SKI dan dapat diakses publik sebagai wujud transparansi organisasi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div style={{ lineHeight: 0, marginTop: "-2px" }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Ringkasan Cards */}
            {(() => {
              const saldoInfaq = transaksi.filter(t => t.kategori === 'Donasi').reduce((s, t) => s + (t.type === 'IN' ? t.amount : -t.amount), 0);
              const totalInfaqMasuk = transaksi.filter(t => t.kategori === 'Donasi' && t.type === 'IN').reduce((s, t) => s + t.amount, 0);
              const totalInfaqKeluar = transaksi.filter(t => t.kategori === 'Donasi' && t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <ArrowDownRight size={20} />
                      </div>
                      <span className="text-sm font-bold text-slate-500">Total Infaq Masuk</span>
                    </div>
                    <p className="text-2xl font-black text-green-600">+ {formatRupiah(totalInfaqMasuk)}</p>
                    <p className="text-xs text-slate-400 mt-1">{transaksi.filter(t => t.kategori === 'Donasi' && t.type === 'IN').length} transaksi</p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                        <ArrowUpRight size={20} />
                      </div>
                      <span className="text-sm font-bold text-slate-500">Total Pengeluaran Infaq</span>
                    </div>
                    <p className="text-2xl font-black text-red-600">- {formatRupiah(totalInfaqKeluar)}</p>
                    <p className="text-xs text-slate-400 mt-1">{transaksi.filter(t => t.kategori === 'Donasi' && t.type === 'OUT').length} transaksi</p>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-6 shadow-sm text-white relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-4 translate-y-4">
                      <Wallet size={140} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center">
                          <TrendingUp size={20} />
                        </div>
                        <span className="text-sm font-bold text-sky-200">Saldo Infaq / Donasi</span>
                      </div>
                      <p className={`text-2xl font-black ${saldoInfaq >= 0 ? "text-white" : "text-red-400"}`}>
                        {saldoInfaq < 0 ? "-" : ""}{formatRupiah(Math.abs(saldoInfaq))}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Periode: {selectedKabinet?.period}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Buku Kas - Full Width */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="font-black text-slate-900">Buku Kas (Histori Transaksi)</h2>
                {/* Filter bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter size={14} className="text-slate-400 flex-shrink-0" />
                  {(["ALL", "IN", "OUT"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${filterType === f ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                    >
                      {f === "ALL" ? "Semua" : f === "IN" ? "Pemasukan" : "Pengeluaran"}
                    </button>
                  ))}
                  <select
                    value={filterKategori}
                    onChange={(e) => setFilterKategori(e.target.value)}
                    className="text-xs font-bold bg-slate-100 text-slate-600 border-none rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {allKategori.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredTransaksi.length === 0 ? (
                <p className="text-center font-bold text-slate-400 py-16">Tidak ada transaksi.</p>
              ) : (
                <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                  {filteredTransaksi.map((trx) => (
                    <div
                      key={trx.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-3 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center border ${trx.type === "IN"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-red-50 text-red-500 border-red-100"
                            }`}
                        >
                          {trx.type === "IN" ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5 overflow-hidden">
                            <h5 className="font-black text-slate-900 text-sm truncate flex-shrink min-w-0">
                              {trx.description}
                            </h5>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 ${KATEGORI_COLORS[trx.kategori] || "bg-slate-100 text-slate-600"
                                }`}
                            >
                              {trx.kategori}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium">
                            {new Date(trx.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                            {trx.pengurus?.full_name && (
                              <> &bull; <span className="text-slate-600 font-bold">{trx.pengurus.full_name}</span></>
                            )}
                            {trx.divisions?.name && (
                              <span className="ml-1.5 text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md">
                                {trx.divisions.name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-black text-base whitespace-nowrap flex-shrink-0 ${trx.type === "IN" ? "text-green-600" : "text-red-500"
                          }`}
                      >
                        {trx.type === "IN" ? "+" : "-"} {formatRupiah(trx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Catatan Transparansi */}
            <div className="bg-sky-50 border border-sky-100 rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1">Komitmen Transparansi SKI</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Data keuangan ini dikelola oleh <strong>Bendahara SKI</strong> dan dapat diakses oleh siapa pun sebagai wujud komitmen kami terhadap transparansi organisasi.
                    Setiap divisi mendapatkan jatah anggaran dari kas organisasi dan penggunaannya tercatat secara real-time.
                    Jika ada pertanyaan, silakan hubungi kami melalui halaman profil.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}