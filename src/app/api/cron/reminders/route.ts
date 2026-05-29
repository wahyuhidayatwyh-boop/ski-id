import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Pastikan path ini benar atau buat client manual
import nodemailer from "nodemailer";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const isTestMode = url.searchParams.get("test") === "true";
        const testEmail = url.searchParams.get("email"); // Override email target saat test

        // Proteksi: hanya izinkan test mode tanpa auth di development, atau kalau ada CRON_SECRET
        const authHeader = req.headers.get("authorization");
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}` && !isTestMode) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isTestMode) {
            console.log("🧪 TEST MODE: bypass date filter, akan kirim ke semua acara upcoming");
        }

        const { data: acaras, error } = await supabase
            .from("acara_internal")
            .select("*, prokers(name, division_id, divisions(name))")
            .neq("status", "completed");

        if (error || !acaras) {
            throw error || new Error("Gagal mengambil data acara");
        }

        let sentCount = 0;

        for (const acara of acaras) {
            if (!acara.start_time) continue;

            const eventDate = new Date(acara.start_time);
            eventDate.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(eventDate.getTime() - today.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Kalau test mode: bypass filter tanggal, gunakan H-7 sebagai dummy
            const shouldSend = isTestMode || [30, 21, 14, 7, 3, 1, 0].includes(diffDays);
            const effectiveDiffDays = isTestMode ? 7 : diffDays;

            if (shouldSend) {

                // Ambil daftar email pengurus berdasarkan divisi acara
                // Gunakan supabase admin client untuk akses auth.users
                const { createClient } = await import("@supabase/supabase-js");
                const adminClient = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!,
                    { auth: { autoRefreshToken: false, persistSession: false } }
                );

                let targetEmails: string[] = [];

                // Cari pengurus yang terlibat: divisi terkait + seluruh pengurus jika acara umum
                const divisionId = acara.prokers?.division_id || null;
                const pengurusQuery = supabase
                    .from("pengurus")
                    .select("user_id")
                    .eq("kabinet_id", acara.kabinet_id);

                if (divisionId) {
                    pengurusQuery.eq("division_id", divisionId);
                }

                const { data: staffList } = await pengurusQuery;

                if (staffList && staffList.length > 0) {
                    const userIds = staffList.map(s => s.user_id).filter(Boolean);
                    // Ambil email dari auth.users via admin API
                    const emailPromises = userIds.map(async (uid) => {
                        const { data } = await adminClient.auth.admin.getUserById(uid);
                        return data?.user?.email || null;
                    });
                    const emails = await Promise.all(emailPromises);
                    targetEmails = emails.filter((e): e is string => !!e);
                }

                // Fallback: kalau tidak ada email ditemukan, skip
                if (targetEmails.length === 0) {
                    console.log(`No emails found for acara: ${acara.title}`);
                    continue;
                }

                // Tentukan isi pesan berdasarkan H- berapa
                let reminderType = "";
                let actionRequired = "";

                if (effectiveDiffDays === 30) {
                    reminderType = "Kick-off Persiapan H-30 (1 Bulan)";
                    actionRequired = "Acara akan dilaksanakan 1 bulan lagi. Harap mulai menyusun rencana anggaran, pembagian tugas panitia, dan menghubungi pihak terkait/pembicara.";
                } else if (effectiveDiffDays === 21) {
                    reminderType = "Progress Check H-21 (3 Minggu)";
                    actionRequired = "Acara tinggal 3 minggu! Pastikan proposal sudah disetujui, pembicara/pemateri sudah fix, dan publikasi awal (teaser) mulai disiapkan.";
                } else if (effectiveDiffDays === 14) {
                    reminderType = "Persiapan Teknis H-14 (2 Minggu)";
                    actionRequired = "Acara tinggal 2 minggu! Segera pastikan perizinan tempat, fiksasi rundown acara, dan publikasi (poster utama) sudah mulai disebarkan.";
                } else if (effectiveDiffDays === 7) {
                    reminderType = "Persiapan Final & Publikasi H-7 (1 Minggu)";
                    actionRequired = "Acara tinggal 1 minggu! Mengingatkan untuk memfinalisasi persiapan, gladi bersih (jika ada), dan mulai menggencarkan publikasi acara ke anggota.";
                } else if (effectiveDiffDays === 3) {
                    reminderType = "Cek Kesiapan Logistik H-3";
                    actionRequired = "Mengingatkan seluruh divisi untuk memastikan seluruh logistik, materi, dan perlengkapan sudah siap 100%.";
                } else if (effectiveDiffDays === 1) {
                    reminderType = "Reminder H-1 Acara";
                    actionRequired = "Besok acara dimulai! Pastikan semua persiapan sudah selesai dan ingatkan kembali peserta untuk hadir.";
                } else if (effectiveDiffDays === 0) {
                    reminderType = "HARI H PELAKSANAAN";
                    actionRequired = "Hari ini adalah pelaksanaan acara. Semangat bertugas dan jangan lupa mengisi presensi kehadiran!";
                }

                const emailBody = `
                    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #0ea5e9; padding: 20px; text-align: center;">
                            <h2 style="color: #ffffff; margin: 0;">REMINDER ACARA H-${effectiveDiffDays}${isTestMode ? ' [TEST]' : ''}</h2>
                            <p style="color: #e0f2fe; font-size: 14px; margin: 5px 0 0 0;">Dakwah-OS Automated System</p>
                        </div>
                        <div style="padding: 30px; background-color: #ffffff;">
                            <h3 style="color: #0f172a; margin-top: 0;">${acara.title} ${acara.prokers ? `- ${acara.prokers.name}` : ''}</h3>
                            <p style="color: #334155; font-size: 15px;">Penyelenggara: <strong>${acara.prokers?.divisions?.name || 'Seluruh Pengurus'}</strong></p>
                            <p style="color: #334155; font-size: 15px;">Waktu Pelaksanaan: <strong>${new Date(acara.start_time).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #0ea5e9; border-radius: 4px;">
                                <h4 style="color: #0ea5e9; margin: 0 0 5px 0;">Fokus Agenda: ${reminderType}</h4>
                                <p style="color: #475569; font-size: 14px; margin: 0;">${actionRequired}</p>
                            </div>
                            <p style="color: #334155; font-size: 14px; margin-top: 20px;">Harap seluruh panitia/staff divisi segera berkoordinasi. Silakan masuk ke <a href="https://www.skitelkompurwokerto.site/portal" style="color: #0ea5e9;">Portal Pengurus</a> untuk update progres tugas.</p>
                        </div>
                    </div>
                `;

                // Setup Nodemailer
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.SMTP_EMAIL || "dummy@example.com",
                        pass: process.env.SMTP_PASSWORD || "dummy",
                    },
                });

                // Kalau test mode dan ada ?email param, override penerima ke email tersebut
                const finalTargets = (isTestMode && testEmail) ? [testEmail] : targetEmails;

                if (process.env.SMTP_PASSWORD) {
                    await transporter.sendMail({
                        from: `"Dakwah-OS Bot" <${process.env.SMTP_EMAIL}>`,
                        to: finalTargets.join(","),
                        subject: `[H-${effectiveDiffDays}${isTestMode ? ' TEST' : ''}] Reminder: ${acara.title}`,
                        html: emailBody
                    });
                    sentCount++;
                } else {
                    console.log(`Mock Email → ${finalTargets.join(",")} | ${acara.title} (H-${effectiveDiffDays})`);
                    sentCount++;
                }
            }
        }

        return NextResponse.json({ success: true, message: `Cron Job berhasil. ${sentCount} reminder dikirim.` });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
