import Link from "next/link";
import { Icon } from "@/components/Icons";
import { LogoMark } from "@/components/Logo";

const TRUST = [
  {
    icon: "shield",
    title: "Exact amount",
    body: "The clinic receives the full bill, not a bill minus fees.",
  },
  {
    icon: "globe",
    title: "Any chain",
    body: "Pay from Ethereum, Base, Arbitrum or NEAR.",
  },
  {
    icon: "undo",
    title: "Refund if it fails",
    body: "A payment that cannot complete returns to your wallet.",
  },
];

const STEPS = [
  [
    "The clinic creates an invoice",
    "Patient, service and the amount in USDC. The clinic gets a link to send to the family.",
  ],
  [
    "The payer picks a token",
    "They choose what they hold, then get an exact amount and one address to send it to.",
  ],
  [
    "NEAR Intents settles it",
    "The tokens are converted and the clinic receives USDC on NEAR. The invoice marks itself paid.",
  ],
];

export default function Home() {
  return (
    <>
      <section className="grid items-center gap-10 pb-12 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20 lg:pt-12">
        <div>
          <p className="enter inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-muted">
            <span className="size-2 rounded-full bg-primary" />
            Settled on NEAR with NEAR Intents
          </p>
          <h1
            className="enter display mt-5 text-balance text-[2.7rem] sm:text-6xl"
            style={{ "--d": "70ms" } as React.CSSProperties}
          >
            Pay a clinic&apos;s bill with{" "}
            <span className="grad-text">whatever you hold.</span>
          </h1>
          <p
            className="enter mt-5 max-w-[32rem] text-lg leading-relaxed text-muted"
            style={{ "--d": "140ms" } as React.CSSProperties}
          >
            The family sends from the chain they are on. The clinic receives
            the exact amount on the bill, in USDC on NEAR.
          </p>
          <div
            className="enter mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ "--d": "210ms" } as React.CSSProperties}
          >
            <Link href="/clinic/new" className="btn btn-primary">
              Create an invoice
              <Icon name="arrow" className="size-5" />
            </Link>
            <a href="#how" className="btn btn-soft">
              How it works
            </a>
          </div>
        </div>

        <div
          className="enter relative mx-auto w-full max-w-md"
          style={{ "--d": "180ms" } as React.CSSProperties}
        >
          <div
            aria-hidden
            className="blob absolute -inset-6 -z-10 rounded-[40px] opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(31,200,139,.55), transparent 60%), radial-gradient(circle at 80% 80%, rgba(63,169,255,.35), transparent 60%)",
            }}
          />
          <article className="card p-5 sm:p-6" aria-label="Sample paid bill">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <LogoMark className="size-10" />
                <div>
                  <p className="text-xs text-muted">Bill from</p>
                  <p className="display text-lg">Greenfield Medical Centre</p>
                </div>
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Patient</dt>
                <dd className="font-semibold">Ngozi A.</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">For</dt>
                <dd className="text-right font-semibold">
                  Antenatal scan and consultation
                </dd>
              </div>
            </dl>
            <div className="mt-5 rounded-2xl bg-mint p-4">
              <p className="text-sm text-muted">Amount due</p>
              <p className="display mt-1 text-5xl">
                180.00 <span className="text-xl text-muted">USDC</span>
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="pill bg-ok-bg text-ok-fg">
                <Icon name="check" className="size-3.5" />
                Paid
              </span>
              <span className="text-sm text-muted">
                0.0932 ETH on Ethereum
              </span>
            </div>
          </article>
          <div
            className="pop card relative -mt-3 ml-auto mr-3 flex w-fit items-center gap-3 px-4 py-3"
            style={{ animationDelay: "700ms" }}
          >
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#07694a] to-[#0d8559] text-white">
              <Icon name="check" className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold">Payment successful</p>
              <p className="text-xs text-muted">The clinic received 180 USDC</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Why CareRail" className="grid gap-3 sm:grid-cols-3">
        {TRUST.map((t) => (
          <div key={t.title} className="card flex items-start gap-3.5 p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-mintfg">
              <Icon name={t.icon} />
            </span>
            <div>
              <h2 className="font-bold">{t.title}</h2>
              <p className="mt-0.5 text-sm text-muted">{t.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="how" className="scroll-mt-6 pt-16">
        <h2 className="display text-3xl sm:text-4xl">How a bill gets paid</h2>
        <ol className="mt-7 grid gap-3 sm:grid-cols-3">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="card p-5">
              <span className="grid size-9 place-items-center rounded-full bg-mint font-bold text-mintfg">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
