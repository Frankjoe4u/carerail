import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-xl text-white ${className}`}
      style={{ background: "linear-gradient(135deg, #07694a, #17b17c)" }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-[62%]">
        <path d="M12 21s-8-5.2-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.8-8 11-8 11z" />
        <path d="M12 9.5v5M9.5 12h5" />
      </svg>
    </span>
  );
}

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="flex min-h-11 items-center gap-2.5">
      <LogoMark />
      <span className={`display text-xl ${light ? "text-white" : "text-fg"}`}>
        CareRail
      </span>
    </Link>
  );
}
