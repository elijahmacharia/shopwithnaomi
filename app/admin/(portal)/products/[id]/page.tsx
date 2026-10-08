import { notFound } from "next/navigation";
import { saveProductAction } from "@/actions/ops";
import { listCategories, getOwnerProduct } from "@/services/catalog";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, categories] = await Promise.all([getOwnerProduct((await params).id), listCategories()]);
  if (!product) {
    notFound();
  }
  return (
    <form action={saveProductAction} className="grid max-w-xl gap-3">
      <h1 className="font-display text-3xl">Edit {product.name}</h1>
      <input type="hidden" name="id" value={product.id} />
      <input name="name" defaultValue={product.name} aria-label="Name" className="min-h-11 rounded-md border px-3" />
      <input name="sku" defaultValue={product.sku} aria-label="SKU" className="min-h-11 rounded-md border px-3" />
      <select name="categoryId" defaultValue={product.categoryId} aria-label="Category" className="min-h-11 rounded-md border px-3">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
      <input name="imageUrl" defaultValue={product.imageUrl ?? ""} aria-label="Image" className="min-h-11 rounded-md border px-3" />
      <input name="costPrice" defaultValue={product.costPrice} aria-label="Cost price" className="min-h-11 rounded-md border px-3" />
      <input name="sellingPrice" defaultValue={product.sellingPrice} aria-label="Selling price" className="min-h-11 rounded-md border px-3" />
      <input name="minimumStock" type="number" defaultValue={product.minimumStock} aria-label="Minimum stock" className="min-h-11 rounded-md border px-3" />
      <textarea name="description" defaultValue={product.description} aria-label="Description" className="min-h-24 rounded-md border px-3 py-2" />
      <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={product.isActive} /> Active</label>
      <p>Profit KSh {product.profit} · margin {product.margin}%</p>
      <button className="min-h-11 rounded-md bg-brand-ink font-semibold text-white">Save product</button>
    </form>
  );
}
