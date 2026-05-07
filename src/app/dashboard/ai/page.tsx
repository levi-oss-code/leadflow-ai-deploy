"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Sparkles, Copy, Check, Wand2 } from "lucide-react";

export default function AIPage() {
  const [leadName, setLeadName] = useState("");
  const [leadTitle, setLeadTitle] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [channel, setChannel] = useState("email");
  const [tone, setTone] = useState("professional");
  const [context, setContext] = useState("");
  const [generated, setGenerated] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!leadName) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadName, leadTitle, leadCompany, channel, tone, context }),
      });
      const data = await res.json();
      setGenerated(data.content || "");
      setSubject(data.subject || "");
    } catch {}
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(generated); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div><h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6 text-blue-600" /> AI Content Generator</h2><p className="text-zinc-500">Generate personalized outreach content.</p></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
            <h3 className="font-semibold">Lead Details</h3>
            <div className="space-y-2"><label className="text-sm font-medium">Lead Name *</label><input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="John Doe" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Title</label><input value={leadTitle} onChange={e => setLeadTitle(e.target.value)} placeholder="VP Sales" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Company</label><input value={leadCompany} onChange={e => setLeadCompany(e.target.value)} placeholder="Acme Inc" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Channel</label><select value={channel} onChange={e => setChannel(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="email">Email</option><option value="linkedin">LinkedIn</option><option value="twitter">Twitter</option><option value="sms">SMS</option></select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Tone</label><select value={tone} onChange={e => setTone(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="professional">Professional</option><option value="friendly">Friendly</option><option value="casual">Casual</option><option value="formal">Formal</option></select></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Context</label><input value={context} onChange={e => setContext(e.target.value)} placeholder="Additional context..." className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <button onClick={generate} disabled={!leadName || loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"><Wand2 className="w-4 h-4" />{loading ? "Generating..." : "Generate Outreach"}</button>
          </div>
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Generated Content</h3>{generated && <button onClick={copy} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Copied" : "Copy"}</button>}</div>
            {loading ? <div className="space-y-2"><div className="h-4 bg-zinc-100 rounded w-full animate-pulse" /><div className="h-4 bg-zinc-100 rounded w-5/6 animate-pulse" /><div className="h-4 bg-zinc-100 rounded w-4/6 animate-pulse" /></div> : generated ? (
              <div className="space-y-3">
                {subject && <div className="p-3 bg-zinc-50 rounded-lg"><div className="text-xs text-zinc-400 mb-1">Subject Line</div><div className="font-medium text-sm">{subject}</div></div>}
                <div className="p-3 bg-zinc-50 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">{generated}</div>
              </div>
            ) : <p className="text-center text-zinc-400 text-sm py-12">Fill in lead details and click generate.</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
