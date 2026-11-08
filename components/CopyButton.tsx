"use client";

import { useState } from "react";
import { Icon } from "./Icons";

export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the value stays visible to copy by hand */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex min-h-11 min-w-[5.25rem] shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-sm font-bold transition-colors duration-150 active:scale-95 ${
        copied
          ? "border-transparent bg-ok-bg text-ok-fg"
          : "border-line bg-surface2 text-fg hover:border-primary"
      } ${className}`}
      aria-live="polite"
    >
      <Icon name={copied ? "check" : "copy"} className="size-4" />
      {copied ? "Copied" : label}
    </button>
  );
}
