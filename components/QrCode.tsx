"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/**
 * QR code for a deposit address. Always dark on white with a quiet margin so
 * wallet scanners read it in both light and dark themes.
 */
export function QrCode({ value, label }: { value: string; label: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      margin: 2,
      width: 240,
      errorCorrectionLevel: "M",
      color: { dark: "#0b1f4d", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div className="mx-auto grid size-[11.5rem] place-items-center rounded-2xl bg-white p-2 shadow-sm">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} width={176} height={176} className="size-full" />
      ) : (
        <span className="spinner" aria-hidden />
      )}
    </div>
  );
}
