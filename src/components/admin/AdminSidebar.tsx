"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Home,
    Users,
    Calendar,
    Image,
    Package,
    LogOut,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    FileText,
    Menu,
    X,
    Activity
} from "lucide-react";

interface AdminSidebarProps {
    role: "admin1" | "admin2";
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
}

export default function AdminSidebar({ role }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const admin1NavItems: NavItem[] = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, href: `/admin/admin1/dashboard` },
        { id: "dakwah-os", label: "Dakwah-OS", icon: <Activity size={20} />, href: `/admin/admin1/dakwah-os` },
        { id: "beranda", label: "Beranda", icon: <Home size={20} />, href: `/admin/admin1/beranda` },
        { id: "profil", label: "Profil", icon: <Users size={20} />, href: `/admin/admin1/profil` },
        { id: "acara", label: "Acara", icon: <Calendar size={20} />, href: `/admin/admin1/acara` },
        { id: "dokumentasi", label: "Dokumentasi", icon: <Image size={20} />, href: `/admin/admin1/dokumentasi` },
    ];

    const admin2NavItems: NavItem[] = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, href: `/admin/admin2/dashboard` },
        { id: "katalog", label: "Katalog", icon: <Package size={20} />, href: `/admin/admin2/katalog` },
    ];

    const navItems = role === "admin1" ? admin1NavItems : admin2NavItems;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    const currentPath = pathname;

    const handleNavClick = (href: string) => {
        router.push(href);
        setMobileOpen(false);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-md border border-gray-200"
                aria-label="Buka menu"
            >
                <Menu size={20} className="text-gray-600" />
            </button>

            <aside
                className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30
                    ${collapsed ? "w-20" : "w-64"}
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        {!collapsed && (
                            <>
                                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <FileText className="text-white" size={18} />
                                </div>
                                <span className="font-bold text-gray-800">Admin SKI</span>
                            </>
                        )}
                        {collapsed && (
                            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <FileText className="text-white" size={18} />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {/* Mobile close button */}
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Tutup menu"
                        >
                            <X size={18} className="text-gray-600" />
                        </button>
                        {/* Desktop collapse button */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {collapsed ? (
                                <ChevronRight size={18} className="text-gray-600" />
                            ) : (
                                <ChevronLeft size={18} className="text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.href ||
                            (item.id !== "dashboard" && currentPath.startsWith(item.href));

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.href)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                                    } ${collapsed ? "justify-center px-1" : ""}`}
                                title={collapsed ? item.label : undefined}
                            >
                                {item.icon}
                                {!collapsed && <span className="font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 ${collapsed ? "justify-center px-1" : ""
                            }`}
                        title={collapsed ? "Logout" : undefined}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}