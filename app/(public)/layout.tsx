import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-8">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
