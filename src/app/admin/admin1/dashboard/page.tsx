"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Home,
    Users,
    Calendar,
    Image,
    TrendingUp,
    Eye,
    Plus,
    ArrowRight,
    Clock,
    CheckCircle,
} from "lucide-react";

interface Stats {
    totalEvents: number;
    totalGalleries: number;
    totalViews: number;
    upcomingEvents: number;
}

interface RecentActivity {
    id: string;
    type: "event" | "gallery";
    title: string;
    date: string;
    status?: string;
}

export default function Admin1Dashboard() {
    const role = "admin1";
    const [stats, setStats] = useState<Stats>({
        totalEvents: 0,
        totalGalleries: 0,
        totalViews: 0,
        upcomingEvents: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

    useEffect(() => {
        fetchStats();
        fetchRecentActivities();
    }, []);

    const fetchStats = async () => {
        try {
            const [eventsCount, galleriesCount, upcomingCount] = await Promise.all([
                supabase.from("events").select("id", { count: "exact", head: true }),
                supabase.from("galleries").select("id", { count: "exact", head: true }),
                supabase
                    .from("events")
                    .select("id", { count: "exact", head: true })
                    .eq("status", "upcoming"),
            ]);

            setStats({
                totalEvents: eventsCount.count || 0,
                totalGalleries: galleriesCount.count || 0,
                totalViews: 0,
                upcomingEvents: upcomingCount.count || 0,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentActivities = async () => {
        try {
            const [eventsRes, galleriesRes] = await Promise.all([
                supabase
                    .from("events")
                    .select("id, title, status, created_at")
                    .order("created_at", { ascending: false })
                    .limit(3),
                supabase
                    .from("galleries")
                    .select("id, title, created_at")
                    .order("created_at", { ascending: false })
                    .limit(3),
            ]);

            const activities: RecentActivity[] = [];

            if (eventsRes.data) {
                eventsRes.data.forEach((event) => {
                    activities.push({
                        id: event.id,
                        type: "event",
                        title: event.title,
                        date: new Date(event.created_at!).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        }),
                        status: event.status,
                    });
                });
            }

            if (galleriesRes.data) {
                galleriesRes.data.forEach((gallery) => {
                    activities.push({
                        id: gallery.id,
                        type: "gallery",
                        title: gallery.title,
                        date: new Date(gallery.created_at!).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        }),
                    });
                });
            }

            activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setRecentActivities(activities.slice(0, 5));
        } catch (error) {
            console.error("Error fetching recent activities:", error);
        }
    };

    const statCards = [
        {
            title: "Total Acara",
            value: stats.totalEvents,
            icon: <Calendar size={24} />,
            color: "from-blue-500 to-blue-600",
            lightColor: "bg-blue-50",
            textColor: "text-blue-600",
            href: "/admin/admin1/acara",
        },
        {
            title: "Dokumentasi",
            value: stats.totalGalleries,
            icon: <Image size={24} />,
            color: "from-emerald-500 to-emerald-600",
            lightColor: "bg-emerald-50",
            textColor: "text-emerald-600",
            href: "/admin/admin1/dokumentasi",
        },
        {
            title: "Acara Mendatang",
            value: stats.upcomingEvents,
            icon: <TrendingUp size={24} />,
            color: "from-orange-500 to-orange-600",
            lightColor: "bg-orange-50",
            textColor: "text-orange-600",
            href: "/admin/admin1/acara",
        },
        {
            title: "Total Views",
            value: stats.totalViews,
            icon: <Eye size={24} />,
            color: "from-purple-500 to-purple-600",
            lightColor: "bg-purple-50",
            textColor: "text-purple-600",
            href: "#",
        },
    ];

    const quickActions = [
        {
            label: "Tambah Acara",
            icon: <Plus size={20} />,
            href: "/admin/admin1/acara/new",
            description: "Buat acara baru",
            color: "blue",
        },
        {
            label: "Tambah Dokumentasi",
            icon: <Plus size={20} />,
            href: "/admin/admin1/dokumentasi/new",
            description: "Upload dokumentasi",
            color: "emerald",
        },
        {
            label: "Kelola Beranda",
            icon: <Home size={20} />,
            href: "/admin/admin1/beranda",
            description: "Atur tampilan beranda",
            color: "purple",
        },
        {
            label: "Kelola Profil",
            icon: <Users size={20} />,
            href: "/admin/admin1/profil",
            description: "Kelola data profil",
            color: "orange",
        },
    ];

    const colorVariants: Record<string, { bg: string; border: string; text: string; hover: string }> = {
        blue: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-600",
            hover: "hover:bg-blue-100 hover:border-blue-300",
        },
        emerald: {
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            text: "text-emerald-600",
            hover: "hover:bg-emerald-100 hover:border-emerald-300",
        },
        purple: {
            bg: "bg-purple-50",
            border: "border-purple-200",
            text: "text-purple-600",
            hover: "hover:bg-purple-100 hover:border-purple-300",
        },
        orange: {
            bg: "bg-orange-50",
            border: "border-orange-200",
            text: "text-orange-600",
            hover: "hover:bg-orange-100 hover:border-orange-300",
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <AdminSidebar role={role} />

            <main className="lg:ml-64 p-4 md:p-5 lg:p-6 pt-16 lg:pt-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white">
                            <LayoutDashboard size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-sm text-gray-500">Sentral Kerohanian Islam</p>
                        </div>
                    </div>
                    <p className="text-gray-600 mt-4 max-w-2xl">
                        Kelola konten website dengan mudah. Pantau aktivitas dan kelola semua aspek website SKI dari sini.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group"
                            onClick={() => (window.location.href = card.href)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}
                                >
                                    {card.icon}
                                </div>
                                <ArrowRight
                                    size={18}
                                    className="text-gray-300 group-hover:text-sky-500 transition-colors opacity-0 group-hover:opacity-100"
                                />
                            </div>
                            <div className="mt-2">
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                                    {loading ? (
                                        <span className="inline-block w-12 h-10 bg-gray-200 animate-pulse rounded-lg" />
                                    ) : (
                                        card.value
                                    )}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full" />
                                    Aksi Cepat
                                </h2>
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                    4 Menu
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => {
                                    const variant = colorVariants[action.color];
                                    return (
                                        <motion.a
                                            key={index}
                                            href={action.href}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 + index * 0.05 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex items-center gap-4 p-4 rounded-xl border ${variant.border} ${variant.bg} ${variant.hover} transition-all duration-200 group`}
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-xl ${variant.bg} ${variant.text} flex items-center justify-center group-hover:scale-110 transition-transform`}
                                            >
                                                {action.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold ${variant.text}`}>{action.label}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                                            </div>
                                            <ArrowRight
                                                size={16}
                                                className={`${variant.text} opacity-0 group-hover:opacity-100 transition-opacity`}
                                            />
                                        </motion.a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full" />
                                    Aktivitas
                                </h2>
                                <Clock size={18} className="text-gray-400" />
                            </div>

                            {recentActivities.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivities.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + index * 0.05 }}
                                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${activity.type === "event"
                                                    ? "bg-blue-100 text-blue-600"
                                                    : "bg-emerald-100 text-emerald-600"
                                                    }`}
                                            >
                                                {activity.type === "event" ? (
                                                    <Calendar size={18} />
                                                ) : (
                                                    <Image size={18} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate text-sm">
                                                    {activity.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">{activity.date}</span>
                                                    {activity.status && (
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full ${activity.status === "upcoming"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-600"
                                                                }`}
                                                        >
                                                            {activity.status === "upcoming" ? "Akan Datang" : "Selesai"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                        <LayoutDashboard size={28} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-sm">Belum ada aktivitas</p>
                                    <p className="text-gray-400 text-xs mt-1">Aktivitas akan muncul di sini</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/4" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-3">Selamat Datang di Dashboard SKI</h2>
                        <p className="text-white/80 max-w-2xl mb-6">
                            Gunakan dashboard ini untuk mengelola semua konten website Sentral Kerohanian Islam.
                            Anda dapat menambah, mengedit, dan menghapus acara, dokumentasi, serta mengelola profil organisasi.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="/admin/admin1/acara/new"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-sky-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                            >
                                <Plus size={18} />
                                Buat Acara Baru
                            </a>
                            <a
                                href="/admin/admin1/beranda"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
                            >
                                <Home size={18} />
                                Atur Beranda
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}