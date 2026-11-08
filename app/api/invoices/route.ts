import { NextResponse } from "next/server";
import { isDemo } from "@/lib/intents";
import { newInvoiceId, refreshInvoice } from "@/lib/invoices";
import { nearAccountStatus } from "@/lib/near";
import { listInvoices, saveInvoice } from "@/lib/store";
import type { Invoice } from "@/lib/types";
import {
  clean,
  isValidNearAccount,
  isValidUsdcAmount,
} from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const invoices = await listInvoices();
    // Refresh unsettled invoices so the clinic sees payments as they land
    const fresh = await Promise.all(
      invoices.map((inv) => refreshInvoice(inv).catch(() => inv)),
    );
    return NextResponse.json({ invoices: fresh });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load invoices." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const clinicName = clean(body.clinicName, 80);
  const clinicNearAccount = clean(body.clinicNearAccount, 64).toLowerCase();
  const patientName = clean(body.patientName, 80);
  const description = clean(body.description, 200);
  const amountUsdc = clean(body.amountUsdc, 20);

  const fields: Record<string, string> = {};
  if (clinicName.length < 2) fields.clinicName = "Enter the clinic name.";
  if (!isValidNearAccount(clinicNearAccount)) {
    fields.clinicNearAccount =
      "Enter a valid NEAR account, for example mycliniq.near.";
  }
  if (patientName.length < 2) fields.patientName = "Enter the patient's name.";
  if (description.length < 3) fields.description = "Describe what the bill is for.";
  if (!isValidUsdcAmount(amountUsdc)) {
    fields.amountUsdc = "Enter an amount in USDC, up to 2 decimals.";
  }
  // Live mode: a misspelled account has a valid format but does not exist, and the
  // payout would fail. Only block when NEAR confirms the account is missing.
  if (!fields.clinicNearAccount && !isDemo()) {
    const status = await nearAccountStatus(clinicNearAccount);
    if (status === "missing") {
      fields.clinicNearAccount =
        "This NEAR account does not exist. Check the spelling.";
    }
  }
  if (Object.keys(fields).length > 0) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", fields },
      { status: 400 },
    );
  }

  const invoice: Invoice = {
    id: newInvoiceId(),
    clinicName,
    clinicNearAccount,
    patientName,
    description,
    amountUsdc: Number(amountUsdc).toFixed(2),
    status: "awaiting_payment",
    createdAt: new Date().toISOString(),
  };
  try {
    await saveInvoice(invoice);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save the invoice." },
      { status: 500 },
    );
  }
  return NextResponse.json({ invoice }, { status: 201 });
}
