"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase-client";

export default function SettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState({ email_notifications: true, weekly_digest: true, ai_model: "gpt-4o-mini", timezone: "UTC", theme: "system" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single();
      if (data) setSettings(data);
    };
    fetch();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_settings").upsert({ ...settings, user_id: user.id });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div><h2 className="text-2xl font-bold">Settings</h2><p className="text-zinc-500">Manage your preferences.</p></div>
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-zinc-400">Receive alerts for lead updates.</p></div><button onClick={() => setSettings({...settings, email_notifications: !settings.email_notifications})} className={`w-11 h-6 rounded-full transition-colors ${settings.email_notifications ? "bg-blue-600" : "bg-zinc-200"}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${settings.email_notifications ? "translate-x-5" : "translate-x-0"}`} /></button></div>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Weekly Digest</p><p className="text-xs text-zinc-400">Get a weekly summary.</p></div><button onClick={() => setSettings({...settings, weekly_digest: !settings.weekly_digest})} className={`w-11 h-6 rounded-full transition-colors ${settings.weekly_digest ? "bg-blue-600" : "bg-zinc-200"}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${settings.weekly_digest ? "translate-x-5" : "translate-x-0"}`} /></button></div>
        </div>
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <h3 className="font-semibold">AI & Appearance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Theme</label><select value={settings.theme} onChange={e => setSettings({...settings, theme: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></div>
            <div className="space-y-2"><label className="text-sm font-medium">AI Model</label><select value={settings.ai_model} onChange={e => setSettings({...settings, ai_model: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="gpt-4o-mini">GPT-4o Mini</option><option value="gpt-4o">GPT-4o</option></select></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Timezone</label><input value={settings.timezone} onChange={e => setSettings({...settings, timezone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
        <div className="flex justify-end">
          <button onClick={save} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">{saved ? "Saved!" : "Save Changes"}</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
