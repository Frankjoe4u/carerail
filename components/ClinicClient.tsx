"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Invoice } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { StatusBadge } from "./StatusBadge";

const INPUT =
  "mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-base outline-none placeholder:text-muted/60 focus:border-pine";
const STORE_KEY = "dhp-clinic";

interface FormState {
  clinicName: string;
  clinicNearAccount: string;
  patientName: string;
  description: string;
  amountUsdc: string;
}

const EMPTY: FormState = {
  clinicName: "",
  clinicNearAccount: "",
  patientName: "",
  description: "",
  amountUsdc: "",
};

export function ClinicClient() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [origin, setOrigin] = useState("");

  const loadInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/invoices", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setInvoices(data.invoices);
    } catch {
      /* keep the last list; the next poll retries */
    }
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "null");
      if (saved?.clinicName || saved?.clinicNearAccount) {
        setForm((f) => ({
          ...f,
          clinicName: saved.clinicName ?? "",
          clinicNearAccount: saved.clinicNearAccount ?? "",
        }));
      }
    } catch {
      /* storage unavailable: start with an empty form */
    }
    loadInvoices();
    const timer = setInterval(loadInvoices, 5000);
    return () => clearInterval(timer);
  }, [loadInvoices]);

  function update(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: "" }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFieldErrors({});
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFieldErrors(data.fields ?? {});
        setError(data.error ?? "Could not create the invoice.");
        return;
      }
      setCreated(data.invoice);
      try {
        localStorage.setItem(
          STORE_KEY,
          JSON.stringify({
            clinicName: form.clinicName,
            clinicNearAccount: form.clinicNearAccount,
          }),
        );
      } catch {
        /* optional convenience only */
      }
      setForm((f) => ({
        ...f,
        patientName: "",
        description: "",
        amountUsdc: "",
      }));
      loadInvoices();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const link = created ? `${origin}/pay/${created.id}` : "";

  return (
    <div className="grid gap-12 pt-4 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <section>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          New invoice
        </h1>
        <p className="mt-2 text-muted">
          The payer sees this bill and pays it from any chain. You receive USDC
          on NEAR.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          <Field label="Clinic name" error={fieldErrors.clinicName}>
            <input
              className={INPUT}
              value={form.clinicName}
              onChange={(e) => update("clinicName", e.target.value)}
              autoComplete="organization"
              required
            />
          </Field>
          <Field
            label="Clinic NEAR account"
            hint="Where the USDC is paid out, for example mycliniq.near"
            error={fieldErrors.clinicNearAccount}
          >
            <input
              className={`${INPUT} font-mono text-sm leading-6`}
              value={form.clinicNearAccount}
              onChange={(e) =>
                update("clinicNearAccount", e.target.value.toLowerCase())
              }
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </Field>
          <Field label="Patient name" error={fieldErrors.patientName}>
            <input
              className={INPUT}
              value={form.patientName}
              onChange={(e) => update("patientName", e.target.value)}
              required
            />
          </Field>
          <Field label="What is the bill for?" error={fieldErrors.description}>
            <input
              className={INPUT}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </Field>
          <Field label="Amount in USDC" error={fieldErrors.amountUsdc}>
            <input
              className={INPUT}
              value={form.amountUsdc}
              onChange={(e) => update("amountUsdc", e.target.value)}
              inputMode="decimal"
              placeholder="180.00"
              required
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-lg bg-coral-soft px-3.5 py-2.5 text-sm text-coral">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-[10px] bg-pine px-5 py-3 font-semibold text-white hover:bg-pine-deep disabled:opacity-60"
          >
            {busy ? "Creating invoice..." : "Create invoice"}
          </button>
        </form>

        {created && (
          <div className="mt-8 rounded-lg border border-pine/30 bg-mint/60 p-4">
            <p className="font-semibold text-pine-deep">Invoice created</p>
            <p className="mt-1 text-sm text-muted">
              Send this link to the person paying the bill.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-sm">
                {link}
              </code>
              <CopyButton value={link} label="Copy link" />
            </div>
            <a
              href={`/pay/${created.id}`}
              className="mt-3 inline-block text-sm font-semibold text-pine underline-offset-4 hover:underline"
            >
              Open the payer view
            </a>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Invoices</h2>
        {invoices === null ? (
          <p className="mt-4 text-muted">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="mt-4 max-w-sm text-muted">
            No invoices yet. Create your first invoice and it will show up here
            with its payment status.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {invoices.map((inv) => (
              <li key={inv.id}>
                <a
                  href={`/pay/${inv.id}`}
                  className="flex items-center justify-between gap-4 py-4 hover:bg-white/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{inv.patientName}</p>
                    <p className="truncate text-sm text-muted">
                      {inv.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="font-display font-bold">
                      {inv.amountUsdc} USDC
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-sm text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-sm text-coral">{error}</span>}
    </label>
  );
}
