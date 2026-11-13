import { getIntentsState, mapStatus } from "./intents";
import { getInvoice, saveInvoice } from "./store";
import type { Invoice } from "./types";

export function newInvoiceId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

/**
 * Pull the latest payment status from 1Click (or the demo simulator) and
 * persist it. Safe to call repeatedly; settled invoices are returned as-is.
 */
export async function refreshInvoice(invoice: Invoice): Promise<Invoice> {
  const settled =
    invoice.status === "paid" ||
    invoice.status === "refunded" ||
    invoice.status === "failed";
  if (!invoice.quote || settled) return invoice;

  const state = await getIntentsState(invoice.quote);
  const raw = state.status;
  const status = mapStatus(raw);
  const next: Invoice = { ...invoice, intentsStatus: raw, status };
  if (state.settlement) next.settlement = state.settlement;

  if (status === "paid") next.paidAt = new Date().toISOString();

  // Quote ran out with no deposit: drop it so the payer can request a new one.
  const expired =
    raw === "PENDING_DEPOSIT" &&
    new Date(invoice.quote.deadline).getTime() < Date.now();
  if (expired) next.quote = undefined;

  if (
    next.status !== invoice.status ||
    next.intentsStatus !== invoice.intentsStatus ||
    expired
  ) {
    await saveInvoice(next);
  }
  return next;
}

export async function loadAndRefresh(id: string): Promise<Invoice | null> {
  const invoice = await getInvoice(id);
  return invoice ? refreshInvoice(invoice) : null;
}
