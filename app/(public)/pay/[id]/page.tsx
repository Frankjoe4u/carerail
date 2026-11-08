import { PayClient } from "@/components/PayClient";

export const metadata = { title: "Pay a bill | CareRail" };

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PayClient id={id} />;
}
