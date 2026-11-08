"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icons";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const ITEMS = [
  { href: "/clinic", label: "Invoices", icon: "list" },
  { href: "/clinic/new", label: "New invoice", icon: "plus" },
  { href: "/", label: "Home", icon: "home" },
];

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href;
}

export function ClinicShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-side p-5 text-white lg:flex">
        <Logo light />
        <nav className="mt-8 flex flex-col gap-1.5" aria-label="Main">
          {ITEMS.map((item) => {
            const active = isActive(path, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 font-semibold transition-colors ${
                  active
                    ? "bg-gradient-to-r from-[#0a7a55] to-[#0d8559] text-white shadow-[0_8px_20px_-10px_rgba(20,200,139,0.9)]"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-4">
          <p className="text-sm leading-relaxed text-white/60">
            Bills are settled in USDC on NEAR through NEAR Intents.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/70">Theme</span>
            <ThemeToggle className="!border-white/15 !bg-white/10 !text-white" />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/85 px-4 py-2 backdrop-blur-md lg:hidden">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pb-32 pt-6 sm:px-8 lg:pb-16 lg:pt-10">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        {ITEMS.map((item) => {
          const active = isActive(path, item.href);
          const create = item.href === "/clinic/new";
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-bold ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              {create ? (
                <span className="-mt-6 grid size-12 place-items-center rounded-full bg-gradient-to-br from-[#07694a] to-[#0d8559] text-white shadow-[0_10px_20px_-6px_rgba(20,166,115,0.8)]">
                  <Icon name="plus" className="size-6" />
                </span>
              ) : (
                <Icon name={item.icon} />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
