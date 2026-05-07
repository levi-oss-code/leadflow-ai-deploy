"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase-client";
import { Plus, Pencil, Trash2 } from "lucide-react";

const statuses = ["new", "contacted", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];

export default function LeadsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", email: "", company: "", title: "", status: "new", source: "", notes: "", score: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchLeads = async () => {
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (!error && data) setLeads(data);
  };

  useEffect(() => { fetchLeads(); }, []);

  const saveLead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (editingId) {
      await supabase.from("leads").update(form).eq("id", editingId);
    } else {
      await supabase.from("leads").insert({ ...form, user_id: user.id });
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", email: "", company: "", title: "", status: "new", source: "", notes: "", score: 0 });
    fetchLeads();
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await supabase.from("leads").delete().eq("id", id);
    fetchLeads();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Leads</h2>
            <p className="text-zinc-500">Manage your sales pipeline.</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <h3 className="font-semibold">{editingId ? "Edit Lead" : "New Lead"}</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
              <input placeholder="Score (0-100)" type="number" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} className="px-3 py-2 border rounded-lg text-sm" />
            </div>
            <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-2">
              <button onClick={saveLead} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Company</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-zinc-400 text-xs">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{lead.company ?? "--"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-zinc-100 rounded-full text-xs capitalize">{lead.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setForm(lead); setEditingId(lead.id); setShowForm(true); }} className="p-1 hover:bg-zinc-100 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteLead(lead.id)} className="p-1 hover:bg-zinc-100 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && <p className="text-center text-zinc-400 py-8">No leads yet. Add your first one.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
