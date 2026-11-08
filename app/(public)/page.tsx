import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icons";
import { LogoMark } from "@/components/Logo";

const TRUST = [
  { icon: "globe", label: "Cross-border payments" },
  { icon: "wallet", label: "Many networks and tokens" },
  { icon: "eye", label: "Clear quotes" },
  { icon: "shield", label: "Refund protection" },
  { icon: "lock", label: "No custody of funds" },
];

const FEATURES = [
  { icon: "globe", title: "Pay from anywhere", body: "Settle bills across borders with the assets you already hold." },
  { icon: "wallet", title: "Multiple crypto options", body: "Pay from Ethereum, Base, Arbitrum or NEAR with supported tokens." },
  { icon: "shield", title: "Clinics get paid in full", body: "The clinic receives the exact invoiced amount in USDC on NEAR." },
  { icon: "bolt", title: "Fast, transparent", body: "NEAR Intents handles the conversion. You see the amount before you send." },
];

const STEPS = [
  { icon: "list", title: "Invoice is created", body: "The clinic creates an invoice and shares the link." },
  { icon: "wallet", title: "You make payment", body: "Open the link, pick a token and send to the deposit address." },
  { icon: "checkcircle", title: "Clinic gets paid", body: "The clinic receives the exact amount in USDC on NEAR." },
];

const CHECKS = [
  "Receive payments in USDC on NEAR",
  "Families pay from the chain they already use",
  "Refund address required, so failed payments return",
  "One place to see every invoice and its status",
];

const TOKENS = ["NEAR", "USDC", "USDT", "ETH", "ARB"];

const FAQS = [
  [
    "What do I need to pay a bill?",
    "The invoice link from the clinic and a crypto wallet with a supported token on Ethereum, Base, Arbitrum or NEAR. You pick the token, and CareRail shows the exact amount to send.",
  ],
  [
    "What does the clinic receive?",
    "The amount on the invoice, in USDC on NEAR, sent to the clinic's NEAR account. The conversion is handled by NEAR Intents.",
  ],
  [
    "What if the payment fails?",
    "You enter a refund address before you pay. If the payment cannot be completed, the funds are returned to that address.",
  ],
  [
    "Does CareRail hold my money?",
    "No. CareRail never takes custody of funds. You send to a deposit address created for your payment, and the conversion is done by NEAR Intents.",
  ],
];

function InvoiceCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card pop p-4 text-fg ${className}`} style={{ animationDelay: "500ms" }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold">Invoice #CR-1024</p>
        <span className="pill bg-ok-bg text-ok-fg">Paid</span>
      </div>
      <div className="mt-3 flex items-center gap-2.5 lg:hidden">
        <span className="grid size-8 place-items-center rounded-lg bg-mint text-mintfg">
          <Icon name="building" className="size-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">Sample Clinic</p>
          <p className="text-xs text-muted">Lagos, Nigeria</p>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
        <div>
          <p className="text-[11px] text-muted">Amount due</p>
          <p className="text-lg font-bold leading-tight">$180.00</p>
        </div>
        <p className="text-xs font-semibold text-muted">180.00 USDC</p>
      </div>
      <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-ok-bg px-2.5 py-2 text-xs lg:hidden font-semibold text-ok-fg">
        <Icon name="checkcircle" className="size-4" />
        Invoice paid successfully
      </p>
    </div>
  );
}

function PayCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`card pop rounded-b-none rounded-r-none p-3.5 text-fg sm:p-4 ${className}`}
      style={{ animationDelay: "700ms" }}
    >
      <p className="text-xs font-bold sm:text-sm">Pay with crypto</p>
      <p className="mt-1 text-[11px] text-muted">You pay (example)</p>
      <p className="text-lg font-bold leading-tight sm:text-xl">≈ 0.842 NEAR</p>
      <ul className="mt-2.5 hidden grid-cols-3 gap-1.5 sm:grid">
        {TOKENS.map((t, i) => (
          <li
            key={t}
            className={`rounded-lg border px-2 py-1.5 text-center text-[11px] font-bold ${
              i === 0 ? "border-primary bg-mint text-mintfg" : "border-line text-muted"
            }`}
          >
            {t}
          </li>
        ))}
        <li className="rounded-lg border border-line px-2 py-1.5 text-center text-[11px] font-bold text-muted">More</li>
      </ul>
      <Link href="/pay" className="btn btn-primary mt-2.5 !min-h-9 w-full !rounded-lg !px-2 text-xs">
        <Icon name="lock" className="size-3.5" />
        Pay securely
      </Link>
    </div>
  );
}

function DashboardCard({ className = "" }: { className?: string }) {
  const rows = [
    ["Ada O.", "INV-1024", "180.00"],
    ["Tunde A.", "INV-1023", "95.00"],
    ["Ngozi E.", "INV-1022", "240.00"],
  ];
  return (
    <div className={`card p-4 text-fg ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold">Clinic dashboard</p>
        <span className="pill bg-surface2 text-muted">Sample data</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[["Received", "515 USDC"], ["Paid", "3"], ["Pending", "1"]].map(([k, v]) => (
          <div key={k} className="inset p-2">
            <p className="text-[10px] text-muted">{k}</p>
            <p className="text-sm font-bold leading-tight">{v}</p>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 200 44" className="mt-3 h-10 w-full text-primary" preserveAspectRatio="none" aria-hidden>
        <path d="M0 36 C20 30 30 34 50 24 S85 28 105 18 S150 22 170 10 S190 8 200 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <ul className="mt-2 divide-y divide-line">
        {rows.map(([n, id, amt]) => (
          <li key={id} className="flex items-center gap-2.5 py-2 text-xs">
            <span className="grid size-6 place-items-center rounded-full bg-mint text-mintfg">
              <Icon name="check" className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold">{n} <span className="font-normal text-muted">{id}</span></span>
            <span className="font-bold">{amt}</span>
            <span className="pill bg-ok-bg text-ok-fg">Paid</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero-panel relative overflow-hidden rounded-[28px] px-5 pb-8 pt-8 sm:px-10 sm:pt-10 lg:px-12 lg:pb-10 lg:pt-12">
        <div className="relative grid items-center gap-9 lg:grid-cols-[1fr_1fr] lg:gap-10">
          <div className="relative z-10">
            <span className="enter pill border border-line bg-mint text-mintfg">
              <span className="dot-live" /> Powered by NEAR Intents
            </span>
            <h1 className="enter display mt-5 text-balance text-[2.6rem] sm:text-6xl lg:text-[3.6rem]" style={{ "--d": "80ms" } as React.CSSProperties}>
              Healthcare payments,{" "}
              <span className="grad-text">made simpler.</span>
            </h1>
            <p className="hp-muted enter mt-5 max-w-md text-lg leading-relaxed" style={{ "--d": "160ms" } as React.CSSProperties}>
              Pay medical invoices with crypto from anywhere in the world.
              Clinics receive the exact amount in USDC on NEAR.
            </p>
            <div className="enter mt-7 flex flex-col gap-3 sm:flex-row" style={{ "--d": "240ms" } as React.CSSProperties}>
              <Link href="/pay" className="btn btn-primary !rounded-lg">
                Pay a medical invoice
                <Icon name="arrow" className="size-5" />
              </Link>
              <Link href="/clinic" className="btn !rounded-lg border border-line bg-white/5 hover:bg-white/10">
                For healthcare providers
              </Link>
            </div>
            <ul className="enter mt-8 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5" style={{ "--d": "320ms" } as React.CSSProperties}>
              {TRUST.map((t) => (
                <li key={t.label} className="flex flex-col items-start gap-2">
                  <span className="text-[#2dd4bf] [[data-theme=light]_&]:text-[#0a7a80]">
                    <Icon name={t.icon} className="size-6" />
                  </span>
                  <span className="hp-muted text-xs font-semibold leading-snug">{t.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="enter relative" style={{ "--d": "180ms" } as React.CSSProperties}>
            <div className="relative aspect-[1140/910] overflow-hidden rounded-[24px] ring-1 ring-white/15">
              <Image
                src="/images/hero.webp"
                alt="A patient smiling at her phone beside a doctor"
                width={1140}
                height={910}
                priority
                sizes="(min-width: 1024px) 520px, 100vw"
                unoptimized className="absolute inset-0 size-full object-cover"
              />
              <PayCard className="absolute bottom-0 right-0 w-[56%] sm:w-[48%]" />
            </div>
            <InvoiceCard className="mt-4 lg:absolute lg:-left-6 lg:top-6 lg:mt-0 lg:w-56" />
          </div>
        </div>
      </section>

      {/* Why */}
      <section aria-label="Why CareRail" className="pt-14 text-center">
        <span className="pill bg-mint text-mintfg">Why CareRail?</span>
        <h2 className="display mt-3 text-3xl sm:text-4xl">Payments built for modern healthcare</h2>
        <p className="mt-2 text-muted">CareRail makes it easy to pay a clinic from the chain you already use.</p>
        <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card flex items-start gap-3 p-4 sm:p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-mintfg">
                <Icon name={f.icon} />
              </span>
              <div>
                <h3 className="font-bold leading-snug">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-6 pt-16 text-center">
        <span className="pill bg-mint text-mintfg">How it works</span>
        <h2 className="display mt-3 text-3xl sm:text-4xl">Three simple steps</h2>
        <p className="mt-2 text-muted">From invoice to payment, completed in minutes.</p>
        <ol className="relative mt-9 grid gap-4 text-left md:grid-cols-3">
          <span aria-hidden className="absolute left-[16%] right-[16%] top-[2.4rem] hidden border-t-2 border-dashed border-primary/40 md:block" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="card relative flex items-center gap-4 p-4 sm:p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#08707a] to-[#0b857a] text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-mint text-mintfg">
                <Icon name={s.icon} className="size-6" />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold leading-snug">{s.title}</h3>
                <p className="mt-0.5 text-sm text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Providers */}
      <section
        className="relative mt-16 overflow-hidden rounded-[28px] px-5 py-9 text-white sm:px-10 sm:py-12"
        style={{ background: "linear-gradient(120deg, #07204d 0%, #0a3a7a 55%, #0b6b86 100%)" }}
      >
        <div className="relative grid items-center gap-9 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <div>
            <span className="pill bg-white/10 text-[#5eead4]">For healthcare providers</span>
            <h2 className="display mt-3 text-balance text-3xl sm:text-4xl">
              Grow your practice. <span className="text-[#5eead4]">We&apos;ll handle the payments.</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-white/80">
              Spend less time on complicated payment arrangements and give
              patients a flexible way to settle medical bills.
            </p>
            <ul className="mt-6 space-y-3">
              {CHECKS.map((c) => (
                <li key={c} className="flex items-start gap-3 font-semibold">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#2dd4bf] text-[#04222a]">
                    <Icon name="check" className="size-4" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <Link href="/clinic/new" className="btn mt-7 !rounded-lg bg-white text-[#06304a]">
              Get started as a clinic
              <Icon name="arrow" className="size-5" />
            </Link>
          </div>

          <div className="relative">
            <div className="relative aspect-[735/594] overflow-hidden rounded-[24px] ring-1 ring-white/20">
              <Image
                src="/images/provider.webp"
                alt="A doctor with her arms crossed, smiling"
                width={735}
                height={594}
                sizes="(min-width: 1024px) 520px, 100vw"
                unoptimized className="absolute inset-0 size-full object-cover"
              />
            </div>
            <DashboardCard className="mt-4 lg:absolute lg:-bottom-8 lg:-left-12 lg:mt-0 lg:w-[22rem]" />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="mx-auto max-w-3xl scroll-mt-6 pt-16">
        <h2 className="display text-center text-3xl sm:text-4xl">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {FAQS.map(([q, a]) => (
            <details key={q} className="card group px-5 py-1">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint text-mintfg transition-transform group-open:rotate-45">
                  <Icon name="plus" className="size-4" />
                </span>
              </summary>
              <p className="pb-4 leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing banner */}
      <section
        className="relative mt-16 overflow-hidden rounded-[28px] px-6 py-9 text-white sm:px-10 sm:py-10"
        style={{ background: "linear-gradient(120deg, #0a7a86 0%, #0e9aa0 55%, #1cc3b2 100%)" }}
      >
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
          <div className="flex items-center gap-3 md:border-r md:border-white/30 md:pr-10">
            <LogoMark className="size-14 !bg-white/20" />
            <span className="display text-3xl">CareRail</span>
          </div>
          <div className="flex-1">
            <h2 className="display text-2xl sm:text-3xl">Care should come first. Payments should be easier.</h2>
            <p className="mt-2 max-w-xl text-white/85">
              Whether you&apos;re paying for someone you love or running a healthcare facility, CareRail brings a simpler payment experience within reach.
            </p>
          </div>
          <Link href="/clinic/new" className="btn shrink-0 !rounded-lg bg-white text-[#06505a]">
            Create an invoice
            <Icon name="arrow" className="size-5" />
          </Link>
        </div>
      </section>
    </>
  );
}


