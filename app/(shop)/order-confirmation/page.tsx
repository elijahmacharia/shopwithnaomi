import Link from "next/link";

export const metadata = { title: "Order confirmation" };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string; wa?: string }> }) {
  const params = await searchParams;
  const whatsapp = params.wa ? decodeURIComponent(params.wa) : "";
  return (
    <div className="max-w-xl rounded-md bg-white p-6">
      <h1 className="font-display text-3xl">Order received</h1>
      <p className="mt-2">Order number {params.order}. Send it on WhatsApp so the shop can confirm.</p>
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
