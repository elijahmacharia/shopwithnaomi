import Link from "next/link";
import { DatabaseSetup } from "@/components/database-setup";
import { ProductCard } from "@/components/shop/product-card";
import { readStorefront } from "@/lib/read-storefront";
import { listPublicProducts } from "@/services/catalog";

export default async function HomePage() {
  const result = await readStorefront(() => listPublicProducts({}));
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const { products } = result.data;
  return (
    <div className="grid gap-10">
      <section className="rounded-md bg-brand-primary px-6 py-12 sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide">Nairobi household shop</p>
        <h1 className="mt-2 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">Everything Your Home Needs, In One Place.</h1>
        <p className="mt-4 max-w-xl text-lg">Shop household essentials, kitchen products, food items, cleaning products, poultry and more.</p>
        <Link href="/shop" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-brand-ink px-5 font-semibold text-white">
          Shop Now
        </Link>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl">In the shop</h2>
          <Link href="/shop" className="text-sm font-semibold">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
