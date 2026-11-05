import Link from "next/link";

const STEPS = [
  {
    title: "The clinic creates an invoice",
    body: "Enter the patient, what the bill is for, and the amount in USDC. The clinic gets a link to send to the family.",
  },
  {
    title: "The payer chooses how to pay",
    body: "They open the link, pick a token and chain they already hold, and get an exact amount and a deposit address.",
  },
  {
    title: "NEAR Intents settles it",
    body: "The payer's tokens are swapped across chains and the clinic receives the exact bill amount in USDC on NEAR. The invoice marks itself paid.",
  },
];

export default function Home() {
  return (
    <>
      <section className="grid items-center gap-14 pb-20 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-14">
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Pay any clinic&apos;s bill from any chain.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted">
            Family or friends far away pay with the token they already hold. The
            clinic receives USDC on NEAR for exactly the amount on the bill,
            with no bank transfer in between.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/clinic"
              className="rounded-[10px] bg-pine px-5 py-3 font-semibold text-white hover:bg-pine-deep"
            >
              Create an invoice
            </Link>
            <a
              href="#how"
              className="font-semibold text-pine underline-offset-4 hover:underline"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="slip mx-auto w-full max-w-md shadow-[0_18px_40px_-24px_rgba(12,90,72,0.45)]">
          <div className="p-6">
            <p className="text-sm text-muted">Sample bill</p>
            <h2 className="mt-1 font-display text-xl font-bold">
              Greenfield Medical Centre
            </h2>
            <p className="mt-4 text-sm text-muted">Ngozi A.</p>
            <p>Antenatal scan and consultation</p>
            <p className="mt-5 font-display text-4xl font-extrabold tracking-tight">
              180.00 <span className="text-xl font-bold text-muted">USDC</span>
            </p>
          </div>
          <div className="slip-tear flex items-center justify-between gap-4 p-6">
            <div className="text-sm">
              <p className="text-muted">Paid from Ethereum with</p>
              <p className="font-semibold">0.0932 ETH</p>
            </div>
            <span className="stamp" aria-label="Paid">
              PAID
            </span>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-8 border-t border-line pt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          From bill to settled in three steps
        </h2>
        <ol className="mt-10 grid gap-10 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="grid size-8 place-items-center rounded-full bg-mint font-display text-sm font-bold text-pine-deep">
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[22rem] leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
