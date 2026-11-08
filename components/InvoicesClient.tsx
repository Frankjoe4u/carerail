"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Invoice } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { Icon } from "./Icons";
import { StatusBadge } from "./StatusBadge";

type Filter = "all" | "paid" | "pending" | "failed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

function bucket(inv: Invoice): Exclude<Filter, "all"> {
  if (inv.status === "paid") return "paid";
  if (inv.status === "failed" || inv.status === "refunded") return "failed";
  return "pending";
}

export function InvoicesClient() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/invoices", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.invoices);
        setLoadError("");
      } else {
        setLoadError(data.error ?? "Could not load invoices.");
      }
    } catch {
      setLoadError("Could not reach the server. Check your connection.");
    }
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  const counts = useMemo(() => {
    const c = { all: 0, paid: 0, pending: 0, failed: 0 };
    let paidTotal = 0;
    for (const inv of invoices ?? []) {
      c.all++;
      c[bucket(inv)]++;
      if (inv.status === "paid") paidTotal += Number(inv.amountUsdc) || 0;
    }
    return { ...c, paidTotal };
  }, [invoices]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (invoices ?? []).filter(
      (inv) =>
        (filter === "all" || bucket(inv) === filter) &&
        (!q ||
          inv.patientName.toLowerCase().includes(q) ||
          inv.description.toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q)),
    );
  }, [invoices, filter, query]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Invoices</h1>
          <p className="mt-1.5 text-muted">
            Track every bill and see when it is paid.
          </p>
        </div>
        <Link href="/clinic/new" className="btn btn-primary hidden shrink-0 sm:inline-flex">
          <Icon name="plus" className="size-5" />
          New invoice
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-4">
        <Stat label="Paid" value={invoices ? counts.paidTotal.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"} unit="USDC received" tone="ok" />
        <Stat label="Pending" value={invoices ? String(counts.pending) : "-"} tone="warn" />
        <Stat label="Failed" value={invoices ? String(counts.failed) : "-"} tone="bad" />
      </div>

      <div className="relative mt-6">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          className="field !mt-0 !pl-12"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by patient or service"
          aria-label="Search invoices"
        />
      </div>

      <div className="noscroll -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="chip"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="opacity-75">{invoices ? counts[f.id] : ""}</span>
          </button>
        ))}
      </div>

      {loadError && (
        <p role="alert" className="mt-4 rounded-xl bg-bad-bg px-4 py-3 text-sm text-bad-fg">
          {loadError}
        </p>
      )}

      {invoices === null ? (
        <div className="mt-5 space-y-3" aria-label="Loading invoices">
          <div className="sheen h-20 rounded-2xl" />
          <div className="sheen h-20 rounded-2xl" />
          <div className="sheen h-20 rounded-2xl" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="card mt-5 flex flex-col items-center px-6 py-12 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-mint text-mintfg">
            <Icon name="list" className="size-7" />
          </span>
          <h2 className="mt-4 text-xl font-bold">No invoices yet</h2>
          <p className="mt-1 max-w-xs text-muted">
            Create your first invoice and it will show up here with its payment
            status.
          </p>
          <Link href="/clinic/new" className="btn btn-primary mt-6">
            Create an invoice
          </Link>
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-6 text-center text-muted">
          No invoices match that search or filter.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {shown.map((inv) => (
            <li key={inv.id} className="pop card flex items-center gap-2 p-2 pr-3">
              <Link
                href={`/pay/${inv.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-2.5 hover:bg-surface2"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-mintfg">
                  <Icon name="list" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{inv.patientName}</span>
                  <span className="block truncate text-sm text-muted">
                    {inv.description}
                  </span>
                  <span className="mt-1.5 block sm:hidden">
                    <StatusBadge status={inv.status} />
                  </span>
                </span>
                <span className="hidden sm:block">
                  <StatusBadge status={inv.status} />
                </span>
                <span className="shrink-0 text-right">
                  <span className="display block text-lg">{inv.amountUsdc}</span>
                  <span className="block text-xs text-muted">USDC</span>
                </span>
              </Link>
              <CopyButton
                value={`${origin}/pay/${inv.id}`}
                label="Link"
                className="!min-w-0 !px-3"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone: "ok" | "warn" | "bad";
}) {
  const tones = {
    ok: "bg-ok-bg text-ok-fg",
    warn: "bg-warn-bg text-warn-fg",
    bad: "bg-bad-bg text-bad-fg",
  };
  return (
    <div className="card p-3.5 sm:p-5">
      <span className={`pill ${tones[tone]}`}>{label}</span>
      <p className="display mt-3 truncate text-2xl sm:text-3xl">{value}</p>
      {unit && <p className="text-xs text-muted sm:text-sm">{unit}</p>}
    </div>
  );
}
