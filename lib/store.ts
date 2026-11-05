import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Invoice } from "./types";

/**
 * Invoice storage with three backends, chosen automatically:
 *  1. Supabase, when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
 *  2. A local JSON file (.data/invoices.json), so the app runs with zero setup
 *  3. In-memory, if the filesystem is read-only (e.g. serverless hosting)
 */

const DATA_FILE = path.join(process.cwd(), ".data", "invoices.json");

const g = globalThis as unknown as {
  __dhpMemory?: Map<string, Invoice>;
  __dhpSupabase?: SupabaseClient;
};
const memory = (g.__dhpMemory ??= new Map<string, Invoice>());

function supabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return (g.__dhpSupabase ??= createClient(url, key, {
    auth: { persistSession: false },
  }));
}

async function readFile(): Promise<Invoice[] | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Invoice[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    return null;
  }
}

async function writeFile(invoices: Invoice[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(invoices, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function listInvoices(): Promise<Invoice[]> {
  const sb = supabase();
  if (sb) {
    const { data, error } = await sb
      .from("invoices")
      .select("data")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(`Supabase: ${error.message}`);
    return (data ?? []).map((row) => row.data as Invoice);
  }
  const byId = new Map<string, Invoice>();
  for (const inv of (await readFile()) ?? []) byId.set(inv.id, inv);
  for (const inv of memory.values()) byId.set(inv.id, inv);
  return [...byId.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const sb = supabase();
  if (sb) {
    const { data, error } = await sb
      .from("invoices")
      .select("data")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Supabase: ${error.message}`);
    return (data?.data as Invoice) ?? null;
  }
  const fromFile = (await readFile())?.find((i) => i.id === id);
  return memory.get(id) ?? fromFile ?? null;
}

export async function saveInvoice(invoice: Invoice): Promise<void> {
  const sb = supabase();
  if (sb) {
    const { error } = await sb
      .from("invoices")
      .upsert({ id: invoice.id, data: invoice, created_at: invoice.createdAt });
    if (error) throw new Error(`Supabase: ${error.message}`);
    return;
  }
  const fromFile = await readFile();
  if (fromFile) {
    const next = fromFile.filter((i) => i.id !== invoice.id);
    next.push(invoice);
    if (await writeFile(next)) {
      memory.delete(invoice.id);
      return;
    }
  }
  memory.set(invoice.id, invoice);
}

export function storageBackend(): "supabase" | "file" {
  return supabase() ? "supabase" : "file";
}
