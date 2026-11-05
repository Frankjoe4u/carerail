import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Diaspora Health Pay",
  description:
    "Pay a Nigerian clinic bill from any chain. The clinic receives USDC on NEAR, settled with NEAR Intents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-5xl px-5 pb-10 text-sm text-muted sm:px-8">
          Built for NEAR HACKATHON. Payments settle through NEAR Intents.
        </footer>
      </body>
    </html>
  );
}
