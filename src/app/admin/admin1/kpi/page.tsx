"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { Award, TrendingUp, Users, CheckCircle, BarChart2, Star } from "lucide-react";
import { motion } from "framer-motion";

interface KpiData {
    id: string;
    full_name: string;
    jabatan: string;
    photo_url: string;
    kehadiran_rate: number;
    task_completion_rate: number;
    peer_review_score: number;
    total_score: number;
}

export default function KPIDashboard() {
    const role = "admin1"; // Admin SDM / HR
    const [kpiData, setKpiData] = useState<KpiData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKPI();
    }, []);

    const fetchKPI = async () => {
        setLoading(true);
        try {
            // 1. Fetch Attendance from vw_performa_pengurus
            const { data: performaData, error: pError } = await supabase.from('vw_performa_pengurus').select('*');
            if (pError) throw pError;

            // 2. Fetch Tasks
            const { data: tasksData, error: tError } = await supabase.from('proker_tasks').select('assigned_to, is_completed');
            if (tError) throw tError;

            // 3. Fetch Peer Reviews
            const { data: peerData, error: prError } = await supabase.from('kpi_evaluations').select('evaluatee_id, score');
            if (prError) throw prError;

            // Process Data
            const staffList: KpiData[] = [];

            performaData?.forEach((p: any) => {
                // Calculate Task Rate
                const userTasks = tasksData?.filter(t => t.assigned_to === p.pengurus_id) || [];
                const completedTasks = userTasks.filter(t => t.is_completed).length;
                const task_completion_rate = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 100; // default 100 if no tasks

                // Calculate Peer Review
                const userReviews = peerData?.filter(r => r.evaluatee_id === p.pengurus_id) || [];
                const avgReview = userReviews.length > 0 ? userReviews.reduce((sum, r) => sum + r.score, 0) / userReviews.length : 5; // Default 5/5 if no review
                const peer_review_score = (avgReview / 5) * 100;

                // Calculate Total Score (40% Attendance, 40% Tasks, 20% Peer Review)
                const kehadiran_rate = parseFloat(p.kehadiran_rate) || 0;
                const total_score = (kehadiran_rate * 0.4) + (task_completion_rate * 0.4) + (peer_review_score * 0.2);

                staffList.push({
                    id: p.pengurus_id,
                    full_name: p.full_name,
                    jabatan: p.jabatan,
                    photo_url: p.photo_url || 'https://via.placeholder.com/50',
                    kehadiran_rate: Math.round(kehadiran_rate),
                    task_completion_rate: Math.round(task_completion_rate),
                    peer_review_score: Math.round(peer_review_score),
                    total_score: parseFloat(total_score.toFixed(1))
                });
            });

            // Sort by total score descending
            staffList.sort((a, b) => b.total_score - a.total_score);
            setKpiData(staffList);
        } catch (error) {
            console.error("Error fetching KPI:", error);
        } finally {
            setLoading(false);
        }
    };

    const top3 = kpiData.slice(0, 3);
    const restStaff = kpiData.slice(3);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar role={role} />
            <main className="flex-1 lg:ml-64 p-6 pt-20 lg:pt-6">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <BarChart2 className="text-sky-500" />
                            KPI Analytics & Reward System
                        </h1>
                        <p className="text-slate-500 font-medium">Evaluasi kinerja staff berdasarkan kehadiran, penyelesaian proker, dan peer review.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Top 3 Leaderboard */}
                            <div>
                                <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2"><Award className="text-amber-500"/> Staff of The Month</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                    {/* Rank 2 */}
                                    {top3[1] && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-t-3xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center relative pt-12 order-2 md:order-1 border-t-4 border-t-slate-300">
                                            <div className="absolute -top-6 w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-black text-slate-600 text-xl shadow-md border-4 border-white">2</div>
                                            <img src={top3[1].photo_url} className="w-20 h-20 rounded-full object-cover mb-4 shadow-sm" />
                                            <h4 className="font-black text-slate-900 text-lg line-clamp-1">{top3[1].full_name}</h4>
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-4">{top3[1].jabatan}</p>
                                            <div className="bg-slate-50 px-6 py-2 rounded-xl text-xl font-black text-sky-600 w-full">{top3[1].total_score} pts</div>
                                        </motion.div>
                                    )}
                                    
                                    {/* Rank 1 */}
                                    {top3[0] && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-b from-amber-50 to-white rounded-t-3xl border border-amber-200 shadow-lg p-6 flex flex-col items-center text-center relative pt-14 order-1 md:order-2 border-t-4 border-t-amber-400 z-10 md:-mt-8">
                                            <div className="absolute -top-8 w-16 h-16 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center font-black text-white text-3xl shadow-lg border-4 border-white"><Award size={28}/></div>
                                            <img src={top3[0].photo_url} className="w-24 h-24 rounded-full object-cover mb-4 shadow-md border-4 border-amber-100" />
                                            <h4 className="font-black text-slate-900 text-xl line-clamp-1">{top3[0].full_name}</h4>
                                            <p className="text-xs font-bold text-amber-600 uppercase mb-4">{top3[0].jabatan}</p>
                                            <div className="bg-amber-100 px-6 py-3 rounded-xl text-2xl font-black text-amber-700 w-full shadow-inner">{top3[0].total_score} pts</div>
                                        </motion.div>
                                    )}

                                    {/* Rank 3 */}
                                    {top3[2] && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-t-3xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center relative pt-12 order-3 md:order-3 border-t-4 border-t-orange-300">
                                            <div className="absolute -top-6 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center font-black text-orange-600 text-xl shadow-md border-4 border-white">3</div>
                                            <img src={top3[2].photo_url} className="w-20 h-20 rounded-full object-cover mb-4 shadow-sm" />
                                            <h4 className="font-black text-slate-900 text-lg line-clamp-1">{top3[2].full_name}</h4>
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-4">{top3[2].jabatan}</p>
                                            <div className="bg-slate-50 px-6 py-2 rounded-xl text-xl font-black text-sky-600 w-full">{top3[2].total_score} pts</div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Full Leaderboard Table */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50">
                                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><Users size={18}/> Semua Pengurus</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-white border-b border-slate-100">
                                            <tr>
                                                <th className="py-4 px-6 font-bold text-slate-500 w-16 text-center">Rank</th>
                                                <th className="py-4 px-6 font-bold text-slate-500">Staff</th>
                                                <th className="py-4 px-6 font-bold text-slate-500 text-center"><span className="flex flex-col items-center gap-1"><TrendingUp size={14}/> Kehadiran (40%)</span></th>
                                                <th className="py-4 px-6 font-bold text-slate-500 text-center"><span className="flex flex-col items-center gap-1"><CheckCircle size={14}/> Tasks (40%)</span></th>
                                                <th className="py-4 px-6 font-bold text-slate-500 text-center"><span className="flex flex-col items-center gap-1"><Star size={14}/> Review (20%)</span></th>
                                                <th className="py-4 px-6 font-black text-sky-600 text-center">TOTAL SKOR</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {kpiData.map((staff, idx) => (
                                                <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-3 px-6 text-center font-black text-slate-400">{idx + 1}</td>
                                                    <td className="py-3 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <img src={staff.photo_url} className="w-10 h-10 rounded-full object-cover" />
                                                            <div>
                                                                <p className="font-bold text-slate-900">{staff.full_name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{staff.jabatan}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6 text-center">
                                                        <div className="w-full bg-slate-100 rounded-full h-2 mb-1"><div className="bg-emerald-400 h-2 rounded-full" style={{width: `${staff.kehadiran_rate}%`}}></div></div>
                                                        <span className="text-xs font-bold text-slate-600">{staff.kehadiran_rate}%</span>
                                                    </td>
                                                    <td className="py-3 px-6 text-center">
                                                        <div className="w-full bg-slate-100 rounded-full h-2 mb-1"><div className="bg-sky-400 h-2 rounded-full" style={{width: `${staff.task_completion_rate}%`}}></div></div>
                                                        <span className="text-xs font-bold text-slate-600">{staff.task_completion_rate}%</span>
                                                    </td>
                                                    <td className="py-3 px-6 text-center">
                                                        <div className="w-full bg-slate-100 rounded-full h-2 mb-1"><div className="bg-purple-400 h-2 rounded-full" style={{width: `${staff.peer_review_score}%`}}></div></div>
                                                        <span className="text-xs font-bold text-slate-600">{staff.peer_review_score}%</span>
                                                    </td>
                                                    <td className="py-3 px-6 text-center">
                                                        <span className="bg-sky-50 text-sky-600 font-black px-4 py-1.5 rounded-lg text-lg">
                                                            {staff.total_score}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
