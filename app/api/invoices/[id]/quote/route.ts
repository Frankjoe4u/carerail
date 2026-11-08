import { NextResponse } from "next/server";
import { friendlyQuoteError } from "@/lib/errors";
import { createQuote, getPayTokens, isDemo } from "@/lib/intents";
import { loadAndRefresh } from "@/lib/invoices";
import { saveInvoice } from "@/lib/store";
import {
  clean,
  isValidEvmAddress,
  isValidNearAccount,
  isValidRefundAddress,
} from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const assetId = clean(body?.assetId, 200);
  const refundTo = clean(body?.refundTo, 120);

  if (!assetId) {
    return NextResponse.json({ error: "Choose a token to pay with." }, { status: 400 });
  }
  if (!isValidRefundAddress(refundTo)) {
    return NextResponse.json(
      { error: "Enter the wallet address on the paying chain, so a failed payment can be refunded." },
      { status: 400 },
    );
  }

  try {
    const invoice = await loadAndRefresh(id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    if (invoice.status === "paid" || invoice.status === "processing") {
      return NextResponse.json(
        { error: "This invoice is already being paid or is settled." },
        { status: 409 },
      );
    }

    const tokens = await getPayTokens();
    const origin = tokens.find((t) => t.assetId === assetId);
    if (!origin) {
      return NextResponse.json({ error: "That token is not supported." }, { status: 400 });
    }

    if (!isDemo()) {
      const chain = origin.blockchain;
      if (["eth", "base", "arb"].includes(chain) && !isValidEvmAddress(refundTo)) {
        return NextResponse.json(
          { error: "Enter a valid wallet address that starts with 0x and is 42 characters long." },
          { status: 400 },
        );
      }
      if (chain === "near" && !isValidNearAccount(refundTo.toLowerCase())) {
        return NextResponse.json(
          { error: "Enter a valid NEAR account, for example yourname.near." },
          { status: 400 },
        );
      }
    }

    const quote = await createQuote({
      invoice,
      origin,
      refundTo: origin.blockchain === "near" ? refundTo.toLowerCase() : refundTo,
    });
    const next = {
      ...invoice,
      status: "awaiting_payment" as const,
      intentsStatus: "PENDING_DEPOSIT",
      quote,
    };
    await saveInvoice(next);
    return NextResponse.json({ invoice: next });
  } catch (err) {
    return NextResponse.json(
      { error: friendlyQuoteError(err instanceof Error ? err.message : "") },
      { status: 502 },
    );
  }
}
