const NEAR_ACCOUNT = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;

export function isValidNearAccount(value: string): boolean {
  return value.length >= 2 && value.length <= 64 && NEAR_ACCOUNT.test(value);
}

/** Positive USDC amount with at most 2 decimals, e.g. "250" or "250.50" */
export function isValidUsdcAmount(value: string): boolean {
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(value)) return false;
  return Number(value) > 0;
}

/** "250.5" -> "250500000" (USDC has 6 decimals) */
export function usdcToSmallestUnit(value: string): string {
  const [whole, frac = ""] = value.split(".");
  const padded = (frac + "000000").slice(0, 6);
  return (BigInt(whole) * 1_000_000n + BigInt(padded)).toString();
}

export function isValidRefundAddress(value: string): boolean {
  return value.length >= 10 && value.length <= 120 && !/\s/.test(value);
}

export function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
