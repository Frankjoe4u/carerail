import Link from "next/link";
import { Icon } from "@/components/Icons";
import { LogoMark } from "@/components/Logo";

const NETWORKS = [
  { name: "Ethereum", badge: "ETH", color: "#627eea" },
  { name: "Base", badge: "B", color: "#0052ff" },
  { name: "Arbitrum", badge: "ARB", color: "#28a0f0" },
  { name: "NEAR", badge: "N", color: "#111827" },
];

const FEATURES = [
  {
    icon: "bolt",
    title: "Pay from your preferred network",
    body: "Use supported digital assets across Ethereum, Base, Arbitrum and NEAR.",
  },
  {
    icon: "shield",
    title: "Clinics receive what they're billed",
    body: "Payments are converted and settled in USDC on NEAR.",
  },
  {
    icon: "eye",
    title: "Simple, transparent payments",
    body: "Know exactly how much to send before completing a payment.",
  },
  {
    icon: "lock",
    title: "Built with payment protection in mind",
    body: "If a transaction cannot be completed, funds are returned.",
  },
];

const STEPS = [
  {
    icon: "building",
    title: "Your clinic creates an invoice",
    body: "The healthcare provider generates a digital invoice.",
  },
  {
    icon: "users",
    title: "The family chooses how to pay",
    body: "Open the payment link, select a network and asset.",
  },
  {
    icon: "refresh",
    title: "Payment is converted and settled",
    body: "CareRail uses NEAR Intents for seamless conversion.",
  },
  {
    icon: "checkcircle",
    title: "The clinic receives the payment",
    body: "Once confirmed, the invoice is marked as paid.",
  },
];

const CHECKS = [
  "Accept payments in USDC on NEAR",
  "Let families pay from the chain they already use",
  "See the status of every invoice in one place",
];

