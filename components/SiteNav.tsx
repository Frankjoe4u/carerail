"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "./Icons";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#how", label: "How it works" },
  { href: "/clinic", label: "For clinics" },
  { href: "/#faqs", label: "FAQs" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 mx-auto w-full max-w-6xl px-4 py-3 sm:px-8 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={`inline-flex min-h-11 items-center border-b-2 text-sm font-semibold transition-colors hover:text-primary ${
                i === 0 ? "border-primary text-fg" : "border-transparent text-muted"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link href="/clinic/new" className="btn btn-primary hidden !min-h-11 !rounded-full px-5 text-sm md:inline-flex">
            Get started
            <Icon name="arrow" className="size-4" />
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-line bg-surface md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Menu"
          className="pop card absolute inset-x-4 top-[calc(100%-4px)] flex flex-col p-2 md:hidden"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center rounded-xl px-4 font-semibold hover:bg-surface2"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/clinic/new"
            onClick={() => setOpen(false)}
            className="btn btn-primary !rounded-full mt-1"
          >
            Get started
          </Link>
        </nav>
      )}
    </header>
  );
}
