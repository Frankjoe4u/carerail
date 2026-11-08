import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function PublicHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5">
      <Logo />
      <nav className="flex items-center gap-2.5">
        <Link href="/clinic" className="btn btn-soft min-h-11 px-4 py-2 text-sm">
          For clinics
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
