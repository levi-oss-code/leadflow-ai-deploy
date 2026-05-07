"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase-client";
import { Plus, Pencil, Trash2 } from "lucide-react";

const statuses = ["draft", "active", "paused", "completed"];
const channels = ["email", "linkedin", "twitter", "sms", "call"];

export default function CampaignsPage() {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", status: "draft", channel: "email", target_audience: "", content: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
    if (data) setCampaigns(data);
  };
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (editingId) await supabase.from("campaigns").update(form).eq("id", editingId);
    else await supabase.from("campaigns").insert({ ...form, user_id: user.id });
    setShowForm(false); setEditingId(null);
    setForm({ name: "", description: "", status: "draft", channel: "email", target_audience: "", content: "" });
    fetch();
  };

  const del = async (id: string) => { if (confirm("Delete?")) { await supabase.from("campaigns").delete().eq("id", id); fetch(); } };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold">Campaigns</h2><p className="text-zinc-500">Manage outreach campaigns.</p></div>
          <button onClick={() => { setShowForm(true); setEditingId(null); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus className="w-4 h-4" /> New Campaign</button>
        </div>
        {showForm && (
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <h3 className="font-semibold">{editingId ? "Edit" : "New"} Campaign</h3>
            <input placeholder="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <select value={form.channel} onChange={e => setForm({...form, channel: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">{channels.map(c => <option key={c} value={c}>{c}</option>)}</select>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <input placeholder="Target Audience" value={form.target_audience} onChange={e => setForm({...form, target_audience: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
            <textarea placeholder="Campaign Content" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
            <div className="flex gap-2">
              <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50"><tr><th className="px-4 py-3 text-left font-medium">Campaign</th><th className="px-4 py-3 text-left font-medium">Channel</th><th className="px-4 py-3 text-left font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
            <tbody className="divide-y">
              {campaigns.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3"><div className="font-medium">{c.name}</div><div className="text-zinc-400 text-xs">{c.description || "No description"}</div></td>
                  <td className="px-4 py-3 capitalize">{c.channel}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-zinc-100 rounded-full text-xs capitalize">{c.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setForm(c); setEditingId(c.id); setShowForm(true); }} className="p-1 hover:bg-zinc-100 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del(c.id)} className="p-1 hover:bg-zinc-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length === 0 && <p className="text-center text-zinc-400 py-8">No campaigns yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
