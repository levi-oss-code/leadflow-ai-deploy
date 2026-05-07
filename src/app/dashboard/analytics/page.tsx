"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const supabase = createClient();
  const [leadStats, setLeadStats] = useState<any[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data: leads } = await supabase.from("leads").select("status");
      if (leads) {
        const counts: Record<string, number> = {};
        leads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });
        setLeadStats(Object.entries(counts).map(([name, value]) => ({ name: name.replace("_", " "), value })));
        setTotalLeads(leads.length);
      }
      const { count: cc } = await supabase.from("campaigns").select("*", { count: "exact", head: true });
      setTotalCampaigns(cc ?? 0);
    };
    fetch();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h2 className="text-2xl font-bold">Analytics</h2><p className="text-zinc-500">Track your pipeline performance.</p></div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-xl border p-5 shadow-sm"><p className="text-sm text-zinc-500">Total Leads</p><p className="text-2xl font-bold">{totalLeads}</p></div>
          <div className="bg-white rounded-xl border p-5 shadow-sm"><p className="text-sm text-zinc-500">Campaigns</p><p className="text-2xl font-bold">{totalCampaigns}</p></div>
          <div className="bg-white rounded-xl border p-5 shadow-sm"><p className="text-sm text-zinc-500">Pending Tasks</p><p className="text-2xl font-bold">--</p></div>
        </div>
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Lead Status Distribution</h3>
          {leadStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie data={leadStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">{leadStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-zinc-400 py-8">No lead data yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
