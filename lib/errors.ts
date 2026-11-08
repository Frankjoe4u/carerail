/** Turns raw 1Click API messages into something a payer can act on. */
export function friendlyQuoteError(raw: string): string {
  const message = raw.replace(/^1Click API \d+:\s*/, "");

  if (/amount is too low/i.test(message)) {
    return "This bill is too small to pay with that token. Choose a different token.";
  }
  if (/refundTo is not valid/i.test(message)) {
    return "That wallet address is not valid for the chain you chose. Check it and try again.";
  }
  if (/recipient/i.test(message) && /not valid|invalid/i.test(message)) {
    return "The clinic's NEAR account could not be used. Ask the clinic to check the account on the invoice.";
  }
  if (/failed to get quote|no quotes|insufficient liquidity/i.test(message)) {
    return "No payment route is available for that token and amount right now. Try a different token.";
  }
  if (/internal server error/i.test(message)) {
    return "NEAR Intents could not create a quote. Check that the clinic's NEAR account on this invoice exists, or try a different token.";
  }
  if (/fetch failed|ENOTFOUND|ECONNRE|EAI_AGAIN/i.test(message)) {
    return "Could not reach NEAR Intents. Check your connection and try again.";
  }
  if (/timed out|timeout|aborted/i.test(message)) {
    return "NEAR Intents took too long to answer. Try again in a moment.";
  }
  return message || "Could not create a payment quote. Try again.";
}
