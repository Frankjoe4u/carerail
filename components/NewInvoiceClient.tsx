"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { Invoice } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { Icon } from "./Icons";

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

const STEP_ONE: (keyof FormState)[] = ["patientName", "description", "amountUsdc"];

const REQUIRED_MESSAGES: Partial<Record<keyof FormState, string>> = {
  patientName: "Enter the patient's name.",
  description: "Say what the bill is for.",
  amountUsdc: "Enter the amount in USDC.",
  clinicName: "Enter the clinic's name.",
  clinicNearAccount: "Enter the clinic's NEAR account.",
};

export function NewInvoiceClient() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Invoice | null>(null);
  const [origin, setOrigin] = useState("");

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
  }, []);

  function update(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: "" }));
  }

  function missing(keys: (keyof FormState)[]) {
    const errs: Record<string, string> = {};
    for (const k of keys) {
      if (!form[k].trim()) errs[k] = REQUIRED_MESSAGES[k] ?? "Required.";
    }
    return errs;
  }

  function next(e: FormEvent) {
    e.preventDefault();
    const errs = missing(STEP_ONE);
    setFieldErrors(errs);
    if (Object.keys(errs).length === 0) setStep(2);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs = missing(["clinicName", "clinicNearAccount"]);
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const fields: Record<string, string> = data.fields ?? {};
        setFieldErrors(fields);
        setError(data.error ?? "Could not create the invoice.");
        // Send the person to the step that holds the problem
        if (STEP_ONE.some((k) => fields[k])) setStep(1);
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
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function another() {
    setCreated(null);
    setStep(1);
    setError("");
    setForm((f) => ({ ...f, patientName: "", description: "", amountUsdc: "" }));
  }

  if (created) {
    const link = `${origin}/pay/${created.id}`;
    return (
      <div className="pop mx-auto max-w-lg">
        <div className="card relative overflow-hidden p-6 text-center sm:p-8">
          <span className="success-ring mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#08707a] to-[#0b857a] text-white shadow-[0_14px_30px_-10px_rgba(45,212,191,0.8)]">
            <Icon name="check" className="size-10" />
          </span>
          <h1 className="display mt-5 text-3xl">Invoice created</h1>
          <p className="mt-2 text-muted">
            Send this link to the person paying the bill for {created.patientName}.
          </p>

          <div className="inset mt-6 p-4 text-left">
            <p className="text-sm text-muted">Amount due</p>
            <p className="display mt-0.5 text-3xl">
              {created.amountUsdc} <span className="text-lg text-muted">USDC</span>
            </p>
            <p className="mt-1 truncate text-sm text-muted">{created.description}</p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <code className="inset min-w-0 flex-1 truncate px-3 py-3 text-left text-sm">
              {link}
            </code>
            <CopyButton value={link} label="Copy link" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href={`/pay/${created.id}`} className="btn btn-primary">
              Open payer view
            </Link>
            <button type="button" onClick={another} className="btn btn-soft">
              Create another
            </button>
          </div>
          <Link
            href="/clinic"
            className="mt-4 inline-flex min-h-11 items-center font-bold text-primary hover:underline"
          >
            Back to invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-3">
        {step === 2 ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            aria-label="Back to bill details"
            className="grid size-11 place-items-center rounded-full border border-line bg-surface hover:border-primary"
          >
            <Icon name="back" />
          </button>
        ) : (
          <Link
            href="/clinic"
            aria-label="Back to invoices"
            className="grid size-11 place-items-center rounded-full border border-line bg-surface hover:border-primary"
          >
            <Icon name="back" />
          </Link>
        )}
        <h1 className="display text-3xl">New invoice</h1>
      </div>

      <div className="mt-5" aria-label={`Step ${step} of 2`}>
        <div className="flex justify-between text-sm font-semibold">
          <span>{step === 1 ? "Bill details" : "Where to get paid"}</span>
          <span className="text-muted">Step {step} of 2</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#08707a] to-[#2dd4bf] transition-[width] duration-500"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      {step === 1 ? (
        <form key="s1" onSubmit={next} className="card pop mt-6 space-y-5 p-5 sm:p-6" noValidate>
          <Field label="Patient name" error={fieldErrors.patientName}>
            <input
              className="field"
              value={form.patientName}
              onChange={(e) => update("patientName", e.target.value)}
              autoComplete="off"
              enterKeyHint="next"
            />
          </Field>
          <Field label="What is the bill for?" error={fieldErrors.description}>
            <input
              className="field"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              autoComplete="off"
              placeholder="Antenatal scan and consultation"
              enterKeyHint="next"
            />
          </Field>
          <Field label="Amount in USDC" error={fieldErrors.amountUsdc}>
            <input
              className="field"
              value={form.amountUsdc}
              onChange={(e) => update("amountUsdc", e.target.value)}
              inputMode="decimal"
              placeholder="180.00"
              autoComplete="off"
            />
          </Field>
          <button type="submit" className="btn btn-primary w-full">
            Continue
            <Icon name="arrow" className="size-5" />
          </button>
        </form>
      ) : (
        <form key="s2" onSubmit={submit} className="card pop mt-6 space-y-5 p-5 sm:p-6" noValidate>
          <div className="inset flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate font-bold">{form.patientName}</p>
              <p className="truncate text-sm text-muted">{form.description}</p>
            </div>
            <p className="display shrink-0 text-xl">
              {form.amountUsdc} <span className="text-sm text-muted">USDC</span>
            </p>
          </div>

          <Field label="Clinic name" error={fieldErrors.clinicName}>
            <input
              className="field"
              value={form.clinicName}
              onChange={(e) => update("clinicName", e.target.value)}
              autoComplete="organization"
              enterKeyHint="next"
            />
          </Field>
          <Field
            label="Clinic NEAR account"
            hint="Where the USDC is paid out, for example mycliniq.near"
            error={fieldErrors.clinicNearAccount}
          >
            <input
              className="field font-mono !text-[15px]"
              value={form.clinicNearAccount}
              onChange={(e) => update("clinicNearAccount", e.target.value.toLowerCase())}
              autoCapitalize="none"
              spellCheck={false}
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-xl bg-bad-bg px-4 py-3 text-sm text-bad-fg">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy && <span className="spinner" aria-hidden />}
            {busy ? "Creating invoice..." : "Create invoice"}
          </button>
        </form>
      )}
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
      <span className="text-sm font-bold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-sm text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1.5 block text-sm font-semibold text-bad-fg">
          {error}
        </span>
      )}
    </label>
  );
}
