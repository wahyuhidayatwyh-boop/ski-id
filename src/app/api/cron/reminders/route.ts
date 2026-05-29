import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Pastikan path ini benar atau buat client manual
import nodemailer from "nodemailer";

export async function GET(req: Request) {
    try {
        // Cron Job logic: GET method biasanya dipakai Vercel Cron
        // Cek Auth Header untuk proteksi (Opsional)
        const authHeader = req.headers.get("authorization");
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Ambil acara yang mendekati hari H
        // H-7, H-3, H-1, H-0 (Hari H)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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

            // Jika hari ini bertepatan dengan H-30, H-21, H-14, H-7, H-3, H-1, atau H-0
            if ([30, 21, 14, 7, 3, 1, 0].includes(diffDays)) {
                
                // Ambil daftar email pengurus di divisi yang bersangkutan
                // Asumsi pengurus punya user_id yang merujuk ke tabel users
                // Kita gunakan RCP atau join manual jika perlu. 
                // Untuk contoh ini kita get pengurus by division_id
                let targetEmails = ["anggota@ski-telkom.ac.id", "pengurus@ski-telkom.ac.id"]; // Mock target
                
                if (acara.prokers?.division_id) {
                    const { data: staffList } = await supabase
                        .from("pengurus")
                        .select("full_name, role_level, user_id")
                        .eq("division_id", acara.prokers.division_id)
                        .eq("kabinet_id", acara.kabinet_id);
    
                    if (!staffList || staffList.length === 0) continue;
                }

                // Tentukan isi pesan berdasarkan H- berapa
                let reminderType = "";
                let actionRequired = "";
                
                if (diffDays === 30) {
                    reminderType = "Kick-off Persiapan H-30 (1 Bulan)";
                    actionRequired = "Acara akan dilaksanakan 1 bulan lagi. Harap mulai menyusun rencana anggaran, pembagian tugas panitia, dan menghubungi pihak terkait/pembicara.";
                } else if (diffDays === 21) {
                    reminderType = "Progress Check H-21 (3 Minggu)";
                    actionRequired = "Acara tinggal 3 minggu! Pastikan proposal sudah disetujui, pembicara/pemateri sudah fix, dan publikasi awal (teaser) mulai disiapkan.";
                } else if (diffDays === 14) {
                    reminderType = "Persiapan Teknis H-14 (2 Minggu)";
                    actionRequired = "Acara tinggal 2 minggu! Segera pastikan perizinan tempat, fiksasi rundown acara, dan publikasi (poster utama) sudah mulai disebarkan.";
                } else if (diffDays === 7) {
                    reminderType = "Persiapan Final & Publikasi H-7 (1 Minggu)";
                    actionRequired = "Acara tinggal 1 minggu! Mengingatkan untuk memfinalisasi persiapan, gladi bersih (jika ada), dan mulai menggencarkan publikasi acara ke anggota.";
                } else if (diffDays === 3) {
                    reminderType = "Cek Kesiapan Logistik H-3";
                    actionRequired = "Mengingatkan seluruh divisi untuk memastikan seluruh logistik, materi, dan perlengkapan sudah siap 100%.";
                } else if (diffDays === 1) {
                    reminderType = "Reminder H-1 Acara";
                    actionRequired = "Besok acara dimulai! Pastikan semua persiapan sudah selesai dan ingatkan kembali peserta untuk hadir.";
                } else if (diffDays === 0) {
                    reminderType = "HARI H PELAKSANAAN";
                    actionRequired = "Hari ini adalah pelaksanaan acara. Semangat bertugas dan jangan lupa mengisi presensi kehadiran!";
                }

                const emailBody = `
                    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #0ea5e9; padding: 20px; text-align: center;">
                            <h2 style="color: #ffffff; margin: 0;">REMINDER ACARA H-${diffDays}</h2>
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
                            <p style="color: #334155; font-size: 14px; margin-top: 20px;">Harap seluruh panitia/staff divisi segera berkoordinasi. Silakan masuk ke <a href="https://ski-telkom.ac.id/portal" style="color: #0ea5e9;">Portal Pengurus</a> untuk update progres tugas.</p>
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

                // Namun secara logika, email di-query dari tabel auth.users
                // Target emails variable is already set above

                if (process.env.SMTP_PASSWORD) {
                    await transporter.sendMail({
                        from: `"Dakwah-OS Bot" <${process.env.SMTP_EMAIL}>`,
                        to: targetEmails.join(","),
                        subject: `[H-${diffDays}] Reminder Progres Acara: ${acara.title}`,
                        html: emailBody
                    });
                    sentCount++;
                } else {
                    console.log(`Mock Cron Email Sent for ${acara.title} (H-${diffDays})`);
                    sentCount++;
                }
            }
        }

        return NextResponse.json({ success: true, message: `Cron Job berhasil. ${sentCount} reminder dikirim.` });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
