"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { Invoice, PayToken } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { StatusBadge } from "./StatusBadge";

const CHAIN_NAMES: Record<string, string> = {
  eth: "Ethereum",
  base: "Base",
  arb: "Arbitrum",
  sol: "Solana",
  near: "NEAR",
  btc: "Bitcoin",
};

const INPUT =
  "mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 font-mono text-sm leading-6 outline-none placeholder:text-muted/60 focus:border-pine";

function chainName(chain: string) {
  return CHAIN_NAMES[chain] ?? chain;
}

function estimate(amountUsdc: string, token: PayToken): string {
  const value = Number(amountUsdc) / token.price;
  return value >= 1 ? value.toFixed(2) : value.toPrecision(3);
}

function countdown(deadline: string, now: number): string {
  const ms = Date.parse(deadline) - now;
  if (ms <= 0) return "expired";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function PayClient({ id }: { id: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [demo, setDemo] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [tokens, setTokens] = useState<PayToken[]>([]);
  const [tokenError, setTokenError] = useState("");
  const [assetId, setAssetId] = useState("");
  const [refundTo, setRefundTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const hadQuote = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`, { cache: "no-store" });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Could not load this invoice.");
        return;
      }
      const next: Invoice = data.invoice;
      if (
        hadQuote.current &&
        !next.quote &&
        next.status === "awaiting_payment"
      ) {
        setNotice("The payment window ran out. Request new payment details below.");
      }
      hadQuote.current = Boolean(next.quote);
      setLoadError("");
      setInvoice(next);
      setDemo(Boolean(data.demo));
    } catch {
      setLoadError("Could not reach the server. Check your connection.");
    }
  }, [id]);

  useEffect(() => {
    load();
    fetch("/api/tokens", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTokens(data.tokens);
        setAssetId((current) => current || data.tokens[0]?.assetId || "");
      })
      .catch((err: Error) =>
        setTokenError(err.message || "Could not load the list of tokens."),
      );
  }, [load]);

  const polling =
    Boolean(invoice?.quote) &&
    (invoice?.status === "awaiting_payment" || invoice?.status === "processing");

  useEffect(() => {
    if (!polling) return;
    const poll = setInterval(load, 3000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [polling, load]);

  async function requestQuote(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/invoices/${id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, refundTo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not get payment details.");
        return;
      }
      hadQuote.current = true;
      setInvoice(data.invoice);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function simulatePayment() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/invoices/${id}/simulate-payment`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not simulate the payment.");
        return;
      }
      setInvoice(data.invoice);
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <section className="pt-10">
        <h1 className="font-display text-3xl font-extrabold">Invoice not found</h1>
        <p className="mt-3 max-w-md text-muted">
          This link does not match an invoice. Ask the clinic to send the link
          again.
        </p>
      </section>
    );
  }

  if (!invoice) {
    return (
      <section className="pt-10 text-muted">
        {loadError || "Loading invoice..."}
      </section>
    );
  }

  const quote = invoice.quote;
  const selected = tokens.find((t) => t.assetId === assetId);
  const canPay = invoice.status === "awaiting_payment" || invoice.status === "failed" || invoice.status === "refunded";

  return (
    <div className="mx-auto max-w-xl pt-4">
      {demo && (
        <p className="mb-4 rounded-lg bg-amber-soft px-3.5 py-2.5 text-sm text-amber">
          Demo mode: no real money moves. Use the simulate button to see the
          full flow.
        </p>
      )}
      {loadError && (
        <p role="alert" className="mb-4 rounded-lg bg-coral-soft px-3.5 py-2.5 text-sm text-coral">
          {loadError}
        </p>
      )}

      <article className="slip shadow-[0_18px_40px_-24px_rgba(12,90,72,0.45)]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Bill from</p>
              <h1 className="font-display text-2xl font-extrabold tracking-tight">
                {invoice.clinicName}
              </h1>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="mt-6 text-sm text-muted">{invoice.patientName}</p>
          <p>{invoice.description}</p>
          <p className="mt-5 font-display text-5xl font-extrabold tracking-tight">
            {invoice.amountUsdc}{" "}
            <span className="text-2xl font-bold text-muted">USDC</span>
          </p>
        </div>

        <div className="slip-tear p-6 sm:p-8">
          {invoice.status === "paid" ? (
            <PaidView invoice={invoice} />
          ) : quote && (invoice.status === "awaiting_payment" || invoice.status === "processing") ? (
            <QuoteView
              invoice={invoice}
              now={now}
              demo={demo && quote.mock}
              busy={busy}
              onSimulate={simulatePayment}
            />
          ) : canPay ? (
            <form onSubmit={requestQuote} className="space-y-6">
              {(invoice.status === "failed" || invoice.status === "refunded") && (
                <p role="alert" className="rounded-lg bg-coral-soft px-3.5 py-2.5 text-sm text-coral">
                  {invoice.status === "refunded"
                    ? "The last payment did not complete and was refunded to the paying wallet. You can try again."
                    : "The last payment failed. You can try again."}
                </p>
              )}
              {notice && (
                <p role="status" className="rounded-lg bg-amber-soft px-3.5 py-2.5 text-sm text-amber">
                  {notice}
                </p>
              )}

              <fieldset>
                <legend className="text-sm font-semibold">
                  What do you want to pay with?
                </legend>
                {tokenError ? (
                  <p role="alert" className="mt-2 text-sm text-coral">
                    {tokenError}
                  </p>
                ) : tokens.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">Loading tokens...</p>
                ) : (
                  <div role="radiogroup" className="mt-2.5 flex flex-wrap gap-2">
                    {tokens.map((t) => {
                      const active = t.assetId === assetId;
                      return (
                        <button
                          key={t.assetId}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setAssetId(t.assetId)}
                          className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                            active
                              ? "border-pine bg-pine text-white"
                              : "border-line bg-white hover:border-pine"
                          }`}
                        >
                          {t.symbol}
                          <span className={active ? "text-white/75" : "text-muted"}>
                            {" "}
                            on {chainName(t.blockchain)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selected && (
                  <p className="mt-3 text-sm text-muted">
                    About {estimate(invoice.amountUsdc, selected)} {selected.symbol}.
                    The exact amount is confirmed in the next step.
                  </p>
                )}
              </fieldset>

              <label className="block">
                <span className="text-sm font-semibold">
                  {selected
                    ? `Your ${chainName(selected.blockchain)} wallet address`
                    : "Your wallet address"}
                </span>
                <input
                  className={INPUT}
                  value={refundTo}
                  onChange={(e) => setRefundTo(e.target.value.trim())}
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                />
                <span className="mt-1 block text-sm text-muted">
                  Only used to return your money if the payment fails.
                </span>
              </label>

              {error && (
                <p role="alert" className="rounded-lg bg-coral-soft px-3.5 py-2.5 text-sm text-coral">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !assetId}
                className="w-full rounded-[10px] bg-pine px-5 py-3 font-semibold text-white hover:bg-pine-deep disabled:opacity-60"
              >
                {busy ? "Getting payment details..." : "Get payment details"}
              </button>
            </form>
          ) : null}
        </div>
      </article>
    </div>
  );
}

function QuoteView({
  invoice,
  now,
  demo,
  busy,
  onSimulate,
}: {
  invoice: Invoice;
  now: number;
  demo: boolean;
  busy: boolean;
  onSimulate: () => void;
}) {
  const quote = invoice.quote!;
  const chain = chainName(quote.originChain);
  const processing = invoice.status === "processing";
  const sent = Boolean(quote.simulatedDepositAt);

  return (
    <div className="space-y-6">
      <Progress status={invoice.status} />

      {processing ? (
        <p className="text-muted">
          Your payment arrived. It is being converted to USDC and sent to{" "}
          {invoice.clinicName}. This usually takes a minute or two.
        </p>
      ) : (
        <>
          <div>
            <p className="text-sm text-muted">
              Send exactly this amount on {chain}
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="font-display text-2xl font-extrabold">
                {quote.amountInFormatted} {quote.originSymbol}
              </p>
              <CopyButton value={quote.amountInFormatted} />
            </div>
          </div>

          <div>
            <p className="text-sm text-muted">To this deposit address</p>
            <div className="mt-1.5 flex items-center gap-3">
              <code className="min-w-0 flex-1 break-all rounded-lg bg-paper px-3 py-2.5 text-sm">
                {quote.depositAddress}
              </code>
              <CopyButton value={quote.depositAddress} />
            </div>
          </div>

          <p className="text-sm text-muted">
            Send from {chain} only, and send this exact token and amount. These
            details are valid for{" "}
            <span className="font-semibold text-ink">
              {countdown(quote.deadline, now)}
            </span>
            .
          </p>

          {demo && !sent && (
            <button
              type="button"
              onClick={onSimulate}
              disabled={busy}
              className="w-full rounded-[10px] border border-pine px-5 py-3 font-semibold text-pine hover:bg-mint disabled:opacity-60"
            >
              Simulate the payment
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Progress({ status }: { status: Invoice["status"] }) {
  const step = status === "processing" ? 1 : 0;
  const labels = ["Waiting for your payment", "Converting", "Clinic paid"];
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Payment progress">
      {labels.map((label, i) => (
        <li
          key={label}
          aria-current={i === step ? "step" : undefined}
          className={`flex items-center gap-2 ${i === step ? "font-semibold text-ink" : "text-muted"}`}
        >
          <span
            aria-hidden
            className={`size-2.5 rounded-full ${
              i < step ? "bg-pine" : i === step ? "animate-pulse bg-amber" : "bg-line"
            }`}
          />
          {label}
          {i < labels.length - 1 && <span aria-hidden className="mx-1 h-px w-4 bg-line" />}
        </li>
      ))}
    </ol>
  );
}

function PaidView({ invoice }: { invoice: Invoice }) {
  const quote = invoice.quote;
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="space-y-1 text-sm">
        <p className="font-semibold">
          {invoice.clinicName} received {invoice.amountUsdc} USDC
        </p>
        <p className="text-muted">
          Sent to <span className="font-mono">{invoice.clinicNearAccount}</span> on NEAR
        </p>
        {quote && (
          <p className="text-muted">
            Paid with {quote.amountInFormatted} {quote.originSymbol} on{" "}
            {chainName(quote.originChain)}
          </p>
        )}
        {invoice.paidAt && (
          <p className="text-muted">
            {new Date(invoice.paidAt).toLocaleString()}
          </p>
        )}
      </div>
      <span className="stamp shrink-0" aria-label="Paid">
        PAID
      </span>
    </div>
  );
}
