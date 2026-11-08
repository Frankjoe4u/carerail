import { PublicHeader } from "@/components/PublicHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-8">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-6xl border-t border-line px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-5 text-sm text-muted sm:px-8">
        Built for the NEAR hackathon. Bills are settled in USDC on NEAR through
        NEAR Intents.
      </footer>
    </>
  );
}
