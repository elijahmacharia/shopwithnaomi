import { stockTakeAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { listStockForTake } from "@/services/inventory";

export const metadata = { title: "Stock take" };

export default async function StockTakePage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const params = await searchParams;
  const products = await listStockForTake();
  return (
    <div>
      <h1 className="font-display text-3xl">Stock take</h1>
      <Notice error={params.error} notice={params.notice} />
      <form action={stockTakeAction} className="mt-4 grid gap-3">
        <input name="notes" placeholder="Notes" aria-label="Notes" className="min-h-11 rounded-md border px-3" />
        {products.map((product) => (
          <div key={product.id} className="grid items-center gap-2 rounded-md bg-white p-3 sm:grid-cols-[1fr_80px_120px_1fr]">
            <input type="hidden" name="productId" value={product.id} />
            <span>{product.name}<span className="block text-sm text-brand-muted">System {product.stockQuantity}</span></span>
            <span className="text-sm">System {product.stockQuantity}</span>
            <input name="physicalQuantity" type="number" min={0} defaultValue={product.stockQuantity} aria-label={`Physical quantity for ${product.name}`} className="min-h-11 rounded-md border px-3" />
            <input name="reason" placeholder="Reason if different" aria-label={`Reason for ${product.name}`} className="min-h-11 rounded-md border px-3" />
          </div>
        ))}
        <button className="min-h-12 rounded-md bg-brand-ink font-semibold text-white">Confirm stock take</button>
      </form>
    </div>
  );
}