const STORIES = [
  {
    icon: "users",
    title: "A parent's treatment, paid from abroad",
    body: "A daughter overseas covers her father's hospital bill from the wallet she already uses, without opening a new account.",
  },
  {
    icon: "building",
    title: "A clinic that sees the full amount",
    body: "The invoice says 180 USDC and the clinic receives 180 USDC. Nothing is deducted along the way.",
  },
  {
    icon: "undo",
    title: "A payment that did not go through",
    body: "If a transfer cannot be completed, the money returns to the wallet it came from, and the invoice says so.",
  },
];

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

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative grid items-center gap-8 pb-10 pt-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-14 lg:pt-6">
        <div className="relative z-10">
          <h1 className="enter display text-balance text-[2.9rem] sm:text-6xl lg:text-[4.2rem]">
            Healthcare payments,{" "}
            <span className="relative inline-block">
              <span className="grad-text">made simpler.</span>
              <svg
                aria-hidden
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-2.5 w-full text-primary"
              >
                <path
                  d="M2 8c30-7 60-7 96-2s70 3 100-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p
            className="enter mt-6 max-w-[30rem] text-lg leading-relaxed text-muted"
            style={{ "--d": "100ms" } as React.CSSProperties}
          >
            Pay medical bills from wherever you are, using the digital assets
            you already hold. CareRail makes it easier for families to support
            patients and helps clinics receive payments without unnecessary
            complications.
          </p>
          <div
            className="enter mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ "--d": "200ms" } as React.CSSProperties}
          >
            <Link href="/pay" className="btn btn-primary !rounded-full">
              Pay a medical bill
              <Icon name="arrow" className="size-5" />
            </Link>
            <Link
              href="/clinic"
              className="btn !rounded-full border-[1.5px] border-primary text-primary hover:bg-mint"
            >
              For healthcare providers
            </Link>
          </div>
          <p
            className="enter mt-6 flex items-center gap-2.5 text-sm text-muted"
            style={{ "--d": "280ms" } as React.CSSProperties}
          >
            <span className="grid size-8 place-items-center rounded-full bg-mint text-mintfg">
              <Icon name="globe" className="size-4" />
            </span>
            Built for the NEAR hackathon, settled with NEAR Intents.
          </p>
        </div>

        {/* Photo slot. Add public/images/hero.jpg to fill it. */}
        <div
          className="enter relative mx-auto h-[360px] w-full max-w-xl sm:h-[440px] lg:h-[500px]"
          style={{ "--d": "150ms" } as React.CSSProperties}
        >
          <div
            aria-hidden
            className="absolute right-0 top-0 h-full w-[92%] rounded-tl-[140px] rounded-bl-[60px] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent"
          />
          <div
            aria-hidden
            className="absolute left-0 top-[22%] size-[62%] rounded-full border-[14px] border-primary/25"
          />
          <div aria-hidden className="absolute inset-0 grid place-items-center">
            <LogoMark className="size-40 opacity-20" />
          </div>
          <div
            aria-hidden
            className="photo-fade absolute inset-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundImage: "url(/images/hero.jpg)" }}
          />
          <div className="card pop absolute -bottom-2 right-0 w-[15.5rem] p-4 sm:bottom-6" style={{ animationDelay: "600ms" }}>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0a8f6a] to-[#34d399] text-white">
                <Icon name="check" className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="font-bold leading-tight">Payment successful!</p>
                <p className="mt-0.5 text-lg font-semibold">180.00 USDC</p>
                <p className="text-xs text-muted">Example invoice #CR-78452</p>
              </div>
            </div>
            <a
              href="#how"
              className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-bold text-primary"
            >
              See how it works
              <Icon name="arrow" className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Networks */}
      <section
        aria-label="Supported networks"
        className="card flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:gap-6"
      >
        <p className="font-bold sm:max-w-[9rem] sm:leading-tight">
          Pay with your preferred network:
        </p>
        <ul className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-line">
          {NETWORKS.map((n) => (
            <li key={n.name} className="flex items-center gap-2.5 sm:justify-center">
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-white ring-1 ring-white/20"
                style={{ background: n.color }}
              >
                {n.badge}
              </span>
              <span className="font-semibold">{n.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Features */}
      <section aria-label="Why CareRail" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card p-4 sm:p-5">
            <span className="grid size-11 place-items-center rounded-full bg-mint text-mintfg">
              <Icon name={f.icon} />
            </span>
            <h2 className="mt-3 text-[1.05rem] font-bold leading-snug">{f.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-6 pt-16 text-center">
        <h2 className="display text-3xl sm:text-4xl">
          How <span className="grad-text">CareRail</span> works
        </h2>
        <p className="mt-2 text-muted">A simple process, designed for everyone.</p>
        <ol className="mt-9 grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-x-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="contents">
              <div className="card relative px-4 pb-5 pt-7 sm:px-5">
                <span className="absolute -top-3.5 left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-full bg-gradient-to-br from-[#08707a] to-[#0b857a] text-xs font-bold text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-mint text-mintfg">
                  <Icon name={s.icon} className="size-6" />
                </span>
                <h3 className="mt-3 font-bold leading-snug">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.body}</p>
              </div>
              {i < STEPS.length - 1 && (
                <span aria-hidden className="hidden items-center text-primary lg:flex">
                  <Icon name="arrow" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Providers */}
      <section
        className="relative mt-16 overflow-hidden rounded-[28px] px-6 py-9 text-white sm:px-10 sm:py-12"
        style={{ background: "linear-gradient(120deg, #07204d 0%, #0a3a7a 55%, #0b6b86 100%)" }}
      >
        {/* Photo slot. Add public/images/provider.jpg to fill it. */}
        <div
          aria-hidden
          className="photo-fade-left absolute inset-y-0 right-0 hidden w-[46%] bg-cover bg-top bg-no-repeat lg:block"
          style={{ backgroundImage: "url(/images/provider.jpg)" }}
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="display text-balance text-3xl sm:text-4xl">
              Better payment experiences for{" "}
              <span className="text-[#5eead4]">healthcare providers.</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-white/80">
              Spend less time dealing with complicated payment arrangements and
              give patients a more flexible way to settle medical bills.
            </p>
            <Link href="/clinic/new" className="btn mt-6 !rounded-full bg-gradient-to-r from-[#0e9aa0] to-[#2dd4bf] text-[#04222a]">
              Start with CareRail
              <Icon name="arrow" className="size-5" />
            </Link>
          </div>
          <ul className="space-y-4 lg:ml-auto lg:max-w-xs">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-start gap-3 font-semibold">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#2dd4bf] text-[#04222a]">
                  <Icon name="check" className="size-4" />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it helps */}
      <section className="pt-16 text-center">
        <h2 className="display text-3xl sm:text-4xl">Made for families and clinics</h2>
        <p className="mt-2 text-muted">Three situations CareRail is built for.</p>
        <div className="mt-8 grid gap-3 text-left md:grid-cols-3">
          {STORIES.map((s) => (
            <article key={s.title} className="card p-5">
              <span className="grid size-11 place-items-center rounded-full bg-mint text-mintfg">
                <Icon name={s.icon} />
              </span>
              <h3 className="mt-4 text-lg font-bold leading-snug">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
            </article>
          ))}
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
        <svg
          aria-hidden
          viewBox="0 0 300 60"
          className="pointer-events-none absolute -right-4 bottom-4 hidden h-16 w-80 text-white/40 md:block"
        >
          <path
            className="ecg"
            d="M0 32h90l12-22 14 44 12-30 10 8h162"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
          <div className="flex items-center gap-3 md:border-r md:border-white/30 md:pr-10">
            <LogoMark className="size-14 !bg-white/20" />
            <span className="display text-3xl">CareRail</span>
          </div>
          <div className="flex-1">
            <h2 className="display text-2xl sm:text-3xl">
              Care should come first. Payments should be easier.
            </h2>
            <p className="mt-2 max-w-xl text-white/85">
              Whether you&apos;re paying for someone you love or running a
              healthcare facility, CareRail brings a simpler payment experience
              within reach.
            </p>
          </div>
          <Link href="/clinic/new" className="btn shrink-0 !rounded-full bg-white text-[#06505a]">
            Create an invoice
            <Icon name="arrow" className="size-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
