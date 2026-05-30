import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const namaDonatur = formData.get("nama_donatur") as string;
        const emailDonatur = formData.get("email_donatur") as string;
        const noHpDonatur = formData.get("no_hp_donatur") as string;
        const jenisDonasi = formData.get("jenis_donasi") as string;
        const nominalStr = formData.get("nominal") as string;
        const pesan = formData.get("pesan") as string;
        const metodePembayaran = formData.get("metode_pembayaran") as string;
        const isAnonymous = formData.get("is_anonymous") === "true";

        // Parse nominal - remove any formatting
        const nominal = parseFloat(nominalStr.replace(/[^0-9]/g, ""));

        // Validation
        if (!nominal || nominal <= 0) {
            return NextResponse.json(
                { error: "Nominal donasi harus lebih dari 0" },
                { status: 400 }
            );
        }

        if (!metodePembayaran || !["transfer_bank", "ewallet"].includes(metodePembayaran)) {
            return NextResponse.json(
                { error: "Metode pembayaran tidak valid" },
                { status: 400 }
            );
        }

        // Initialize Supabase client with service role
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        let buktiTransferUrl = null;

        // Handle file upload if exists
        const buktiFile = formData.get("bukti_transfer") as File | null;
        if (buktiFile && buktiFile.size > 0) {
            const fileExt = buktiFile.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("kas-bukti")
                .upload(`donasi/${fileName}`, buktiFile, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return NextResponse.json(
                    { error: "Gagal mengupload bukti transfer" },
                    { status: 500 }
                );
            }

            const { data: urlData } = supabase.storage
                .from("kas-bukti")
                .getPublicUrl(`donasi/${fileName}`);

            buktiTransferUrl = urlData.publicUrl;
        }

        // Get active kabinet
        const { data: kabinetData } = await supabase
            .from("kabinets")
            .select("id")
            .eq("is_active", true)
            .single();

        const description = `Donasi ${jenisDonasi || "Infaq"} dari ${isAnonymous ? "Hamba Allah" : namaDonatur}${pesan ? ` - ${pesan}` : ""}`;
        const today = new Date().toISOString().split("T")[0];

        // Insert to keuangan_transaksi first (this is what shows in the public page)
        const { data: keuanganData, error: keuanganError } = await supabase
            .from("keuangan_transaksi")
            .insert({
                kabinet_id: kabinetData?.id,
                division_id: null,
                type: "IN",
                kategori: "Donasi",
                amount: nominal,
                description: description,
                tanggal: today,
                created_by: null,
                bukti_url: buktiTransferUrl,
            })
            .select()
            .single();

        if (keuanganError) {
            console.error("Keuangan insert error:", keuanganError);
            return NextResponse.json(
                { error: "Gagal menyimpan data donasi ke laporan keuangan" },
                { status: 500 }
            );
        }

        // Insert to donasi_transaksi for admin tracking
        const { data: donasiData, error: donasiError } = await supabase
            .from("donasi_transaksi")
            .insert({
                nama_donatur: isAnonymous ? "Hamba Allah" : namaDonatur,
                email_donatur: isAnonymous ? null : emailDonatur,
                no_hp_donatur: isAnonymous ? null : noHpDonatur,
                jenis_donasi: jenisDonasi || "Infaq",
                nominal,
                pesan,
                metode_pembayaran: metodePembayaran,
                bukti_transfer_url: buktiTransferUrl,
                kabinet_id: kabinetData?.id,
                is_anonymous: isAnonymous,
                source: "web_form",
                status: "pending",
            })
            .select()
            .single();

        if (donasiError) {
            console.error("Donasi insert error:", donasiError);
            // Don't fail - keuangan_transaksi already saved
        }

        // Update keuangan_transaksi with donasi_transaksi_id if donasi was created
        if (donasiData) {
            await supabase
                .from("keuangan_transaksi")
                .update({ donasi_transaksi_id: donasiData.id })
                .eq('id', keuanganData.id);
        }

        return NextResponse.json({
            success: true,
            message: "Terima kasih atas donasi Anda! Semoga Allah membalas kebaikan Anda.",
            data: {
                id: keuanganData.id,
                nominal,
                jenis_donasi: jenisDonasi || "Infaq",
            },
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat memproses donasi" },
            { status: 500 }
        );
    }
}