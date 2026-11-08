"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "./Icons";

/** Accepts a full invoice link or just the code at the end of it. */
function extractId(input: string): string {
  const cleaned = input.trim().replace(/[?#].*$/, "").replace(/\/+$/, "");
  const last = cleaned.split("/").pop() ?? "";
  return /^[A-Za-z0-9_-]{6,64}$/.test(last) ? last : "";
}

export function FindBillClient() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const id = extractId(value);
    if (!id) {
      setError("That does not look like an invoice link. Paste the link the clinic sent you.");
      return;
    }
    router.push(`/pay/${id}`);
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-4 p-5 sm:p-6" noValidate>
      <label className="block">
        <span className="font-bold">Invoice link</span>
        <input
          className="field"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          placeholder="https://carerail.vercel.app/pay/..."
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="url"
        />
        {error && (
          <span role="alert" className="mt-1.5 block text-sm font-semibold text-bad-fg">
            {error}
          </span>
        )}
      </label>
      <button type="submit" className="btn btn-primary w-full !rounded-full">
        Open bill
        <Icon name="arrow" className="size-5" />
      </button>
    </form>
  );
}
