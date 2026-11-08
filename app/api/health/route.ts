import { NextResponse } from "next/server";
import { isDemo } from "@/lib/intents";

export const dynamic = "force-dynamic";

/** Shows how this deployment is configured. Never returns secret values. */
export async function GET() {
  const supabaseUrl = Boolean(process.env.SUPABASE_URL);
  const supabaseKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return NextResponse.json({
    demoMode: isDemo(),
    supabaseUrlSet: supabaseUrl,
    supabaseKeySet: supabaseKey,
    storage: supabaseUrl && supabaseKey ? "supabase" : "memory (invoices will not persist on Vercel)",
  });
}
