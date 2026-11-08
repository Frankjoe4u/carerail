import Link from "next/link";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#how", label: "How it works" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/clinic", label: "For clinics" },
];

export function SiteFooter() {
  return (
    <footer className="mt-4 bg-[#071a3a] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Logo light />
          <p className="text-sm text-white/70">
            Making healthcare payments work better for everyone.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-white/80 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-white/70">
          Powered by <strong className="text-white">NEAR Intents</strong>
        </p>
      </div>
    </footer>
  );
}
