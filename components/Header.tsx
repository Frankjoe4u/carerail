import Link from "next/link";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
      <Link href="/" className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-lg bg-pine text-white"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="currentColor">
            <path d="M6.5 1.5h3v5h5v3h-5v5h-3v-5h-5v-3h5z" />
          </svg>
        </span>
        <span className="font-display text-lg font-bold tracking-tight">
          CareRail
        </span>
      </Link>
      <nav>
        <Link
          href="/clinic"
          className="rounded-lg px-3 py-2 text-sm font-medium text-pine hover:bg-mint"
        >
          For clinics
        </Link>
      </nav>
    </header>
  );
}
