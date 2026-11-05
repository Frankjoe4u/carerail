import type { InvoiceStatus } from "@/lib/types";

const LABELS: Record<InvoiceStatus, string> = {
  awaiting_payment: "Waiting for payment",
  processing: "Payment received, converting",
  paid: "Paid",
  refunded: "Refunded to payer",
  failed: "Payment failed",
};

const STYLES: Record<InvoiceStatus, string> = {
  awaiting_payment: "bg-amber-soft text-amber",
  processing: "bg-amber-soft text-amber",
  paid: "bg-mint text-pine-deep",
  refunded: "bg-coral-soft text-coral",
  failed: "bg-coral-soft text-coral",
};

export function statusLabel(status: InvoiceStatus): string {
  return LABELS[status];
}

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      <span
        aria-hidden
        className={`size-1.5 rounded-full bg-current ${status === "processing" ? "animate-pulse" : ""}`}
      />
      {LABELS[status]}
    </span>
  );
}
