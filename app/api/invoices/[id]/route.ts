import { NextResponse } from "next/server";
import { isDemo } from "@/lib/intents";
import { loadAndRefresh } from "@/lib/invoices";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const invoice = await loadAndRefresh(id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    return NextResponse.json({ invoice, demo: isDemo() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load the invoice." },
      { status: 502 },
    );
  }
}
