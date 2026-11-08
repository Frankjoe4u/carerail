import { FindBillClient } from "@/components/FindBillClient";

export const metadata = { title: "Pay a medical bill | CareRail" };

export default function PayIndexPage() {
  return (
    <div className="mx-auto max-w-lg pt-6">
      <h1 className="display text-4xl">Pay a medical bill</h1>
      <p className="mt-3 text-muted">
        The clinic sends you a link. Paste it here, or just open it, to see the
        bill and choose how to pay.
      </p>
      <FindBillClient />
    </div>
  );
}
