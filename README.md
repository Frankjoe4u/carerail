# Diaspora Health Pay

Pay a Nigerian clinic bill from any chain. The payer uses the token they already hold; the clinic receives **USDC on NEAR** for exactly the amount on the bill. Settlement runs through **NEAR Intents**.

Built solo for NEAR HACKATHON. Track: **Real-World Money** (invoicing, remittances, stablecoin payments).

## The problem

Families abroad regularly pay medical bills for relatives in Nigeria. Today that means bank transfers with high fees and slow settlement, or a middleman who converts currency. A clinic wants a fixed amount in a stable currency. The payer wants to use what they already have, on whichever chain they have it.

## What it does

1. A clinic creates an invoice (patient, description, amount in USDC) and shares the link.
2. The payer opens the link, picks a token and chain, and gets an exact amount and a deposit address.
3. NEAR Intents swaps the payer's tokens across chains and delivers the exact invoice amount as USDC on NEAR to the clinic's NEAR account.
4. The invoice updates from "Waiting for payment" to "Payment received, converting" to "Paid".

If a payment fails, 1Click refunds the payer's wallet and the invoice shows "Refunded to payer" so the payer can try again.

## How NEAR is used

| Tool | Role in this project |
| --- | --- |
| **NEAR Intents, 1Click API** | Cross-chain settlement. A quote with `swapType: EXACT_OUTPUT` fixes what the clinic receives, so the payer's cost adjusts to the invoice. `GET /v0/status` drives the invoice state. |
| **USDC on NEAR** | The payout asset. The clinic is paid in a stable currency on a NEAR account it controls. |

Code: `lib/intents.ts` (quotes, status, token list), `lib/invoices.ts` (status refresh).

## Try it in 2 minutes (demo mode, no wallet or funds)

Demo mode is the default. It runs the whole flow with a local simulator in place of the 1Click API, so nothing needs a wallet, a database or an account.

```bash
npm install
cp .env.example .env.local
npm run dev
```

| Do this | You should see |
| --- | --- |
| Open http://localhost:3000 | The landing page with a sample bill stamped PAID. |
| Click **Create an invoice**, then fill in: clinic `Greenfield Medical Centre`, NEAR account `greenfield.near`, patient `Ngozi A.`, bill `Antenatal scan`, amount `180`, and press **Create invoice** | An "Invoice created" box with a payer link. The invoice appears in the list as **Waiting for payment**. |
| Click **Open the payer view** | The bill: 180.00 USDC, with a token picker. |
| Pick **ETH on Ethereum**, enter any wallet address (for example `0x1234567890abcdef1234567890abcdef12345678`), press **Get payment details** | An exact amount (about `0.092769 ETH`), a deposit address, and a 30 minute countdown. |
| Press **Simulate the payment** | The progress moves to **Converting**, then within about 8 seconds the bill shows a **PAID** stamp and the clinic account that received the USDC. |
| Go back to `/clinic` | The invoice is listed as **Paid**. |

Bad input is rejected with a message under the field, for example a NEAR account like `Bad Account!` or an amount of `-5`.

## Live mode (real money, NEAR mainnet)

There is no testnet for NEAR Intents, so live mode uses mainnet. Use small amounts.

1. Set `DEMO_MODE=false` in `.env.local`. Optionally set `ONE_CLICK_JWT` (from https://partners.near-intents.org) to use the authenticated fee schedule.
2. Check the integration without moving money. This requests a **dry** quote (`dry: true`):

   ```bash
   npm run check:intents -- <your-base-wallet-address> <clinic-near-account>
   ```

3. Run `npm run dev`, create an invoice with a real NEAR account, open the payer link, request payment details, and send the exact amount to the deposit address from your wallet.

## Storage

Invoices are stored in a local JSON file (`.data/invoices.json`) with zero setup. To use Supabase instead, run `supabase/schema.sql` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. If the filesystem is read-only (serverless hosting), the app falls back to in-memory storage.

## Scope and known limits

- This is a prototype. The clinic dashboard at `/clinic` is not behind a login, so it lists every invoice on the deployment. Clinic sign-in is the first thing to add for real use.
- Amounts are entered in USDC. There is no naira conversion or fiat off-ramp; the clinic holds USDC on NEAR.
- The payer sends the deposit from their own wallet or exchange; there is no wallet-connect flow yet.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase (optional), NEAR Intents 1Click API.

## Disclosures

- All code in this repository was written during the hackathon window. There is no pre-hackathon baseline.
- Written with AI assistance (Claude Code). No templates or boilerplate beyond the standard Next.js setup and the npm packages in `package.json`.

## License

MIT
