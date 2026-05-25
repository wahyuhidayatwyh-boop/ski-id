import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { to, subject, body } = await req.json();

        // Konfigurasi Transport Nodemailer untuk SMTP Gmail
        // Untuk production, gunakan App Password dari Akun Google
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL || "admin@ski-telkom.ac.id", // Mock fallback
                pass: process.env.SMTP_PASSWORD || "dummy-password",
            },
        });

        const mailOptions = {
            from: `"Dakwah-OS Admin" <${process.env.SMTP_EMAIL || "admin@ski-telkom.ac.id"}>`,
            to,
            subject,
            html: `
                <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #0f172a; padding: 20px; text-align: center;">
                        <h2 style="color: #38bdf8; margin: 0;">Dakwah-OS</h2>
                        <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">Internal Management System</p>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p style="color: #334155; font-size: 16px; line-height: 1.6;">${body}</p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 12px; margin: 0;">Ini adalah email otomatis. Jangan membalas email ini.</p>
                    </div>
                </div>
            `,
        };

        // Karena ini adalah mockup/MVP dan mungkin credentials tidak diset di .env
        // Kita bypass pengiriman asli jika tidak ada password di env
        if (process.env.SMTP_PASSWORD) {
            await transporter.sendMail(mailOptions);
            return NextResponse.json({ success: true, message: "Email berhasil dikirim" });
        } else {
            console.log("Mock Email Sent:", { to, subject });
            return NextResponse.json({ success: true, message: "Mock Email berhasil di-log (karena SMTP_PASSWORD tidak diset)" });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
