#!/usr/bin/env node
/**
 * Live check against the NEAR Intents 1Click API. Moves no money.
 *
 *   node scripts/check-intents.mjs <evm-wallet-address> <clinic-near-account> [--all]
 *
 * Default: one DRY quote (pay with USDC on Base, clinic receives 1.00 USDC on NEAR).
 * --all:   tries every token the app offers, as a dry quote and as a real quote
 *          (a real quote only reserves a deposit address; nothing is sent), and
 *          prints which tokens the API accepts or rejects.
 *
 * Optional: ONE_CLICK_JWT=... to use your API key.
 */
const BASE_URL = "https://1click.chaindefuser.com";
const args = process.argv.slice(2);
const all = args.includes("--all");
const [evmAddress, recipient] = args.filter((a) => !a.startsWith("--"));

if (!evmAddress || !recipient) {
  console.error(
    "Usage: node scripts/check-intents.mjs <evm-wallet-address> <clinic-near-account> [--all]",
  );
  process.exit(1);
}

const headers = { "Content-Type": "application/json" };
if (process.env.ONE_CLICK_JWT) headers.Authorization = `Bearer ${process.env.ONE_CLICK_JWT}`;

// Same filters as the app (lib/intents.ts)
const OFFERED_SYMBOLS = new Set(["USDC", "USDT", "ETH", "BTC", "SOL", "NEAR", "wNEAR"]);
const OFFERED_CHAINS = new Set(["eth", "base", "arb", "sol", "near", "btc"]);

// Refund addresses are only used to validate the request; no money is sent.
const REFUND_BY_CHAIN = {
  eth: evmAddress,
  base: evmAddress,
  arb: evmAddress,
  near: recipient,
  sol: "11111111111111111111111111111111",
  btc: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
};

async function api(path, init) {
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON body */
  }
  return { ok: res.ok, status: res.status, text, json };
}

function quoteBody({ origin, destination, refundTo, dry }) {
  return {
    dry,
    swapType: "EXACT_OUTPUT",
    slippageTolerance: 100,
    originAsset: origin.assetId,
    depositType: "ORIGIN_CHAIN",
    destinationAsset: destination.assetId,
    amount: "1000000", // 1.00 USDC (6 decimals)
    recipient,
    recipientType: "DESTINATION_CHAIN",
    refundTo,
    refundType: "ORIGIN_CHAIN",
    deadline: new Date(Date.now() + 30 * 60_000).toISOString(),
  };
}

async function requestQuote(args) {
  return api("/v0/quote", { method: "POST", body: JSON.stringify(quoteBody(args)) });
}

function failure(r) {
  const msg = r.json?.message ?? r.text.slice(0, 120);
  const ref = r.json?.correlationId ? ` ref ${r.json.correlationId}` : "";
  return `FAIL ${r.status} ${msg}${ref}`;
}

const tokensRes = await api("/v0/tokens");
if (!tokensRes.ok) {
  console.error(`FAIL tokens: HTTP ${tokensRes.status}`);
  process.exit(1);
}
const tokens = tokensRes.json;
const destination = tokens.find((t) => t.symbol === "USDC" && t.blockchain === "near");
console.log(`OK tokens: ${tokens.length} listed`);
console.log("   destination USDC on NEAR:", destination?.assetId ?? "NOT FOUND");
if (!destination) process.exit(1);

if (all) {
  const offered = tokens
    .filter(
      (t) =>
        OFFERED_SYMBOLS.has(t.symbol) &&
        OFFERED_CHAINS.has(t.blockchain) &&
        t.assetId !== destination.assetId &&
        typeof t.price === "number" &&
        t.price > 0,
    )
    .sort((a, b) => a.symbol.localeCompare(b.symbol) || a.blockchain.localeCompare(b.blockchain));

  console.log(`\nTrying ${offered.length} tokens (dry quote, then real quote)...\n`);
  let bad = 0;
  for (const origin of offered) {
    const refundTo = REFUND_BY_CHAIN[origin.blockchain];
    const dry = await requestQuote({ origin, destination, refundTo, dry: true });
    await new Promise((r) => setTimeout(r, 300));
    const real = await requestQuote({ origin, destination, refundTo, dry: false });
    await new Promise((r) => setTimeout(r, 300));

    const dryText = dry.ok ? `OK ${dry.json?.quote?.amountInFormatted}` : failure(dry);
    const realText = real.ok
      ? real.json?.quote?.depositAddress
        ? "OK deposit address"
        : "FAIL no deposit address"
      : failure(real);
    if (!dry.ok || !real.ok || !real.json?.quote?.depositAddress) bad++;
    console.log(`${origin.symbol.padEnd(6)} ${origin.blockchain.padEnd(5)} dry: ${dryText} | real: ${realText}`);
  }
  console.log(`\n${offered.length - bad} of ${offered.length} tokens work.`);
  process.exit(0);
}

const origin = tokens.find((t) => t.symbol === "USDC" && t.blockchain === "base");
console.log("   origin USDC on Base:     ", origin?.assetId ?? "NOT FOUND");
if (!origin) process.exit(1);

const quoteRes = await requestQuote({ origin, destination, refundTo: evmAddress, dry: true });
if (!quoteRes.ok) {
  console.error(`FAIL dry quote: HTTP ${quoteRes.status}\n${quoteRes.text}`);
  process.exit(1);
}
const data = quoteRes.json;
console.log("OK dry quote. The app reads these fields from `quote`:");
console.log("   amountIn          :", data.quote?.amountIn);
console.log("   amountInFormatted :", data.quote?.amountInFormatted);
console.log("   depositAddress    :", data.quote?.depositAddress ?? "(none, expected for a dry quote)");
console.log("\nFull response:\n", JSON.stringify(data, null, 2));
