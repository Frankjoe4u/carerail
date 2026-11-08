import type {
  Invoice,
  InvoiceStatus,
  PayToken,
  PaymentQuote,
} from "./types";
import { usdcToSmallestUnit } from "./validate";

/**
 * NEAR Intents 1Click API client.
 * Docs: https://docs.near-intents.org/integration/distribution-channels/1click-api
 *
 * Flow used by this app:
 *  1. POST /v0/quote  (swapType EXACT_OUTPUT: the clinic receives exactly the invoice amount)
 *  2. Payer sends tokens to the returned depositAddress from any supported chain
 *  3. GET  /v0/status?depositAddress=...  until SUCCESS
 *
 * DEMO_MODE (default) replaces all network calls with a local simulator so the
 * whole flow runs with no wallet, no funds and no API access.
 */

const BASE_URL = "https://1click.chaindefuser.com";
const QUOTE_WINDOW_MINUTES = 30;

export function isDemo(): boolean {
  return process.env.DEMO_MODE !== "false";
}

/** Native USDC on NEAR. Used when the live token list is unavailable. */
const USDC_NEAR_FALLBACK: PayToken = {
  assetId:
    "nep141:17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
  symbol: "USDC",
  blockchain: "near",
  decimals: 6,
  price: 1,
};

/** Tokens offered in demo mode. Live mode reads the real list from the API. */
const DEMO_TOKENS: PayToken[] = [
  {
    assetId: "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near",
    symbol: "USDC",
    blockchain: "eth",
    decimals: 6,
    price: 1,
  },
  {
    assetId: "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near",
    symbol: "USDC",
    blockchain: "base",
    decimals: 6,
    price: 1,
  },
  {
    assetId: "nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near",
    symbol: "USDC",
    blockchain: "sol",
    decimals: 6,
    price: 1,
  },
  {
    assetId: "nep141:eth.omft.near",
    symbol: "ETH",
    blockchain: "eth",
    decimals: 18,
    price: 1950,
  },
  {
    assetId: "nep141:sol.omft.near",
    symbol: "SOL",
    blockchain: "sol",
    decimals: 9,
    price: 150,
  },
  {
    assetId: "nep141:btc.omft.near",
    symbol: "BTC",
    blockchain: "btc",
    decimals: 8,
    price: 66000,
  },
];

const OFFERED_SYMBOLS = new Set(["USDC", "USDT", "ETH", "BTC", "SOL", "NEAR", "wNEAR"]);
// Chains verified end to end with real quotes. Solana is untested, and paying from the
// Bitcoin chain needs an invoice of roughly 6.25 USDC or more, so both are left out.
const OFFERED_CHAINS = new Set(["eth", "base", "arb", "near"]);

const SYMBOL_RANK = ["USDC", "USDT", "ETH", "wNEAR", "NEAR", "BTC", "SOL"];
const CHAIN_RANK = ["base", "eth", "arb", "near", "sol", "btc"];
const rank = (list: string[], v: string) => {
  const i = list.indexOf(v);
  return i === -1 ? list.length : i;
};

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const jwt = process.env.ONE_CLICK_JWT;
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
}

async function callApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON body, handled below */
  }
  if (!res.ok) {
    console.error("1Click error", res.status, path, text);
    const message =
      (body as { message?: string } | null)?.message ?? text.slice(0, 200);
    throw new Error(`1Click API ${res.status}: ${message || res.statusText}`);
  }
  return body as T;
}

interface ApiToken {
  assetId: string;
  decimals: number;
  blockchain: string;
  symbol: string;
  price?: number;
}

let tokenCache: { at: number; tokens: ApiToken[] } | null = null;

async function fetchAllTokens(): Promise<ApiToken[]> {
  if (tokenCache && Date.now() - tokenCache.at < 5 * 60_000) {
    return tokenCache.tokens;
  }
  const tokens = await callApi<ApiToken[]>("/v0/tokens");
  tokenCache = { at: Date.now(), tokens };
  return tokens;
}

/** The asset the clinic is paid in: USDC on NEAR. */
export async function getDestinationToken(): Promise<PayToken> {
  if (isDemo()) return USDC_NEAR_FALLBACK;
  try {
    const all = await fetchAllTokens();
    const usdc = all.find((t) => t.symbol === "USDC" && t.blockchain === "near");
    if (usdc) {
      return {
        assetId: usdc.assetId,
        symbol: usdc.symbol,
        blockchain: usdc.blockchain,
        decimals: usdc.decimals,
        price: usdc.price ?? 1,
      };
    }
  } catch {
    /* fall through to the known asset id */
  }
  return USDC_NEAR_FALLBACK;
}

