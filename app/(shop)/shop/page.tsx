import { DatabaseSetup } from "@/components/database-setup";
import { Pager } from "@/components/pager";
import { ProductCard } from "@/components/shop/product-card";
import { readStorefront } from "@/lib/read-storefront";
import { listCategories, listPublicProducts } from "@/services/catalog";
import Link from "next/link";

export const metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string; sort?: string; stock?: string }> }) {
  const params = await searchParams;
  const result = await readStorefront(() => Promise.all([listPublicProducts(params), listCategories()]));
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const [{ products, total, page, pageSize }, categories] = result.data;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const query = { q: params.q, category: params.category, sort: params.sort, stock: params.stock };
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-brand-muted">Home / Shop</p>
          <h1 className="mt-1 font-display text-4xl">All products</h1>
          <p className="mt-2 max-w-xl text-brand-muted">Household goods, kitchen, food, cleaning, and poultry.</p>
        </div>
        <p className="text-sm text-brand-muted">Showing {from}–{to} of {total}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/shop" className={`rounded-full px-4 py-2 text-sm ${!params.category ? "bg-brand-primary font-semibold" : "bg-white"}`}>All</Link>
        {categories.map((category) => (
          <Link key={category.id} href={`/shop?category=${category.slug}`} className={`rounded-full px-4 py-2 text-sm ${params.category === category.slug ? "bg-brand-primary font-semibold" : "bg-white"}`}>
            {category.name}
          </Link>
        ))}
        <form className="ml-auto flex flex-wrap gap-2">
          <input type="hidden" name="category" value={params.category ?? ""} />
          <input name="q" defaultValue={params.q} aria-label="Search products" placeholder="Search" className="min-h-11 rounded-full border border-brand-soft bg-white px-4" />
          <select name="stock" defaultValue={params.stock ?? ""} aria-label="Availability" className="min-h-11 rounded-full border border-brand-soft bg-white px-3">
            <option value="">Any stock</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select name="sort" defaultValue={params.sort ?? "name"} aria-label="Sort" className="min-h-11 rounded-full border border-brand-soft bg-white px-3">
            <option value="name">Name</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
          </select>
          <button className="min-h-11 rounded-full bg-brand-ink px-4 text-sm font-semibold text-white" type="submit">Apply</button>
        </form>
      </div>
      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand-secondary bg-white p-10 text-center">
          <h2 className="font-display text-2xl">No products found.</h2>
          <Link href="/shop" className="mt-3 inline-flex min-h-11 items-center font-semibold">Clear filters</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      <Pager page={page} total={total} pageSize={pageSize} path="/shop" query={query} />
    </div>
  );
}
