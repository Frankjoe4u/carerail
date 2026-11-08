import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareRail",
  description:
    "Pay any clinic's bill from any chain. The clinic receives USDC on NEAR, settled with NEAR Intents.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06110f",
};

// Runs before first paint so the saved theme never flashes. Dark is the default.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('cr-theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark'}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
