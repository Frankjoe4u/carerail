export type InvoiceStatus =
  | "awaiting_payment"
  | "processing"
  | "paid"
  | "refunded"
  | "failed";

export interface PayToken {
  assetId: string;
  symbol: string;
  blockchain: string;
  decimals: number;
  /** USD price, used for display and demo-mode quotes */
  price: number;
}

export interface PaymentQuote {
  depositAddress: string;
  originAssetId: string;
  originSymbol: string;
  originChain: string;
  originDecimals: number;
  /** Amount the payer must send, in the origin token's smallest unit */
  amountIn: string;
  amountInFormatted: string;
  /** ISO timestamp: the deposit must arrive before this */
  deadline: string;
  refundTo: string;
  createdAt: string;
  /** True when produced by demo mode (no real money moves) */
  mock: boolean;
  /** Demo mode only: when the user pressed "Simulate payment" */
  simulatedDepositAt?: string;
}

export interface Invoice {
  id: string;
  clinicName: string;
  /** NEAR account that receives the USDC payout */
  clinicNearAccount: string;
  patientName: string;
  description: string;
  /** Decimal string in USDC, e.g. "250.00" */
  amountUsdc: string;
  status: InvoiceStatus;
  /** Last raw status reported by 1Click (or the demo simulator) */
  intentsStatus?: string;
  createdAt: string;
  paidAt?: string;
  quote?: PaymentQuote;
}

export interface QuotePreview {
  originSymbol: string;
  originChain: string;
  amountInFormatted: string;
  mock: boolean;
}
