import Link from "next/link";
import { archiveCategoryAction, archiveProductAction, categoryAction, saveProductAction } from "@/actions/ops";
import { ImagePicker } from "@/components/image-picker";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Notice } from "@/components/notice";
import { Pager } from "@/components/pager";
import { listCategories, listOwnerProducts } from "@/services/catalog";

export const metadata = { title: "Products" };

const field = "min-h-11 rounded-xl border border-brand-soft bg-white px-3";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; q?: string; page?: string }> }) {
  const params = await searchParams;
  const [data, categories] = await Promise.all([listOwnerProducts(params), listCategories()]);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Products</h1>
        <p className="text-sm text-brand-muted">Add a product, change it, or remove it from the shop. Removed products stay in past sales.</p>
      </div>
      <Notice error={params.error} notice={params.notice} />
      <form action={saveProductAction} className="grid gap-3 rounded-2xl border border-brand-soft bg-white p-4 shadow-card md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Add product</h2>
        <input name="name" required placeholder="Name" aria-label="Name" className={field} />
        <input name="sku" required placeholder="SKU" aria-label="SKU" className={field} />
        <select name="categoryId" aria-label="Category" className={field}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <div className="md:col-span-2">
          <ImagePicker />
        </div>
        <input name="costPrice" required placeholder="Cost price" aria-label="Cost price" className={field} />
        <input name="sellingPrice" required placeholder="Selling price" aria-label="Selling price" className={field} />
        <input name="stockQuantity" type="number" min={0} defaultValue={0} aria-label="Current stock" className={field} />
        <input name="minimumStock" type="number" min={0} defaultValue={5} aria-label="Minimum stock" className={field} />
        <textarea name="description" required placeholder="Description" aria-label="Description" className="min-h-24 rounded-xl border border-brand-soft px-3 py-2 md:col-span-2" />
        <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked /> Show in the shop</label>
        <button className="min-h-11 rounded-xl bg-brand-primary font-semibold text-brand-ink">Add product</button>
      </form>
      <form className="flex gap-2">
        <input name="q" defaultValue={params.q} aria-label="Search products" className={`${field} flex-1`} />
        <button className="min-h-11 rounded-xl bg-brand-ink px-4 text-white">Search</button>
      </form>
      {data.products.length === 0 && <p>No products found. Add a product above.</p>}
      <div className="overflow-x-auto rounded-2xl border border-brand-soft bg-white shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="border-b border-brand-soft text-brand-muted"><th className="p-3">Product</th><th>Price</th><th>Cost</th><th>Stock</th><th>Margin</th><th></th></tr></thead>
          <tbody>
            {data.products.map((product) => (
              <tr key={product.id} className="border-b border-brand-soft">
                <td className="p-3">
                  <Link href={`/admin/products/${product.id}`} className="font-semibold">{product.name}</Link>
                  <p className="text-brand-muted">{product.archived ? "Removed" : "In the catalogue"}{product.belowCost ? " · Below cost" : ""}</p>
                </td>
                <td>KSh {product.sellingPrice}</td>
                <td>KSh {product.costPrice}</td>
                <td>{product.stockQuantity}</td>
                <td>{product.margin}%</td>
                <td>{!product.archived && <ConfirmSubmit action={archiveProductAction} id={product.id} label="Archive" message={`Archive ${product.name}? It leaves the shop. Past sales and stock records stay.`} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={data.page} total={data.total} pageSize={data.pageSize} path="/admin/products" query={{ q: params.q }} />
      <section className="grid gap-3 rounded-2xl border border-brand-soft bg-white p-4">
        <h2 className="font-display text-2xl">Categories</h2>
        <ul className="divide-y divide-brand-soft">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-3 py-2">
              <span>{category.name}</span>
              <ConfirmSubmit action={archiveCategoryAction} id={category.id} label="Remove" message={`Remove the ${category.name} category? Products in it must already be removed.`} />
            </li>
          ))}
        </ul>
        <form action={categoryAction} className="flex flex-wrap gap-2">
          <input name="name" required placeholder="New category" aria-label="Category name" className={field} />
          <button className="min-h-11 rounded-xl border border-brand-secondary px-4">Add category</button>
        </form>
      </section>
    </div>
  );
}
