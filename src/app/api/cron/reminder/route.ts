import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    // Vercel Cron Authentication (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const today = new Date();
        
        const { data: events, error } = await supabase
            .from('acara_internal')
            .select('id, title, start_time, proker_id, status')
            .in('status', ['draft', 'upcoming']);

        if (error) throw error;

        const remindersSent = [];

        for (const event of events) {
            const eventDate = new Date(event.start_time);
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let reminderType = null;
            if (diffDays === 30) reminderType = 'H-30: Konsep & Ruangan';
            else if (diffDays === 21) reminderType = 'H-21: Progres Awal (Checklist Tugas)';
            else if (diffDays === 14) reminderType = 'H-14: Progres Akhir (Finalisasi)';
            else if (diffDays === 7) reminderType = 'H-7: Undangan Massal';

            if (reminderType) {
                // Fetch staff involved in this proker
                const { data: staffs } = await supabase
                    .from('tasks')
                    .select('assigned_to, pengurus:assigned_to(full_name, user_id)')
                    .eq('proker_id', event.proker_id);
                
                const uniqueStaffs = Array.from(new Set(staffs?.map((s: any) => s.pengurus?.full_name).filter(Boolean)));

                // Here we would integrate with an email provider like Resend
                // For demonstration, we log the action
                console.log(`[CRON REMINDER SENT] Event: ${event.title} | Type: ${reminderType} | To: ${uniqueStaffs.join(', ')}`);
                
                remindersSent.push({
                    event_id: event.id,
                    title: event.title,
                    type: reminderType,
                    recipients: uniqueStaffs
                });
            }
        }

        return NextResponse.json({ success: true, reminders_sent: remindersSent });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