/** Tokens a payer can pay with. */
export async function getPayTokens(): Promise<PayToken[]> {
  if (isDemo()) return DEMO_TOKENS;
  const [all, destination] = await Promise.all([
    fetchAllTokens(),
    getDestinationToken(),
  ]);
  return all
    .filter(
      (t) =>
        OFFERED_SYMBOLS.has(t.symbol) &&
        OFFERED_CHAINS.has(t.blockchain) &&
        t.assetId !== destination.assetId &&
        typeof t.price === "number" &&
        t.price > 0,
    )
    .map((t) => ({
      assetId: t.assetId,
      symbol: t.symbol,
      blockchain: t.blockchain,
      decimals: t.decimals,
      price: t.price as number,
    }))
    .sort(
      (a, b) =>
        rank(SYMBOL_RANK, a.symbol) - rank(SYMBOL_RANK, b.symbol) ||
        rank(CHAIN_RANK, a.blockchain) - rank(CHAIN_RANK, b.blockchain),
    );
}

function formatUnits(smallest: string, decimals: number, maxFraction = 6): string {
  const padded = smallest.padStart(decimals + 1, "0");
  const whole = padded.slice(0, padded.length - decimals);
  const frac = padded.slice(padded.length - decimals).slice(0, maxFraction);
  const trimmed = frac.replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

interface ApiQuoteResponse {
  quote?: {
    depositAddress?: string;
    amountIn?: string;
    amountInFormatted?: string;
    deadline?: string;
  };
}

/**
 * Request a payment quote so the invoice is settled exactly: the clinic gets
 * `invoice.amountUsdc` USDC on NEAR, and the quote says how much the payer sends.
 */
export async function createQuote(args: {
  invoice: Invoice;
  origin: PayToken;
  refundTo: string;
  dry?: boolean;
}): Promise<PaymentQuote> {
  const { invoice, origin, refundTo } = args;
  const now = new Date();
  const deadline = new Date(now.getTime() + QUOTE_WINDOW_MINUTES * 60_000);

  if (isDemo()) {
    // Simulated 0.5% fee on top of the indicative price
    const human = (Number(invoice.amountUsdc) / origin.price) * 1.005;
    const amountIn = BigInt(Math.ceil(human * 10 ** origin.decimals)).toString();
    const random = crypto.randomUUID().replace(/-/g, "");
    return {
      depositAddress: `demo-${random.slice(0, 32)}`,
      originAssetId: origin.assetId,
      originSymbol: origin.symbol,
      originChain: origin.blockchain,
      originDecimals: origin.decimals,
      amountIn,
      amountInFormatted: formatUnits(amountIn, origin.decimals),
      deadline: deadline.toISOString(),
      refundTo,
      createdAt: now.toISOString(),
      mock: true,
    };
  }

  const destination = await getDestinationToken();
  const response = await callApi<ApiQuoteResponse>("/v0/quote", {
    method: "POST",
    body: JSON.stringify({
      dry: args.dry ?? false,
      swapType: "EXACT_OUTPUT",
      slippageTolerance: 100,
      originAsset: origin.assetId,
      depositType: "ORIGIN_CHAIN",
      destinationAsset: destination.assetId,
      amount: usdcToSmallestUnit(invoice.amountUsdc),
      recipient: invoice.clinicNearAccount,
      recipientType: "DESTINATION_CHAIN",
      refundTo,
      refundType: "ORIGIN_CHAIN",
      deadline: deadline.toISOString(),
    }),
  });

  const q = response.quote;
  if (!q?.amountIn) throw new Error("1Click returned a quote without an amount.");
  if (!args.dry && !q.depositAddress) {
    throw new Error("1Click returned a quote without a deposit address.");
  }
  return {
    depositAddress: q.depositAddress ?? "",
    originAssetId: origin.assetId,
    originSymbol: origin.symbol,
    originChain: origin.blockchain,
    originDecimals: origin.decimals,
    amountIn: q.amountIn,
    amountInFormatted:
      q.amountInFormatted ?? formatUnits(q.amountIn, origin.decimals),
    deadline: q.deadline ?? deadline.toISOString(),
    refundTo,
    createdAt: now.toISOString(),
    mock: false,
  };
}

/** Raw 1Click status for a quote's deposit address. */
export async function getIntentsStatus(quote: PaymentQuote): Promise<string> {
  if (quote.mock) {
    if (!quote.simulatedDepositAt) return "PENDING_DEPOSIT";
    const elapsed = Date.now() - new Date(quote.simulatedDepositAt).getTime();
    if (elapsed < 3_000) return "KNOWN_DEPOSIT_TX";
    if (elapsed < 8_000) return "PROCESSING";
    return "SUCCESS";
  }
  const res = await callApi<{ status?: string }>(
    `/v0/status?depositAddress=${encodeURIComponent(quote.depositAddress)}`,
  );
  return res.status ?? "PENDING_DEPOSIT";
}

export function mapStatus(raw: string): InvoiceStatus {
  switch (raw) {
    case "SUCCESS":
      return "paid";
    case "REFUNDED":
      return "refunded";
    case "FAILED":
      return "failed";
    case "KNOWN_DEPOSIT_TX":
    case "PROCESSING":
      return "processing";
    default:
      // PENDING_DEPOSIT, INCOMPLETE_DEPOSIT, anything unknown
      return "awaiting_payment";
  }
}
