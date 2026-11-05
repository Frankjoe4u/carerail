import { NextResponse } from "next/server";
import { getPayTokens, isDemo } from "@/lib/intents";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ tokens: await getPayTokens(), demo: isDemo() });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not load supported tokens from NEAR Intents.",
      },
      { status: 502 },
    );
  }
}
