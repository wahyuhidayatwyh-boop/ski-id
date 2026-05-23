"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Save, Image as ImageIcon, FileText, Users, HelpCircle, Loader2 } from "lucide-react";

interface HeroSection {
    id?: string;
    title: string;
    subtitle: string;
    backgroundImage: string;
}

interface AboutSection {
    id?: string;
    title: string;
    content: string;
    imageUrl: string;
}

interface VisionSection {
    id?: string;
    title: string;
    content: string;
}

interface TeamSection {
    id?: string;
    title: string;
    description: string;
}

interface FaqSection {
    id?: string;
    title: string;
    faqs: Array<{ question: string; answer: string }>;
}

export default function Admin1Beranda() {
    const role = "admin1";
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Hero Section State
    const [hero, setHero] = useState<HeroSection>({
        title: "Sentral Kerohanian Islam",
        subtitle: "Membangun Generasi Islami yang Berkarakter dan Berprestasi",
        backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop",
    });

    // About Section State
    const [about, setAbout] = useState<AboutSection>({
        title: "Tentang SKI",
        content: "Sentral Kerohanian Islam (SKI) adalah organisasi kerohanian Islam di lingkungan Universitas Telkom Purwokerto yang berfokus pada pembinaan karakter islami mahasiswa.",
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
    });

    // Vision Section State
    const [vision, setVision] = useState<VisionSection>({
        title: "Visi & Misi",
        content: "Menjadikan SKI sebagai wadah utama pembinaan karakter Islami mahasiswa yang istiqomah, adaptif, kolaboratif, serta berdaya guna tinggi.",
    });

    // Team Section State
    const [team, setTeam] = useState<TeamSection>({
        title: "Pengurus SKI",
        description: "Dipimpin oleh para pengurus yang berkomitmen tinggi untuk memajukan organisasi dan memberikan manfaat bagi seluruh anggota.",
    });

    // FAQ Section State
    const [faq, setFaq] = useState<FaqSection>({
        title: "Pertanyaan Umum",
        faqs: [
            { question: "Apa itu SKI?", answer: "SKI adalah Sentral Kerohanian Islam, organisasi yang fokus pada pembinaan keislaman mahasiswa." },
            { question: "Bagaimana cara bergabung?", answer: "Anda bisa mendaftar melalui open recruitment yang diadakan setiap awal tahun akademik." },
        ],
    });

    useEffect(() => {
        fetchBerandaData();
    }, []);

    const fetchBerandaData = async () => {
        try {
            // Fetch hero data
            const { data: heroData } = await supabase
                .from("hero_section")
                .select("*")
                .single();
            if (heroData) setHero(heroData);

            // Fetch about data
            const { data: aboutData } = await supabase
                .from("about_section")
                .select("*")
                .single();
            if (aboutData) setAbout(aboutData);

            // Fetch vision data
            const { data: visionData } = await supabase
                .from("vision_section")
                .select("*")
                .single();
            if (visionData) setVision(visionData);

            // Fetch team data
            const { data: teamData } = await supabase
                .from("team_section")
                .select("*")
                .single();
            if (teamData) setTeam(teamData);

            // Fetch FAQ data
            const { data: faqData } = await supabase
                .from("faq_section")
                .select("*")
                .single();
            if (faqData) setFaq(faqData);
        } catch (error) {
            console.error("Error fetching beranda data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Upsert hero
            await supabase.from("hero_section").upsert({ id: hero.id || "1", ...hero });

            // Upsert about
            await supabase.from("about_section").upsert({ id: about.id || "1", ...about });

            // Upsert vision
            await supabase.from("vision_section").upsert({ id: vision.id || "1", ...vision });

            // Upsert team
            await supabase.from("team_section").upsert({ id: team.id || "1", ...team });

            // Upsert FAQ
            await supabase.from("faq_section").upsert({ id: faq.id || "1", ...faq });

            alert("Berhasil menyimpan perubahan!");
        } catch (error) {
            console.error("Error saving:", error);
            alert("Gagal menyimpan perubahan.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                    <p className="text-gray-500">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar role={role} />

            <main className="lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Beranda</h1>
                        <p className="text-gray-500">Atur konten halaman beranda website</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Hero Section */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                                <ImageIcon className="text-sky-600" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Hero Section</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Utama</label>
                                <input
                                    type="text"
                                    value={hero.title}
                                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subjudul</label>
                                <input
                                    type="text"
                                    value={hero.subtitle}
                                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Gambar Background</label>
                                <input
                                    type="text"
                                    value={hero.backgroundImage}
                                    onChange={(e) => setHero({ ...hero, backgroundImage: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                                {hero.backgroundImage && (
                                    <img
                                        src={hero.backgroundImage}
                                        alt="Preview"
                                        className="mt-4 w-full h-48 object-cover rounded-xl"
                                    />
                                )}
                            </div>
                        </div>
                    </section>

                    {/* About Section */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <FileText className="text-green-600" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Tentang SKI</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Judul</label>
                                <input
                                    type="text"
                                    value={about.title}
                                    onChange={(e) => setAbout({ ...about, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Konten</label>
                                <textarea
                                    value={about.content}
                                    onChange={(e) => setAbout({ ...about, content: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Gambar</label>
                                <input
                                    type="text"
                                    value={about.imageUrl}
                                    onChange={(e) => setAbout({ ...about, imageUrl: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Vision Section */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <FileText className="text-purple-600" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Visi & Misi</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Konten Visi Misi</label>
                            <textarea
                                value={vision.content}
                                onChange={(e) => setVision({ ...vision, content: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </section>

                    {/* Team Section */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Users className="text-orange-600" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Tim Pengurus</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Judul</label>
                                <input
                                    type="text"
                                    value={team.title}
                                    onChange={(e) => setTeam({ ...team, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                                <textarea
                                    value={team.description}
                                    onChange={(e) => setTeam({ ...team, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <HelpCircle className="text-red-600" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">FAQ</h2>
                        </div>
                        <div className="space-y-4">
                            {faq.faqs.map((item, index) => (
                                <div key={index} className="border border-gray-200 rounded-xl p-4">
                                    <input
                                        type="text"
                                        value={item.question}
                                        onChange={(e) => {
                                            const newFaqs = [...faq.faqs];
                                            newFaqs[index].question = e.target.value;
                                            setFaq({ ...faq, faqs: newFaqs });
                                        }}
                                        placeholder="Pertanyaan"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 font-semibold"
                                    />
                                    <textarea
                                        value={item.answer}
                                        onChange={(e) => {
                                            const newFaqs = [...faq.faqs];
                                            newFaqs[index].answer = e.target.value;
                                            setFaq({ ...faq, faqs: newFaqs });
                                        }}
                                        placeholder="Jawaban"
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={() => setFaq({ ...faq, faqs: [...faq.faqs, { question: "", answer: "" }] })}
                                className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-sky-500 hover:text-sky-500 transition-colors w-full"
                            >
                                + Tambah FAQ
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}