#!/usr/bin/env node
/**
 * Live check against the NEAR Intents 1Click API. Moves no money.
 *
 *   node scripts/check-intents.mjs <your-base-wallet-address> <clinic-near-account>
 *
 * 1. Fetches the token list and finds USDC on NEAR (the clinic payout asset)
 * 2. Requests a DRY quote (dry: true): pay with USDC on Base, clinic receives 1.00 USDC on NEAR
 * 3. Prints what the app will rely on: asset ids, amountIn, and the response shape
 *
 * Optional: ONE_CLICK_JWT=... to use the authenticated fee schedule.
 */
const BASE_URL = "https://1click.chaindefuser.com";
const [refundTo, recipient] = process.argv.slice(2);

if (!refundTo || !recipient) {
  console.error("Usage: node scripts/check-intents.mjs <base-wallet-address> <clinic-near-account>");
  process.exit(1);
}

const headers = { "Content-Type": "application/json" };
if (process.env.ONE_CLICK_JWT) headers.Authorization = `Bearer ${process.env.ONE_CLICK_JWT}`;

const tokensRes = await fetch(`${BASE_URL}/v0/tokens`, { headers });
if (!tokensRes.ok) {
  console.error(`FAIL tokens: HTTP ${tokensRes.status}`);
  process.exit(1);
}
const tokens = await tokensRes.json();
const destination = tokens.find((t) => t.symbol === "USDC" && t.blockchain === "near");
const origin = tokens.find((t) => t.symbol === "USDC" && t.blockchain === "base");
console.log(`OK tokens: ${tokens.length} listed`);
console.log("   destination USDC on NEAR:", destination?.assetId ?? "NOT FOUND");
console.log("   origin USDC on Base:     ", origin?.assetId ?? "NOT FOUND");
if (!destination || !origin) process.exit(1);

const body = {
  dry: true,
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

const quoteRes = await fetch(`${BASE_URL}/v0/quote`, { method: "POST", headers, body: JSON.stringify(body) });
const text = await quoteRes.text();
if (!quoteRes.ok) {
  console.error(`FAIL dry quote: HTTP ${quoteRes.status}\n${text}`);
  process.exit(1);
}
const data = JSON.parse(text);
console.log("OK dry quote. The app reads these fields from `quote`:");
console.log("   amountIn          :", data.quote?.amountIn);
console.log("   amountInFormatted :", data.quote?.amountInFormatted);
console.log("   deadline          :", data.quote?.deadline);
console.log("   depositAddress    :", data.quote?.depositAddress ?? "(none, expected for a dry quote)");
console.log("\nFull response:\n", JSON.stringify(data, null, 2));
