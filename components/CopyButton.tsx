"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
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
      className="shrink-0 rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-pine hover:bg-mint"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
