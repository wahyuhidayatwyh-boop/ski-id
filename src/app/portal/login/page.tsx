"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogIn, User, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PortalLoginPage() {
    const router = useRouter();
    const [nim, setNim] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Check credentials against pengurus table
            const { data, error: fetchError } = await supabase
                .from("pengurus")
                .select("id, full_name, jabatan, status")
                .eq("nim", nim)
                .eq("password", password)
                .single();

            if (fetchError || !data) {
                throw new Error("NIM atau Password salah");
            }

            if (data.status !== "active") {
                throw new Error("Akun pengurus Anda tidak aktif");
            }

            // Save session to localStorage
            localStorage.setItem("portal_session", JSON.stringify({
                id: data.id,
                full_name: data.full_name,
                jabatan: data.jabatan
            }));

            // Redirect to dashboard
            router.push("/portal");
            
        } catch (err: any) {
            setError(err.message || "Gagal login. Pastikan NIM dan Password benar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 px-4 sm:px-0">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-sky-600 transition-colors text-sm font-medium mb-6">
                    <ArrowLeft size={16} />
                    Kembali ke Beranda
                </Link>
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="text-white" size={32} />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Portal Anggota SKI
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Masuk untuk mengelola program kerja dan melihat agenda kegiatan
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100 mx-4 sm:mx-0"
                >
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="nim" className="block text-sm font-semibold text-gray-700">
                                NIM
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="nim"
                                    name="nim"
                                    type="text"
                                    required
                                    value={nim}
                                    onChange={(e) => setNim(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm"
                                    placeholder="Masukkan NIM Anda"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                Password
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? "Memproses..." : (
                                    <>
                                        <LogIn size={18} />
                                        Masuk Portal
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
