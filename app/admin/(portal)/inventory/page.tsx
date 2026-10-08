import { stockAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { listInventory, listMovements } from "@/services/inventory";

export const metadata = { title: "Stock" };

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; q?: string }> }) {
  const params = await searchParams;
  const [stock, movements] = await Promise.all([listInventory(params), listMovements({})]);
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-3xl">Stock</h1>
      <Notice error={params.error} notice={params.notice} />
      <form action={stockAction} className="grid gap-2 rounded-md bg-white p-4 sm:grid-cols-4">
        <select name="productId" aria-label="Product" className="min-h-11 rounded-md border px-3">{stock.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
        <input name="quantity" type="number" required placeholder="Quantity, use - to remove" aria-label="Quantity" className="min-h-11 rounded-md border px-3" />
        <input name="reason" required placeholder="Reason" aria-label="Reason" className="min-h-11 rounded-md border px-3" />
        <button className="min-h-11 rounded-md bg-brand-ink text-white">Update stock</button>
      </form>
      <ul className="divide-y rounded-md border bg-white">
        {stock.products.map((product) => <li key={product.id} className="flex justify-between px-4 py-3"><span>{product.name}</span><span>{product.stockQuantity}{product.low ? " · Low" : ""}</span></li>)}
      </ul>
      <h2 className="font-display text-2xl">Recent movements</h2>
      <ul className="divide-y rounded-md border bg-white text-sm">
        {movements.movements.map((row) => <li key={row.id} className="px-4 py-3">{row.product} · {row.type} · {row.quantity} · {row.before} → {row.after}</li>)}
      </ul>
    </div>
  );
}
