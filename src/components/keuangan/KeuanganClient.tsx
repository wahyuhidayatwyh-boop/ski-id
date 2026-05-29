"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, PieChart, TrendingUp, Filter } from "lucide-react";

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

  const totalMasuk = transaksi
    .filter((t) => t.type === "IN")
    .reduce((s, t) => s + t.amount, 0);
  const totalKeluar = transaksi
    .filter((t) => t.type === "OUT")
    .reduce((s, t) => s + t.amount, 0);
  const saldo = totalMasuk - totalKeluar;

  const filteredTransaksi = transaksi.filter((t) => {
    if (filterType !== "ALL" && t.type !== filterType) return false;
    if (filterKategori !== "ALL" && t.kategori !== filterKategori) return false;
    return true;
  });

  const allKategori = Array.from(new Set(transaksi.map((t) => t.kategori)));

  const selectedKabinet = kabinets.find((k) => k.id === selectedKabinetId);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-sky-600">Transparansi Keuangan</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                Laporan Keuangan SKI
              </h1>
              <p className="mt-2 text-slate-500 font-medium max-w-xl">
                Kami berkomitmen pada transparansi penuh. Seluruh pemasukan, pengeluaran, dan alokasi dana per divisi dapat dipantau di sini secara publik.
              </p>
            </div>
            {/* Kabinet Selector */}
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-bold text-slate-500 mb-1">Pilih Periode Kabinet</label>
              <select
                value={selectedKabinetId}
                onChange={(e) => setSelectedKabinetId(e.target.value)}
                className="w-full sm:w-64 bg-slate-900 text-white font-bold text-sm rounded-xl px-4 py-2.5 border-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {kabinets.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} {k.period} {k.is_active ? "(Aktif)" : "(Arsip)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              const saldoKas = transaksi.filter(t => t.kategori === 'Kas Anggota').reduce((s, t) => s + (t.type === 'IN' ? t.amount : -t.amount), 0);
              const saldoTotal = transaksi.reduce((s, t) => s + (t.type === 'IN' ? t.amount : -t.amount), 0);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <ArrowDownRight size={20} />
                      </div>
                      <span className="text-sm font-bold text-slate-500">Saldo Infaq / Donasi</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{formatRupiah(saldoInfaq)}</p>
                    <p className="text-xs text-slate-400 mt-1">{transaksi.filter(t => t.kategori === 'Donasi').length} transaksi</p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Wallet size={20} />
                      </div>
                      <span className="text-sm font-bold text-slate-500">Saldo Uang Kas</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{formatRupiah(saldoKas)}</p>
                    <p className="text-xs text-slate-400 mt-1">{transaksi.filter(t => t.kategori === 'Kas Anggota').length} transaksi</p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                        <ArrowUpRight size={20} />
                      </div>
                      <span className="text-sm font-bold text-slate-500">Total Pengeluaran</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{formatRupiah(totalKeluar)}</p>
                    <p className="text-xs text-slate-400 mt-1">{transaksi.filter(t => t.type === 'OUT').length} transaksi keluar</p>
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
                        <span className="text-sm font-bold text-sky-200">Saldo Total</span>
                      </div>
                      <p className={`text-2xl font-black ${saldoTotal >= 0 ? "text-white" : "text-red-400"}`}>
                        {saldoTotal < 0 ? "-" : ""}{formatRupiah(saldoTotal)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Periode: {selectedKabinet?.period}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Saldo Divisi + Histori */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Saldo Per Divisi */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h2 className="font-black text-slate-900 flex items-center gap-2 mb-1">
                  <PieChart size={18} className="text-sky-500" /> Kas Per Divisi
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Saldo adalah akumulasi semua transaksi yang dikaitkan ke divisi tersebut.
                </p>
                {saldoDivisi.length === 0 ? (
                  <p className="text-center text-slate-400 font-bold py-8 text-sm">Belum ada data divisi</p>
                ) : (
                  <div className="space-y-2">
                    {saldoDivisi.map((sd) => {
                      const pct =
                        sd.total_pemasukan > 0
                          ? Math.min((sd.saldo_akhir / sd.total_pemasukan) * 100, 100)
                          : 0;
                      const isNeg = sd.saldo_akhir < 0;
                      return (
                        <div
                          key={sd.division_id}
                          className="p-3 border border-slate-100 bg-slate-50 rounded-xl hover:border-sky-200 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <h5 className="font-bold text-slate-800 text-sm truncate pr-2">{sd.division_name}</h5>
                            <p className={`font-black text-sm whitespace-nowrap ${isNeg ? "text-red-600" : "text-green-600"}`}>
                              {isNeg ? "-" : ""}{formatRupiah(sd.saldo_akhir)}
                            </p>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${isNeg ? "bg-red-400" : "bg-sky-500"}`}
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Masuk: {formatRupiah(sd.total_pemasukan)} &nbsp;|&nbsp; Keluar: {formatRupiah(sd.total_pengeluaran)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Buku Kas */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
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
                            className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center border ${
                              trx.type === "IN"
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
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 ${
                                  KATEGORI_COLORS[trx.kategori] || "bg-slate-100 text-slate-600"
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
                          className={`font-black text-base whitespace-nowrap flex-shrink-0 ${
                            trx.type === "IN" ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {trx.type === "IN" ? "+" : "-"} {formatRupiah(trx.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
