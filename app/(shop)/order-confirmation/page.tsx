import Link from "next/link";

export const metadata = { title: "Order confirmation" };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string; wa?: string }> }) {
  const params = await searchParams;
  const whatsapp = params.wa ? decodeURIComponent(params.wa) : "";
  return (
    <div className="max-w-xl rounded-2xl border border-brand-soft bg-white p-6 shadow-card">
      <h1 className="font-display text-3xl">Order received</h1>
      <p className="mt-2">Order {params.order} is waiting for the shop. Opening WhatsApp does not mark it as paid.</p>
      {whatsapp && (
        <a href={whatsapp} className="mt-4 inline-flex min-h-12 items-center rounded-md bg-brand-ink px-4 font-semibold text-white">
          Open WhatsApp
        </a>
      )}
      <Link href="/shop" className="mt-4 block font-semibold">
        Continue shopping
      </Link>
    </div>
  );
}
