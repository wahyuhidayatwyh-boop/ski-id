"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogIn, User, Lock, AlertCircle, ArrowLeft, Mail, UserPlus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function PortalLoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            if (isLogin) {
                // LOGIN FLOW
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError) throw authError;

                // Cek sinkronisasi pengurus
                const { data: pengurusData, error: pengurusError } = await supabase
                    .from("pengurus")
                    .select("*")
                    .eq("user_id", data.user?.id)
                    .single();

                if (pengurusError || !pengurusData) {
                    // Kalau belum sync, coba cari berdasarkan full_name
                    const { data: matchData, error: matchError } = await supabase
                        .from("pengurus")
                        .select("*")
                        .ilike("full_name", data.user?.user_metadata?.full_name || "")
                        .is("user_id", null)
                        .single();
                        
                    if (matchData) {
                        // Sinkronkan akun dengan data pengurus
                        await supabase
                            .from("pengurus")
                            .update({ user_id: data.user?.id, updated_at: new Date().toISOString() })
                            .eq("id", matchData.id);
                    } else {
                        // Tidak cocok, anggap member biasa (bisa tampilkan alert tapi tetap masuk)
                        console.log("Login sebagai anggota umum");
                    }
                }
                
                router.push("/portal");

            } else {
                // REGISTER FLOW
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                });

                if (signUpError) throw signUpError;

                if (data.user) {
                    // Sinkronisasi otomatis
                    const { data: matchData } = await supabase
                        .from("pengurus")
                        .select("*")
                        .ilike("full_name", fullName)
                        .is("user_id", null)
                        .single();

                    if (matchData) {
                        await supabase
                            .from("pengurus")
                            .update({ user_id: data.user.id })
                            .eq("id", matchData.id);
                        setSuccess(`Akun berhasil dibuat dan sinkron dengan Jabatan: ${matchData.jabatan}. Silakan masuk.`);
                    } else {
                        setSuccess("Akun berhasil dibuat sebagai Anggota Umum. Silakan masuk.");
                    }
                    setIsLogin(true); // Pindah ke tab login
                    setPassword(""); // Reset password field for login
                }
            }
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-100 to-transparent opacity-50 z-0 pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob z-0 pointer-events-none" />
            <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 z-0 pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 px-4 sm:px-0 relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors text-sm font-bold mb-6">
                    <ArrowLeft size={16} /> Kembali ke Beranda
                </Link>
                <div className="flex justify-center">
                    <img src="/Logo SKI TEL-U P.png" alt="Logo SKI" className="w-20 h-20 object-contain drop-shadow-xl" />
                </div>
                <h2 className="mt-6 text-center text-4xl font-black text-slate-900 tracking-tight">
                    Dakwah<span className="text-sky-500">-OS</span>
                </h2>
                <p className="mt-2 text-center text-sm font-medium text-slate-600">
                    Sistem Manajemen Internal & Portal Pengurus SKI
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-8 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-[2rem] sm:px-10 border border-slate-100 mx-4 sm:mx-0">
                    
                    {/* Tab Switcher */}
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                        <button 
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Masuk
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Daftar Akun Baru
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                                <AlertCircle size={18} /> {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                                <ShieldCheck size={18} /> {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="space-y-5" onSubmit={handleAuth}>
                        {!isLogin && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap (Sesuai KTP/SK)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required={!isLogin}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 sm:text-sm font-medium transition-all"
                                        placeholder="Contoh: Wahyu Hidayat"
                                    />
                                </div>
                                <p className="mt-1.5 text-xs text-slate-500 font-medium">
                                    *Pastikan nama sesuai agar otomatis tersinkronisasi dengan database kepengurusan.
                                </p>
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Aktif</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 sm:text-sm font-medium transition-all"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 sm:text-sm font-medium transition-all"
                                    placeholder="Minimal 6 karakter"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-sky-500/30 text-sm font-black text-white bg-sky-500 hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                        >
                            {loading ? "Memproses..." : isLogin ? (
                                <>
                                    <LogIn size={18} /> Masuk ke Portal
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} /> Daftar Sekarang
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
