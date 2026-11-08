/**
 * Checks that a NEAR account exists before an invoice is created.
 *
 * A misspelled clinic account is valid in format but does not exist, and 1Click
 * rejects real quotes for it with an unhelpful "Internal server error". Catching
 * it here lets the clinic fix the spelling immediately.
 *
 * The check only blocks when NEAR confirms the account does NOT exist. If the RPC is
 * slow, down or rate limited, the result is "unknown" and invoice creation continues.
 */

export type AccountStatus = "exists" | "missing" | "unknown";

// The public near.org endpoints are deprecated but still answer at reduced rate limits,
// which is plenty for one lookup per invoice. Set NEAR_RPC_URL to use another provider.
const DEFAULT_RPC = "https://rpc.mainnet.near.org";

export async function nearAccountStatus(accountId: string): Promise<AccountStatus> {
  const url = process.env.NEAR_RPC_URL || DEFAULT_RPC;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "carerail",
        method: "query",
        params: {
          request_type: "view_account",
          finality: "final",
          account_id: accountId,
        },
      }),
      signal: AbortSignal.timeout(6_000),
      cache: "no-store",
    });
    const json = (await res.json()) as {
      result?: unknown;
      error?: { cause?: { name?: string }; data?: unknown; message?: string };
    };
    if (json.result) return "exists";
    const cause = json.error?.cause?.name;
    const text = JSON.stringify(json.error ?? {});
    if (cause === "UNKNOWN_ACCOUNT" || /does not exist/i.test(text)) {
      return "missing";
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}
