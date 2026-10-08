import { priceRequestAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { listPriceRequests } from "@/services/approvals";
import { listPosProducts } from "@/services/sales";

export const metadata = { title: "Price requests" };

export default async function PriceRequestPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const params = await searchParams;
  const [requests, products] = await Promise.all([listPriceRequests("own"), listPosProducts()]);
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-3xl">Request a price change</h1>
      <Notice error={params.error} notice={params.notice} />
      <form action={priceRequestAction} className="grid max-w-xl gap-3 rounded-md bg-white p-4">
        <select name="productId" aria-label="Product" className="min-h-11 rounded-md border px-3">{products.map((product) => <option key={product.id} value={product.id}>{product.name} · KSh {product.sellingPrice}</option>)}</select>
        <input name="requestedPrice" required placeholder="Requested price" aria-label="Requested price" className="min-h-11 rounded-md border px-3" />
        <textarea name="reason" required placeholder="Reason" aria-label="Reason" className="min-h-24 rounded-md border px-3 py-2" />
        <button className="min-h-11 rounded-md bg-brand-ink font-semibold text-white">Submit request</button>
      </form>
      <ul className="divide-y rounded-md border bg-white">
        {requests.map((request) => <li key={request.id} className="px-4 py-3">{request.product}: KSh {request.currentPrice} → KSh {request.requestedPrice} · {request.status}</li>)}
      </ul>
    </div>
  );
}
