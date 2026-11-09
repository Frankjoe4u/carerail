# CareRail

Pay any clinic's bill from any chain. The payer uses the token they already hold; the clinic receives **USDC on NEAR** for exactly the amount on the bill. Settlement runs through **NEAR Intents**.

Built solo for NEAR HACKATHON. Track: **Real-World Money** (invoicing, remittances, stablecoin payments).

## The problem

People regularly pay medical bills for relatives in another country, for example families abroad paying a clinic back home in Nigeria. Today that means bank transfers with high fees and slow settlement, or a middleman who converts currency. A clinic wants a fixed amount in a stable currency. The payer wants to use what they already have, on whichever chain they have it.

## What it does

1. A clinic creates an invoice (patient, description, amount in USDC) and shares the link.
2. The payer opens the link, picks a token and chain, and gets an exact amount and a deposit address.
3. NEAR Intents swaps the payer's tokens across chains and delivers the exact invoice amount as USDC on NEAR to the clinic's NEAR account.
4. The invoice updates from "Waiting for payment" to "Payment received, converting" to "Paid".

If a payment fails, 1Click refunds the payer's wallet and the invoice shows "Refunded" so the payer can try again.

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
| Open http://localhost:3000 | The landing page: a sample paid invoice and "Pay with crypto" card, the journey from payer wallet through NEAR Intents to the clinic, and the three steps. Dark mode is the default; use the sun/moon button for light. |
| Click **Get started** (or **New invoice**). Step 1: patient `Ngozi A.`, bill `Antenatal scan`, amount `180`, then **Continue**. Step 2: clinic `Greenfield Medical Centre`, NEAR account `greenfield.near`, then **Create invoice** | An "Invoice created" screen with a payer link. The invoice appears in the list as **Waiting for payment**. |
| Click **Open the payer view** | The bill: 180.00 USDC, with a token picker. |
| Pick **ETH on Ethereum**, enter any wallet address as the refund address (for example `0x1234567890abcdef1234567890abcdef12345678`), press **Get payment details** | An exact amount (about `0.092769 ETH`), a deposit address, and a 30 minute countdown. |
| Press **Simulate the payment** | The progress moves to **Converting**, then within about 8 seconds the page shows **Payment successful** with the clinic account that received the USDC. |
| Go back to `/clinic` | The invoice is listed as **Paid**. |

Bad input is rejected with a message under the field, for example a NEAR account like `Bad Account!` or an amount of `-5`.

## Live mode (real money, NEAR mainnet)

There is no testnet for NEAR Intents, so live mode uses mainnet. Use small amounts.

1. Set `DEMO_MODE=false` in `.env.local`. Optionally set `ONE_CLICK_JWT` (a Distribution Channel key from https://partners.near-intents.org) to use your own API key.
2. Check the integration without moving money. This asks 1Click for quotes and never sends funds. Replace both values with your own EVM wallet address and a NEAR account that exists:

   ```bash
   node --env-file=.env.local scripts/check-intents.mjs 0xYourEvmWalletAddress yourname.near --all
   ```

   Each line shows whether a dry quote and a real quote (which reserves a deposit address) work for one token.
3. Run `npm run dev`, create an invoice, open the payer link, request payment details, and send the exact amount to the deposit address from your wallet.

In live mode:
- The clinic's NEAR account must exist. The app checks it when the invoice is created and rejects a misspelled account. The check uses `https://rpc.mainnet.near.org` by default (set `NEAR_RPC_URL` to change it) and never blocks invoice creation if that RPC is unreachable.
- Payers can pay from Ethereum, Base, Arbitrum and NEAR, which were verified with real quotes. Solana is not offered because it is untested, and the Bitcoin chain is not offered because it needs a bill of roughly 6.25 USDC or more.
- The refund address must be valid for the chain the payer chose, an `0x...` address for Ethereum, Base and Arbitrum, or a NEAR account for NEAR.

## Storage

Invoices are stored in a local JSON file (`.data/invoices.json`) with zero setup. To use Supabase instead, run `supabase/schema.sql` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. If the filesystem is read-only (serverless hosting), the app falls back to in-memory storage.

## Deploying on Vercel

Vercel functions do not share memory or disk, so invoices need a database or the payer link shows "Invoice not found". Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (run `supabase/schema.sql` first) for Production and Preview, then redeploy. Open `/api/health` to confirm: it reports `demoMode` and whether storage is `supabase`, without exposing any secret.

## Pages

| Path | Who | What |
| --- | --- | --- |
| `/` | Everyone | Landing page |
| `/pay` | Payer | Paste an invoice link to open the bill |
| `/pay/[id]` | Payer | Bill, token choice, quote and deposit address, progress, receipt |
| `/clinic` | Clinic | Invoice list with status, search and filters |
| `/clinic/new` | Clinic | Two-step invoice form and shareable link |

## Scope and known limits

- This is a prototype. The clinic dashboard at `/clinic` is not behind a login, so it lists every invoice on the deployment. Clinic sign-in is the first thing to add for real use.
- Amounts are entered in USDC. There is no naira conversion or fiat off-ramp; the clinic holds USDC on NEAR.
- The payer sends the deposit from their own wallet or exchange; there is no wallet-connect flow yet.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase (optional), NEAR Intents 1Click API.

## Disclosures

- All code in this repository was written during the hackathon window. There is no pre-hackathon baseline.
- Written with AI assistance (Claude Code). No templates or boilerplate beyond the standard Next.js setup and the npm packages in `package.json`.
- The two photos on the landing page (`public/images/hero.jpg`, `public/images/provider.jpg`) come from the author's own design mockup. The invoice, payment and dashboard figures on the landing page are sample data and are labelled as examples.
- In demo mode no real funds move. The payment shown in the demo video is simulated.

## License

MIT

## Design

Navy and teal, dark mode by default with a light toggle (saved in the browser). The landing page follows the author's mockup: hero with a payment preview, a payment-journey strip, three steps and a clinic dashboard preview. Clinics get a sidebar on desktop and a bottom bar on phones (Invoices, New invoice, Home). Payers get a single focused page: bill summary, payment method, payment details, success. Animations respect `prefers-reduced-motion`.
