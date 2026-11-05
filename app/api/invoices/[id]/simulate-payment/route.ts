import { NextResponse } from "next/server";
import { isDemo } from "@/lib/intents";
import { loadAndRefresh } from "@/lib/invoices";
import { saveInvoice } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Demo mode only: pretend the payer sent the deposit, so the flow can be shown end to end. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDemo()) {
    return NextResponse.json(
      { error: "Simulated payments are only available in demo mode." },
      { status: 403 },
    );
  }
  const { id } = await params;
  const invoice = await loadAndRefresh(id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }
  if (!invoice.quote?.mock) {
    return NextResponse.json(
      { error: "Create a payment quote first." },
      { status: 409 },
    );
  }
  if (invoice.quote.simulatedDepositAt) {
    return NextResponse.json({ invoice });
  }
  const next = {
    ...invoice,
    quote: { ...invoice.quote, simulatedDepositAt: new Date().toISOString() },
  };
  await saveInvoice(next);
  return NextResponse.json({ invoice: next });
}
