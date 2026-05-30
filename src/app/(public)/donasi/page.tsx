"use client";

import { useState, useRef } from "react";
import { Copy, Check, MessageCircle, Heart, Calendar, Sparkles, Upload, X, Loader2, Wallet, ArrowUpRight } from "lucide-react";
import Image from "next/image";

export default function DonasiPage() {
    const [copiedBank, setCopiedBank] = useState(false);
    const [copiedEwallet, setCopiedEwallet] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        nama_donatur: "",
        email_donatur: "",
        no_hp_donatur: "",
        jenis_donasi: "Infaq",
        nominal: "",
        pesan: "",
        metode_pembayaran: "transfer_bank",
        is_anonymous: false,
    });

    const copyToClipboard = (text: string, type: "bank" | "ewallet") => {
        navigator.clipboard.writeText(text);
        if (type === "bank") {
            setCopiedBank(true);
            setTimeout(() => setCopiedBank(false), 2000);
        } else {
            setCopiedEwallet(true);
            setTimeout(() => setCopiedEwallet(false), 2000);
        }
    };

    const whatsappMessage = encodeURIComponent(
        `Assalamu'alaikum Wr. Wb.\n\nSaya telah mengirimkan infaq/sedekah melalui:\n- Bank/E-Wallet: [Pilih salah satu]\n- Jumlah: [Sebutkan jumlah]\n- Atas nama: [Nama Anda]\n\nMohon konfirmasi dan terima kasih atas amanahnya.\n\nWassalamu'alaikum Wr. Wb.`
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Ukuran file maksimal 5MB");
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatNominal = (value: string) => {
        const cleaned = value.replace(/[^0-9]/g, "");
        if (!cleaned) return "";
        return parseInt(cleaned).toLocaleString("id-ID");
    };

    const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatNominal(e.target.value);
        setFormData(prev => ({ ...prev, nominal: formatted }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const nominalValue = parseInt(formData.nominal.replace(/[^0-9]/g, ""));
            if (!nominalValue || nominalValue <= 0) {
                setError("Nominal donasi harus lebih dari 0");
                setSubmitting(false);
                return;
            }

            const submitData = new FormData();
            submitData.append("nama_donatur", formData.is_anonymous ? "Hamba Allah" : formData.nama_donatur);
            submitData.append("email_donatur", formData.is_anonymous ? "" : formData.email_donatur);
            submitData.append("no_hp_donatur", formData.is_anonymous ? "" : formData.no_hp_donatur);
            submitData.append("jenis_donasi", formData.jenis_donasi);
            submitData.append("nominal", nominalValue.toString());
            submitData.append("pesan", formData.pesan);
            submitData.append("metode_pembayaran", formData.metode_pembayaran);
            submitData.append("is_anonymous", formData.is_anonymous.toString());

            if (selectedFile) {
                submitData.append("bukti_transfer", selectedFile);
            }

            const response = await fetch("/api/donasi/submit", {
                method: "POST",
                body: submitData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Gagal memproses donasi");
            }

            setSuccess(true);
            setFormData({
                nama_donatur: "",
                email_donatur: "",
                no_hp_donatur: "",
                jenis_donasi: "Infaq",
                nominal: "",
                pesan: "",
                metode_pembayaran: "transfer_bank",
                is_anonymous: false,
            });
            setSelectedFile(null);
            setPreviewImage(null);

            // Scroll to top to see success message
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses donasi");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
            {/* Hero Section with Image */}
            <section className="relative h-[350px] sm:h-[400px] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url(/sedekah.png)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-900/90 via-sky-900/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Sparkles className="text-yellow-300" size={20} />
                        <span className="text-yellow-300 font-bold text-sm sm:text-lg tracking-wider">
                            ✨ Jum'at Berkah, Ayo Bersedekah! ✨
                        </span>
                        <Sparkles className="text-yellow-300" size={20} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 drop-shadow-lg">
                        Mari Berbagi Kebaikan
                    </h1>
                    <p className="text-sm sm:text-lg text-sky-100 max-w-2xl drop-shadow-md px-2">
                        Assalamu'alaikum Wr. Wb. Sahabat Fillah! Setiap sedekah yang kamu berikan, sekecil apapun, adalah investasi akhirat yang tak ternilai.
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12 space-y-8 sm:space-y-12">
                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                            <Check size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-green-800 text-base sm:text-lg">Jazakallah Khairan!</h3>
                            <p className="text-green-700 text-sm">Donasi Anda telah tercatat. Semoga Allah membalas kebaikan Anda dengan berlipat ganda.</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                            <X size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-red-800 text-base sm:text-lg">Terjadi Kesalahan</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Form Sedekah */}
                <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-sky-200">
                    <h2 className="text-xl sm:text-2xl font-black text-sky-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <Heart className="text-sky-600" size={28} />
                        Form Sedekah / Infaq
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                        {/* Jenis Donasi */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Donasi</label>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                {["Infaq", "Sedekah", "Zakat", "Wakaf"].map((jenis) => (
                                    <button
                                        key={jenis}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, jenis_donasi: jenis }))}
                                        className={`p-2 sm:p-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${formData.jenis_donasi === jenis
                                            ? "bg-sky-500 text-white shadow-lg scale-105"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {jenis}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nominal */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nominal Donasi (Rp)</label>
                            <div className="relative">
                                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm sm:text-base">Rp</span>
                                <input
                                    type="text"
                                    name="nominal"
                                    value={formData.nominal}
                                    onChange={handleNominalChange}
                                    placeholder="0"
                                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-xl sm:text-2xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-200 transition-all"
                                    required
                                />
                            </div>
                            {/* Quick Amount Buttons */}
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3">
                                {[10000, 25000, 50000, 100000, 250000, 500000].map((amount) => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, nominal: amount.toLocaleString("id-ID") }))}
                                        className="py-2 px-1 bg-sky-50 text-sky-700 font-bold text-[10px] sm:text-xs rounded-lg hover:bg-sky-100 transition-colors"
                                    >
                                        {amount >= 1000000 ? `${(amount / 1000000).toFixed(0)}Jt` : amount >= 1000 ? `${(amount / 1000).toFixed(0)}K` : amount}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Metode Pembayaran */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Metode Pembayaran</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <label className={`cursor-pointer p-3 sm:p-4 rounded-xl border-2 transition-all ${formData.metode_pembayaran === "transfer_bank"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-slate-200 hover:border-slate-300"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="metode_pembayaran"
                                        value="transfer_bank"
                                        checked={formData.metode_pembayaran === "transfer_bank"}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Wallet size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm sm:text-base">Transfer Bank</p>
                                            <p className="text-xs text-slate-500">BSI: 7197207544</p>
                                        </div>
                                    </div>
                                </label>
                                <label className={`cursor-pointer p-3 sm:p-4 rounded-xl border-2 transition-all ${formData.metode_pembayaran === "ewallet"
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-slate-200 hover:border-slate-300"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="metode_pembayaran"
                                        value="ewallet"
                                        checked={formData.metode_pembayaran === "ewallet"}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                            <ArrowUpRight size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm sm:text-base">E-Wallet</p>
                                            <p className="text-xs text-slate-500">GoPay/DANA: 087750646966</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Data Donatur */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="nama_donatur"
                                    value={formData.nama_donatur}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan nama Anda"
                                    className="w-full px-3 sm:px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all text-sm sm:text-base"
                                    disabled={formData.is_anonymous}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email_donatur"
                                    value={formData.email_donatur}
                                    onChange={handleInputChange}
                                    placeholder="email@contoh.com"
                                    className="w-full px-3 sm:px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all text-sm sm:text-base"
                                    disabled={formData.is_anonymous}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nomor WhatsApp</label>
                                <input
                                    type="tel"
                                    name="no_hp_donatur"
                                    value={formData.no_hp_donatur}
                                    onChange={handleInputChange}
                                    placeholder="08xxxxxxxxxx"
                                    className="w-full px-3 sm:px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all text-sm sm:text-base"
                                    disabled={formData.is_anonymous}
                                />
                            </div>
                        </div>

                        {/* Anonymous Option */}
                        <div className="flex items-start gap-3 p-3 sm:p-4 bg-amber-50 rounded-xl">
                            <input
                                type="checkbox"
                                name="is_anonymous"
                                checked={formData.is_anonymous}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                                className="w-5 h-5 text-sky-600 rounded focus:ring-sky-500 mt-0.5"
                            />
                            <label className="text-xs sm:text-sm font-medium text-amber-800">
                                <strong>Donasi Anonim</strong> - Nama Anda tidak akan ditampilkan (tertulis "Hamba Allah")
                            </label>
                        </div>

                        {/* Upload Bukti Transfer */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Upload Bukti Transfer (Opsional)</label>
                            {previewImage ? (
                                <div className="relative inline-block">
                                    <Image
                                        src={previewImage}
                                        alt="Preview bukti transfer"
                                        width={200}
                                        height={150}
                                        className="rounded-xl border-2 border-sky-200 max-w-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-all"
                                >
                                    <Upload className="mx-auto mb-3 text-slate-400" size={32} />
                                    <p className="text-slate-600 font-medium">Klik untuk upload bukti transfer</p>
                                    <p className="text-xs text-slate-400 mt-1">Maksimal 5MB (JPG, PNG)</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* Pesan / Doa */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Pesan / Doa (Opsional)</label>
                            <textarea
                                name="pesan"
                                value={formData.pesan}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Tuliskan pesan atau doa Anda..."
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-lg rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Heart size={24} />
                                    Kirim Donasi
                                </>
                            )}
                        </button>
                    </form>
                </section>

                {/* Keutamaan Sedekah Jum'at */}
                <section className="bg-white rounded-3xl p-8 shadow-xl border border-sky-100">
                    <h2 className="text-2xl font-black text-sky-800 mb-6 flex items-center gap-3">
                        <Calendar className="text-sky-600" size={28} />
                        Mengapa Bersedekah di Hari Jum'at?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl">
                                <div className="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    ✓
                                </div>
                                <p className="text-slate-700">
                                    <strong className="text-sky-800">Sayyidul Ayyam</strong> - Hari Jum'at adalah hari yang paling mulia di antara hari-hari lainnya.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl">
                                <div className="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    ✓
                                </div>
                                <p className="text-slate-700">
                                    <strong className="text-sky-800">Pahala Dilipatgandakan</strong> - Pahala beramal di hari Jum'at dilipatgandakan oleh Allah SWT. (QS. Al-Jum'ah: 10)
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl">
                                <div className="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    ✓
                                </div>
                                <p className="text-slate-700">
                                    <strong className="text-sky-800">Seperti Ramadhan</strong> - Sedekah di hari Jum'at seperti sedekah di bulan Ramadhan. (Ibnu Qayyim)
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white p-6 rounded-2xl">
                                <p className="text-center font-bold text-lg mb-4">
                                    اِنَّ الَّذِيْنَ اٰمَنُوْا وَعَمِلُوا الصّٰلِحٰتِ وَاَقَامُوا الصَّلٰوةَ وَاٰتَوُا الزَّكٰوةَ لَهُمْ اَجْرُهُمْ عِنْدَ رَبِّهِمْۚ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُوْنَ
                                </p>
                                <p className="text-center text-sky-100 text-sm">
                                    "Sesungguhnya orang-orang yang beriman, mengerjakan amal saleh, mendirikan shalat dan menunaikan zakat, mereka mendapat pahala di sisi Tuhannya. Tidak ada kekhawatiran terhadap mereka dan tidak (pula) mereka bersedih hati." (QS. Al-Baqarah: 277)
                                </p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                                <p className="text-amber-800 font-bold text-center">
                                    Rasulullah SAW bersabda: <span className="italic">"Sedekah terbaik adalah yang dilakukan pada hari Jum'at."</span> (HR. At-Tirmidzi)
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tips Bersedekah */}
                <section className="bg-white rounded-3xl p-8 shadow-xl border border-sky-100">
                    <h2 className="text-2xl font-black text-sky-800 mb-6 flex items-center gap-3">
                        <Heart className="text-sky-600" size={28} />
                        Tips Bersedekah
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-sky-50 p-6 rounded-2xl text-center">
                            <div className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                1
                            </div>
                            <p className="text-slate-700 font-medium">
                                Sedekahkan apa saja yang kamu mampu, tidak harus banyak.
                            </p>
                        </div>
                        <div className="bg-sky-50 p-6 rounded-2xl text-center">
                            <div className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                2
                            </div>
                            <p className="text-slate-700 font-medium">
                                Niatkan sedekahmu dengan ikhlas hanya untuk Allah SWT.
                            </p>
                        </div>
                        <div className="bg-sky-50 p-6 rounded-2xl text-center">
                            <div className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                3
                            </div>
                            <p className="text-slate-700 font-medium">
                                Bersedekahlah secara diam-diam, tanpa pamer (riya').
                            </p>
                        </div>
                    </div>
                </section>

                {/* Saluran Donasi Manual */}
                <section className="bg-white rounded-3xl p-8 shadow-xl border border-sky-100">
                    <h2 className="text-2xl font-black text-sky-800 mb-6 text-center">
                        Saluran Donasi Manual
                    </h2>
                    <p className="text-center text-slate-600 mb-6">
                        Atau Anda bisa transfer langsung ke rekening berikut, lalu konfirmasi via WhatsApp:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                        {/* Bank Transfer */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 rounded-2xl border-2 border-blue-200">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-blue-900 text-base md:text-lg">Transfer Bank</h3>
                                    <p className="text-blue-700 text-xs md:text-sm">Bank Syariah Indonesia (BSI)</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-3 md:p-4 mb-3 md:mb-4">
                                <p className="text-xs text-slate-500 mb-1">Nomor Rekening</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-lg md:text-2xl font-black text-slate-900 tracking-wider flex-1 truncate">7197207544</p>
                                    <button
                                        onClick={() => copyToClipboard("7197207544", "bank")}
                                        className="flex items-center gap-1 md:gap-2 bg-blue-500 text-white px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-blue-600 transition-colors flex-shrink-0"
                                    >
                                        {copiedBank ? (
                                            <>
                                                <Check size={14} /> OK
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} /> Salin
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs md:text-sm text-slate-600 mt-2 md:mt-3 truncate">
                                    <strong className="text-slate-900">AN:</strong> SKI TEL-U PURWOKERTO
                                </p>
                            </div>
                        </div>

                        {/* E-Wallet */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-6 rounded-2xl border-2 border-purple-200">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                                        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-purple-900 text-base md:text-lg">E-Wallet</h3>
                                    <p className="text-purple-700 text-xs md:text-sm">LinkAja!, GoPay, DANA</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-3 md:p-4 mb-3 md:mb-4">
                                <p className="text-xs text-slate-500 mb-1">Nomor HP / E-Wallet</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-lg md:text-2xl font-black text-slate-900 tracking-wider flex-1 truncate">087750646966</p>
                                    <button
                                        onClick={() => copyToClipboard("087750646966", "ewallet")}
                                        className="flex items-center gap-1 md:gap-2 bg-purple-500 text-white px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm hover:bg-purple-600 transition-colors flex-shrink-0"
                                    >
                                        {copiedEwallet ? (
                                            <>
                                                <Check size={14} /> OK
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} /> Salin
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs md:text-sm text-slate-600 mt-2 md:mt-3 truncate">
                                    <strong className="text-slate-900">AN:</strong> Destina Bekti Setyaningsih
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Konfirmasi WhatsApp */}
                    <div className="mt-8 max-w-2xl mx-auto">
                        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white text-center">
                            <MessageCircle className="mx-auto mb-4" size={32} />
                            <h3 className="font-black text-xl mb-2">Konfirmasi Donasi</h3>
                            <p className="text-green-100 mb-6">
                                Jangan lupa untuk melakukan konfirmasi setelah mengirimkan infaq/sedekah melalui WhatsApp di bawah ini.
                            </p>
                            <a
                                href={`https://wa.me/6287750646966?text=${whatsappMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-white text-green-600 px-8 py-4 rounded-xl font-black text-lg hover:bg-green-50 transition-colors shadow-lg"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Konfirmasi via WhatsApp
                            </a>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center">
                    <p className="text-sky-700 font-bold text-lg mb-4">
                        Mari kita jadikan hari Jum'at ini sebagai momen untuk meningkatkan ketakwaan dan keimanan kita dengan bersedekah.
                    </p>
                    <p className="text-slate-600 font-medium">
                        Yuk, bagikan kebaikan di hari Jum'at ini! ✨
                    </p>
                    <p className="text-slate-500 mt-8 text-sm">
                        Wassalamu'alaikum Wr. Wb.
                    </p>
                </section>
            </div>
        </main>
    );
}