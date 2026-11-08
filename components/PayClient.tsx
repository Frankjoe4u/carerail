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
import { Icon } from "./Icons";
import { LogoMark } from "./Logo";
import { StatusBadge } from "./StatusBadge";

const CHAIN_NAMES: Record<string, string> = {
  eth: "Ethereum",
  base: "Base",
  arb: "Arbitrum",
  sol: "Solana",
  near: "NEAR",
  btc: "Bitcoin",
};

const TOKEN_COLORS: Record<string, string> = {
  USDC: "#2775ca",
  USDT: "#26a17b",
  ETH: "#627eea",
  NEAR: "#111111",
  wNEAR: "#111111",
  BTC: "#f7931a",
  SOL: "#7c3aed",
};

function TokenIcon({ symbol }: { symbol: string }) {
  return (
    <span
      aria-hidden
      className="grid size-10 shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-white"
      style={{ background: TOKEN_COLORS[symbol] ?? "#475569" }}
    >
      {symbol.length > 4 ? symbol.slice(0, 2) : symbol}
    </span>
  );
}

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
      <section className="mx-auto max-w-md pt-12 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-bad-bg text-bad-fg">
          <Icon name="alert" className="size-8" />
        </span>
        <h1 className="display mt-5 text-3xl">Invoice not found</h1>
        <p className="mt-2 text-muted">
          This link does not match an invoice. Ask the clinic to send the link
          again.
        </p>
      </section>
    );
  }

  if (!invoice) {
    return (
      <section className="mx-auto max-w-lg pt-6" aria-busy="true">
        {loadError ? (
          <p role="alert" className="rounded-xl bg-bad-bg px-4 py-3 text-bad-fg">{loadError}</p>
        ) : (
          <div className="space-y-4">
            <div className="sheen h-56 rounded-3xl" />
            <div className="sheen h-72 rounded-3xl" />
          </div>
        )}
      </section>
    );
  }

  const quote = invoice.quote;
  const selected = tokens.find((t) => t.assetId === assetId);
  const canPay =
    invoice.status === "awaiting_payment" ||
    invoice.status === "failed" ||
    invoice.status === "refunded";
  const showQuote =
    quote && (invoice.status === "awaiting_payment" || invoice.status === "processing");

  if (invoice.status === "paid") {
    return (
      <div className="mx-auto max-w-lg pt-4">
        {demo && <DemoNote />}
        <PaidView invoice={invoice} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg pt-4">
      {demo && <DemoNote />}
      {loadError && (
        <p role="alert" className="mb-4 rounded-xl bg-bad-bg px-4 py-3 text-sm text-bad-fg">
          {loadError}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <h1 className="display text-3xl">Bill summary</h1>
        <StatusBadge status={invoice.status} />
      </div>

      <article className="card mt-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark className="size-11" />
            <div className="min-w-0">
              <p className="text-xs text-muted">Bill from</p>
              <p className="display truncate text-xl">{invoice.clinicName}</p>
            </div>
          </div>
        </div>
        <dl className="mt-5 space-y-3 text-[0.95rem]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Patient</dt>
            <dd className="text-right font-semibold">{invoice.patientName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Service</dt>
            <dd className="text-right font-semibold">{invoice.description}</dd>
          </div>
        </dl>
        <div className="mt-5 flex items-end justify-between gap-3 rounded-2xl bg-mint p-4">
          <div>
            <p className="text-sm text-muted">Amount due</p>
            <p className="display mt-1 whitespace-nowrap text-[2.6rem] sm:text-5xl">
              {invoice.amountUsdc}
            </p>
          </div>
          <p className="display pb-1 text-xl text-muted">USDC</p>
        </div>
      </article>

      {showQuote ? (
        <QuoteView
          invoice={invoice}
          now={now}
          demo={demo && quote.mock}
          busy={busy}
          error={error}
          onSimulate={simulatePayment}
        />
      ) : canPay ? (
        <form onSubmit={requestQuote} className="mt-6">
          {(invoice.status === "failed" || invoice.status === "refunded") && (
            <p role="alert" className="mb-4 rounded-xl bg-bad-bg px-4 py-3 text-sm text-bad-fg">
              {invoice.status === "refunded"
                ? "The last payment did not complete and was refunded to the paying wallet. You can try again."
                : "The last payment failed. You can try again."}
            </p>
          )}
          {notice && (
            <p role="status" className="mb-4 rounded-xl bg-warn-bg px-4 py-3 text-sm text-warn-fg">
              {notice}
            </p>
          )}

          <fieldset>
            <legend className="text-lg font-bold">Choose payment method</legend>
            {tokenError ? (
              <p role="alert" className="mt-2 text-sm text-bad-fg">{tokenError}</p>
            ) : tokens.length === 0 ? (
              <div className="mt-3 space-y-2.5" aria-label="Loading tokens">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="sheen h-16 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div role="radiogroup" aria-label="Payment method" className="mt-3 space-y-2.5">
                {tokens.map((t) => (
                  <button
                    key={t.assetId}
                    type="button"
                    role="radio"
                    aria-checked={t.assetId === assetId}
                    onClick={() => setAssetId(t.assetId)}
                    className="option"
                  >
                    <TokenIcon symbol={t.symbol} />
                    <span className="min-w-0">
                      <span className="block font-bold">{t.symbol}</span>
                      <span className="block text-sm text-muted">{chainName(t.blockchain)}</span>
                    </span>
                    <span className="ml-auto mr-2 hidden text-right text-sm text-muted min-[380px]:block">
                      about {estimate(invoice.amountUsdc, t)}
                    </span>
                    <span className="radio !ml-0" aria-hidden />
                  </button>
                ))}
              </div>
            )}
            {selected && (
              <p className="mt-3 text-sm text-muted">
                The exact amount is confirmed in the next step.
              </p>
            )}
          </fieldset>

          <label className="mt-6 block">
            <span className="font-bold">
              {selected
                ? `Your ${chainName(selected.blockchain)} wallet address`
                : "Your wallet address"}
            </span>
            <input
              className="field font-mono !text-[15px]"
              value={refundTo}
              onChange={(e) => setRefundTo(e.target.value.trim())}
              autoCapitalize="none"
              spellCheck={false}
              required
            />
            <span className="mt-1.5 block text-sm text-muted">
              Only used to return your money if the payment fails.
            </span>
          </label>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-bad-bg px-4 py-3 text-sm text-bad-fg">
              {error}
            </p>
          )}

          <div className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-10 mt-6">
            <button type="submit" disabled={busy || !assetId} className="btn btn-primary w-full">
              {busy && <span className="spinner" aria-hidden />}
              {busy ? "Getting payment details..." : "Get payment details"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function DemoNote() {
  return (
    <p className="pop mb-4 rounded-xl bg-warn-bg px-4 py-3 text-sm text-warn-fg">
      Demo mode: no real money moves. Use the simulate button to see the full
      flow.
    </p>
  );
}

function QuoteView({
  invoice,
  now,
  demo,
  busy,
  error,
  onSimulate,
}: {
  invoice: Invoice;
  now: number;
  demo: boolean;
  busy: boolean;
  error: string;
  onSimulate: () => void;
}) {
  const quote = invoice.quote!;
  const chain = chainName(quote.originChain);
  const processing = invoice.status === "processing";
  const sent = Boolean(quote.simulatedDepositAt);

  return (
    <section className="pop mt-6">
      <Progress status={invoice.status} />

      <div className="card mt-4 space-y-5 p-5 sm:p-6">
        {processing ? (
          <div className="text-center">
            <span className="dot-live mx-auto grid size-14 place-items-center rounded-full bg-info-bg text-info-fg">
              <span className="spinner" aria-hidden />
            </span>
            <h2 className="display mt-4 text-2xl">Payment received</h2>
            <p className="mt-1.5 text-muted">
              It is being converted to USDC and sent to {invoice.clinicName}.
              This usually takes a minute or two.
            </p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm text-muted">Send exactly this amount on {chain}</p>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <p className="display text-3xl">
                  {quote.amountInFormatted} {quote.originSymbol}
                </p>
                <CopyButton value={quote.amountInFormatted} />
              </div>
            </div>

            <div>
              <p className="text-sm text-muted">To this deposit address</p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <code className="inset min-w-0 flex-1 break-all px-3 py-3 text-sm">
                  {quote.depositAddress}
                </code>
                <CopyButton value={quote.depositAddress} />
              </div>
            </div>

            <p className="rounded-xl bg-warn-bg px-4 py-3 text-sm text-warn-fg">
              Send from {chain} only, and send this exact token and amount.
              These details are valid for{" "}
              <strong>{countdown(quote.deadline, now)}</strong>.
            </p>

            {error && (
              <p role="alert" className="rounded-xl bg-bad-bg px-4 py-3 text-sm text-bad-fg">
                {error}
              </p>
            )}

            {demo && !sent && (
              <button type="button" onClick={onSimulate} disabled={busy} className="btn btn-primary w-full">
                {busy && <span className="spinner" aria-hidden />}
                Simulate the payment
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Progress({ status }: { status: Invoice["status"] }) {
  const step = status === "processing" ? 1 : 0;
  const labels = ["Send payment", "Converting", "Clinic paid"];
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Payment progress">
      {labels.map((label, i) => (
        <li
          key={label}
          aria-current={i === step ? "step" : undefined}
          className="flex flex-col items-center gap-1.5 text-center text-xs font-semibold sm:text-sm"
        >
          <span
            className={`grid size-8 place-items-center rounded-full text-sm font-bold ${
              i < step
                ? "bg-primary text-white"
                : i === step
                  ? "bg-info-bg text-info-fg dot-live"
                  : "bg-surface2 text-muted"
            }`}
          >
            {i < step ? <Icon name="check" className="size-4" /> : i + 1}
          </span>
          <span className={i === step ? "text-fg" : "text-muted"}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

const CONFETTI = [
  ["#1fc88b", -150, -90, 200, 0],
  ["#3fa9ff", -110, -140, -160, 40],
  ["#f5b041", -60, -110, 260, 20],
  ["#1fc88b", -20, -160, -220, 70],
  ["#3fa9ff", 30, -120, 180, 10],
  ["#f5b041", 80, -150, -140, 60],
  ["#1fc88b", 120, -100, 240, 30],
  ["#3fa9ff", 160, -70, -200, 0],
  ["#f5b041", -130, -30, 150, 90],
  ["#1fc88b", 140, -20, -170, 50],
] as const;

function PaidView({ invoice }: { invoice: Invoice }) {
  const quote = invoice.quote;
  const ref = `CR-${invoice.id.slice(-8).toUpperCase()}`;
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => setPageUrl(window.location.href), []);

  return (
    <div className="card pop relative overflow-hidden p-6 text-center sm:p-8">
      <div className="confetti" aria-hidden>
        {CONFETTI.map(([c, x, y, r, dl], i) => (
          <i
            key={i}
            style={
              {
                "--c": c,
                "--x": `${x}px`,
                "--y": `${y}px`,
                "--r": `${r}deg`,
                "--dl": `${dl + 250}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <span className="success-ring mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#07694a] to-[#0d8559] text-white shadow-[0_14px_30px_-10px_rgba(20,166,115,0.8)]">
        <Icon name="check" className="size-10" />
      </span>
      <h1 className="display mt-5 text-3xl">Payment successful</h1>
      <p className="mt-2 text-muted">
        {invoice.clinicName} received{" "}
        <strong className="text-fg">{invoice.amountUsdc} USDC</strong>.
      </p>

      <dl className="inset mt-6 divide-y divide-line text-left text-[0.95rem]">
        <Row label="Patient">{invoice.patientName}</Row>
        {quote && (
          <Row label="Paid with">
            {quote.amountInFormatted} {quote.originSymbol} on {chainName(quote.originChain)}
          </Row>
        )}
        <Row label="Settled to">
          <span className="font-mono text-sm">{invoice.clinicNearAccount}</span> on NEAR
        </Row>
        {invoice.paidAt && (
          <Row label="Date">{new Date(invoice.paidAt).toLocaleString()}</Row>
        )}
        <Row label="Invoice ref">
          <span className="font-mono text-sm">{ref}</span>
        </Row>
      </dl>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <CopyButton value={pageUrl} label="Copy receipt link" className="!min-h-[52px] !w-full !text-base" />
        <a href="/" className="btn btn-soft">
          Back to home
        </a>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right font-semibold">{children}</dd>
    </div>
  );
}
