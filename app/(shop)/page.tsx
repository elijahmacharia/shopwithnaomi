import Link from "next/link";
import { DatabaseSetup } from "@/components/database-setup";
import { ProductCard } from "@/components/shop/product-card";
import { readStorefront } from "@/lib/read-storefront";
import { storefrontHighlights } from "@/services/catalog";
import { getSettings } from "@/services/settings";

export default async function HomePage() {
  const result = await readStorefront(() => Promise.all([storefrontHighlights(), getSettings()]));
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const [highlights, settings] = result.data;
  return (
    <div className="grid gap-16">
      <section className="grid items-end gap-8 border-b border-brand-soft pb-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-muted">Household shop</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Everything Your Home Needs, In One Place.</h1>
          <p className="mt-4 max-w-xl text-lg text-brand-muted">Kitchenware, buckets, cereals, eggs, broiler chicken, cleaning products, and the other goods a house uses every week.</p>
          <Link href="/shop" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand-primary px-6 font-semibold text-brand-ink">
            Shop now
          </Link>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <p className="text-sm text-brand-muted">Open</p>
          <p className="mt-1 font-display text-2xl">{settings.openingHours}</p>
          <p className="mt-4 text-sm text-brand-muted">{settings.address}</p>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl">Shop by category</h2>
          <Link href="/categories" className="text-sm font-semibold underline decoration-brand-primary underline-offset-4">
            All categories
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {highlights.categories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.slug}`} className="flex min-h-24 flex-col justify-end rounded-2xl border border-brand-soft bg-white p-4">
              <span className="font-display text-xl">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title="In the shop" href="/shop" products={highlights.shelf} />
      {highlights.popular.length > 0 ? <ProductRow title="Selling well" href="/shop?sort=name" products={highlights.popular} /> : null}
      <ProductRow title="Recently added" href="/shop?sort=newest" products={highlights.newest} />

      <section className="grid gap-4 border-t border-brand-soft pt-10 md:grid-cols-3">
        <div>
          <h2 className="font-display text-2xl">Order</h2>
          <p className="mt-2 text-sm text-brand-muted">Add what you need, then send the order on WhatsApp. The shop checks the current price and stock before it confirms.</p>
        </div>
        <div>
          <h2 className="font-display text-2xl">Delivery or pickup</h2>
          <p className="mt-2 text-sm text-brand-muted">Choose home delivery or shop pickup at checkout. Give a landmark so the shop can find the address.</p>
        </div>
        <div>
          <h2 className="font-display text-2xl">Talk to the shop</h2>
          <p className="mt-2 text-sm text-brand-muted">Use the WhatsApp button or the contact page. You do not need an account to browse or order.</p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-display text-3xl">Contact {settings.businessName}</h2>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {settings.phone ? <p>Phone {settings.phone}</p> : null}
          {settings.email ? <p>Email {settings.email}</p> : null}
          {settings.address ? <p>{settings.address}</p> : null}
          {settings.openingHours ? <p>{settings.openingHours}</p> : null}
        </div>
        <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center font-semibold underline decoration-brand-primary underline-offset-4">
          Send a message
        </Link>
      </section>
    </div>
  );
}

function ProductRow({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Parameters<typeof ProductCard>[0]["product"][];
}) {
  if (products.length === 0) {
    return null;
  }
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-3xl">{title}</h2>
        <Link href={href} className="text-sm font-semibold underline decoration-brand-primary underline-offset-4">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
