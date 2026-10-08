import Link from "next/link";
import { archiveCategoryAction, archiveProductAction, categoryAction, saveProductAction } from "@/actions/ops";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Notice } from "@/components/notice";
import { Pager } from "@/components/pager";
import { listCategories, listOwnerProducts } from "@/services/catalog";

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; q?: string; page?: string }> }) {
  const params = await searchParams;
  const [data, categories] = await Promise.all([listOwnerProducts(params), listCategories()]);
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-3xl">Products</h1>
      <Notice error={params.error} notice={params.notice} />
      <form className="flex gap-2"><input name="q" defaultValue={params.q} aria-label="Search products" className="min-h-11 flex-1 rounded-md border px-3" /><button className="min-h-11 rounded-md bg-brand-ink px-4 text-white">Search</button></form>
      {data.products.length === 0 && <p>No products found. Add a product below.</p>}
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b"><th className="p-3">Product</th><th>Price</th><th>Cost</th><th>Stock</th><th>Margin</th><th></th></tr></thead>
          <tbody>
            {data.products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-3"><Link href={`/admin/products/${product.id}`}>{product.name}</Link>{product.archived ? " · Archived" : ""}{product.belowCost ? " · Below cost" : ""}</td>
                <td>KSh {product.sellingPrice}</td>
                <td>KSh {product.costPrice}</td>
                <td>{product.stockQuantity}</td>
                <td>{product.margin}%</td>
                <td>{!product.archived && <ConfirmSubmit action={archiveProductAction} id={product.id} label="Archive" message={`Are you sure you want to archive ${product.name}?`} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={data.page} total={data.total} pageSize={data.pageSize} path="/admin/products" query={{ q: params.q }} />
      <form action={saveProductAction} className="grid gap-3 rounded-md bg-white p-4 md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Add product</h2>
        <input name="name" required placeholder="Name" aria-label="Name" className="min-h-11 rounded-md border px-3" />
        <input name="sku" required placeholder="SKU" aria-label="SKU" className="min-h-11 rounded-md border px-3" />
        <select name="categoryId" aria-label="Category" className="min-h-11 rounded-md border px-3">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <input name="imageUrl" placeholder="Image path" aria-label="Image" className="min-h-11 rounded-md border px-3" />
        <input name="costPrice" required placeholder="Cost price" aria-label="Cost price" className="min-h-11 rounded-md border px-3" />
        <input name="sellingPrice" required placeholder="Selling price" aria-label="Selling price" className="min-h-11 rounded-md border px-3" />
        <input name="stockQuantity" type="number" min={0} defaultValue={0} aria-label="Current stock" className="min-h-11 rounded-md border px-3" />
        <input name="minimumStock" type="number" min={0} defaultValue={5} aria-label="Minimum stock" className="min-h-11 rounded-md border px-3" />
        <textarea name="description" required placeholder="Description" aria-label="Description" className="min-h-24 rounded-md border px-3 py-2 md:col-span-2" />
        <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked /> Active</label>
        <button className="min-h-11 rounded-md bg-brand-ink font-semibold text-white">Add product</button>
      </form>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Categories</h2>
        <ul className="divide-y rounded-md border bg-white">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-3 px-4 py-2">
              <span>{category.name}</span>
              <ConfirmSubmit action={archiveCategoryAction} id={category.id} label="Archive" message={`Archive the ${category.name} category? Products in it must already be archived.`} />
            </li>
          ))}
        </ul>
        <form action={categoryAction} className="flex flex-wrap gap-2">
          <input name="name" required placeholder="New category" aria-label="Category name" className="min-h-11 rounded-md border px-3" />
          <button className="min-h-11 rounded-md border px-4">Add category</button>
        </form>
      </section>
    </div>
  );
}
