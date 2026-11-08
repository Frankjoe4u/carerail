import type { InvoiceStatus } from "@/lib/types";

const LABELS: Record<InvoiceStatus, string> = {
  awaiting_payment: "Waiting for payment",
  processing: "Converting",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

const STYLES: Record<InvoiceStatus, string> = {
  awaiting_payment: "bg-warn-bg text-warn-fg",
  processing: "bg-info-bg text-info-fg",
  paid: "bg-ok-bg text-ok-fg",
  refunded: "bg-bad-bg text-bad-fg",
  failed: "bg-bad-bg text-bad-fg",
};

export function statusLabel(status: InvoiceStatus): string {
  return LABELS[status];
}

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`pill ${STYLES[status]}`}>
      <span
        aria-hidden
        className={`size-1.5 rounded-full bg-current ${status === "processing" ? "dot-live" : ""}`}
      />
      {LABELS[status]}
    </span>
  );
}
