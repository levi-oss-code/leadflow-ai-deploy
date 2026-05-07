"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase-client";
import { Users, Megaphone, CheckSquare, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState({ leads: 0, campaigns: 0, tasks: 0 });
  const [activity, setActivity] = useState<{ date: string; count: number }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const { count: leadsCount } = await supabase.from("leads").select("*", { count: "exact", head: true });
      const { count: campaignsCount } = await supabase.from("campaigns").select("*", { count: "exact", head: true });
      const { count: tasksCount } = await supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "todo");
      setStats({
        leads: leadsCount ?? 0,
        campaigns: campaignsCount ?? 0,
        tasks: tasksCount ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Leads", value: stats.leads, icon: Users },
    { label: "Campaigns", value: stats.campaigns, icon: Megaphone },
    { label: "Pending Tasks", value: stats.tasks, icon: CheckSquare },
    { label: "Avg Lead Score", value: "--", icon: TrendingUp },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-zinc-500">Overview of your pipeline.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-white rounded-xl border p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-zinc-500">{c.label}</span>
                  <Icon className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="text-2xl font-bold">{c.value}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          {activity.length === 0 && (
            <p className="text-center text-zinc-400 text-sm py-8">Start using LeadFlow to see activity data.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
