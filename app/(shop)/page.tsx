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
      <section className="grid items-center gap-6 rounded-3xl bg-brand-primary px-6 py-12 sm:px-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide">Nairobi household shop</p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">Everything Your Home Needs, In One Place.</h1>
          <p className="mt-4 max-w-xl text-lg">Shop household essentials, kitchen products, food items, cleaning products, poultry and more.</p>
          <Link href="/shop" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand-ink px-6 font-semibold text-white">
            Shop now
          </Link>
        </div>
        <div className="hidden rounded-3xl bg-brand-soft p-8 lg:block">
          <p className="font-display text-3xl">In stock today</p>
          <p className="mt-3 text-brand-muted">Flour, oil, cleaning, and the things a house runs out of first.</p>
        </div>
      </section>
      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl">In the shop</h2>
          <Link href="/shop" className="text-sm font-semibold underline decoration-brand-primary underline-offset-4">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
