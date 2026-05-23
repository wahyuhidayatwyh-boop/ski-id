"use client";

import { motion } from "framer-motion";
import { Users, Calendar, Trophy, Briefcase } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      id: 1,
      name: "Anggota Aktif",
      value: "1,200+",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: 2,
      name: "Event Tahunan",
      value: "45+",
      icon: Calendar,
      color: "text-brand-500",
      bg: "bg-brand-100 dark:bg-brand-900/30",
    },
    {
      id: 3,
      name: "Prestasi",
      value: "120+",
      icon: Trophy,
      color: "text-yellow-500",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      id: 4,
      name: "Program Kerja",
      value: "30+",
      icon: Briefcase,
      color: "text-emerald-500",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  return (
    <section className="py-12 -mt-12 relative z-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`w-14 h-14 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon size={28} />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-brand-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-brand-900/60 dark:text-brand-100/60 uppercase tracking-wide">
                {stat.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
