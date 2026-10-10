import { notFound } from "next/navigation";
import { archiveProductAction, deleteProductAction, saveProductAction } from "@/actions/ops";
import { ImagePicker } from "@/components/image-picker";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Notice } from "@/components/notice";
import { listCategories, getOwnerProduct } from "@/services/catalog";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; notice?: string }> }) {
  const [route, query] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([getOwnerProduct(route.id), listCategories()]);
  if (!product) {
    notFound();
  }
  return (
    <div className="grid gap-6">
      <Notice error={query.error} notice={query.notice} />
      <form action={saveProductAction} className="grid max-w-xl gap-3">
        <h1 className="font-display text-3xl">Edit {product.name}</h1>
        <input type="hidden" name="id" value={product.id} />
        <label className="grid gap-1 text-sm">Name<input name="name" defaultValue={product.name} required className="min-h-11 rounded-md border px-3" /></label>
        <label className="grid gap-1 text-sm">SKU<input name="sku" defaultValue={product.sku} required className="min-h-11 rounded-md border px-3" /></label>
        <label className="grid gap-1 text-sm">Category<select name="categoryId" defaultValue={product.categoryId} className="min-h-11 rounded-md border px-3">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <input type="hidden" name="imageUrl" defaultValue={product.imageUrl ?? ""} />
        <ImagePicker label="Replace image" currentUrl={product.imageUrl} />
        <label className="grid gap-1 text-sm">Cost price<input name="costPrice" defaultValue={product.costPrice} required className="min-h-11 rounded-md border px-3" /></label>
        <label className="grid gap-1 text-sm">Selling price<input name="sellingPrice" defaultValue={product.sellingPrice} required className="min-h-11 rounded-md border px-3" /></label>
        <label className="grid gap-1 text-sm">Minimum stock<input name="minimumStock" type="number" defaultValue={product.minimumStock} className="min-h-11 rounded-md border px-3" /></label>
        <label className="grid gap-1 text-sm">Description<textarea name="description" defaultValue={product.description} required className="min-h-24 rounded-md border px-3 py-2" /></label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={product.isActive} /> Active</label>
        <p>Stock {product.stockQuantity} · profit KSh {product.profit} · margin {product.margin}%{product.belowCost ? " · Selling below cost" : ""}</p>
        <button className="min-h-11 rounded-md bg-brand-ink font-semibold text-white">Save product</button>
      </form>
      <div className="flex flex-wrap gap-3">
        {!product.archived && <ConfirmSubmit action={archiveProductAction} id={product.id} label="Archive product" message={`Archive ${product.name}? It leaves the shop. Past sales and stock records stay.`} />}
        {product.canDelete ? <ConfirmSubmit action={deleteProductAction} id={product.id} label="Delete permanently" message={`Delete ${product.name} permanently? This is only available because it has no sales or stock history.`} /> : <p className="max-w-xl text-sm text-brand-muted">This product has sales or stock history, so it cannot be deleted. Archive it to hide it from the shop.</p>}
      </div>
      <section>
        <h2 className="font-display text-2xl">Sales</h2>
        {product.sales.length === 0 ? <p className="mt-2">No sales yet.</p> : (
          <ul className="mt-2 divide-y rounded-md border bg-white">{product.sales.map((sale) => <li key={sale.id} className="px-4 py-2">{sale.saleNumber} · {sale.quantity} · KSh {sale.subtotal}</li>)}</ul>
        )}
      </section>
      <section>
        <h2 className="font-display text-2xl">Price history</h2>
        {product.priceHistory.length === 0 ? <p className="mt-2">No price changes yet.</p> : (
          <ul className="mt-2 divide-y rounded-md border bg-white">{product.priceHistory.map((row) => <li key={row.id} className="px-4 py-2">KSh {row.oldPrice} → KSh {row.newPrice} · {row.by} · {row.reason}</li>)}</ul>
        )}
      </section>
      <section>
        <h2 className="font-display text-2xl">Stock movement</h2>
        {product.movements.length === 0 ? <p className="mt-2">No stock movements yet.</p> : (
          <ul className="mt-2 divide-y rounded-md border bg-white">{product.movements.map((row) => <li key={row.id} className="px-4 py-2">{row.type} · {row.before} → {row.after} · {row.by} · {row.reason}</li>)}</ul>
        )}
      </section>
    </div>
  );
}
