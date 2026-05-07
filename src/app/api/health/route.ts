import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    await supabase.from("leads").select("count", { count: "exact", head: true });
    return NextResponse.json({ status: "healthy", timestamp: new Date().toISOString(), checks: { database: "healthy", environment: "production", version: "0.1.0" } });
  } catch {
    return NextResponse.json({ status: "unhealthy", timestamp: new Date().toISOString() }, { status: 500 });
  }
}
