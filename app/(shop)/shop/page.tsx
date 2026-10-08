import { ProductCard } from "@/components/shop/product-card";
import { listCategories, listPublicProducts } from "@/services/catalog";
import Link from "next/link";

export const metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string }> }) {
  const params = await searchParams;
  const [{ products, total, page }, categories] = await Promise.all([
    listPublicProducts(params),
    listCategories(),
  ]);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Shop</h1>
        <p className="text-brand-muted">{total} products</p>
      </div>
      <form className="flex flex-col gap-3 sm:flex-row">
        <input name="q" defaultValue={params.q} aria-label="Search products" placeholder="Search by name" className="min-h-11 flex-1 rounded-md border border-brand-secondary px-3" />
        <select name="category" defaultValue={params.category ?? ""} aria-label="Category" className="min-h-11 rounded-md border border-brand-secondary px-3">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <button className="min-h-11 rounded-md bg-brand-ink px-4 font-semibold text-white" type="submit">
          Filter
        </button>
      </form>
      {products.length === 0 ? (
        <div className="rounded-md border border-dashed border-brand-secondary bg-white p-8">
          <h2 className="font-display text-2xl">No products found.</h2>
          <Link href="/shop" className="mt-3 inline-flex min-h-11 items-center font-semibold">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      <div className="flex gap-3">
        {page > 1 && (
          <Link className="min-h-11 leading-[2.75rem]" href={`/shop?page=${page - 1}&q=${params.q ?? ""}&category=${params.category ?? ""}`}>
            Previous
          </Link>
        )}
        {products.length === 12 && (
          <Link className="min-h-11 leading-[2.75rem]" href={`/shop?page=${page + 1}&q=${params.q ?? ""}&category=${params.category ?? ""}`}>
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
