import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseSetup } from "@/components/database-setup";
import { ProductActions } from "@/components/shop/product-actions";
import { formatKsh, parseMoneyToCents } from "@/lib/domain/money";
import { readStorefront } from "@/lib/read-storefront";
import { ProductCard } from "@/components/shop/product-card";
import { getPublicProduct, relatedProducts } from "@/services/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const result = await readStorefront(async () => getPublicProduct((await params).slug));
  if (!result.ok || !result.data) {
    return { title: "Product" };
  }
  return { title: result.data.name, description: result.data.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const result = await readStorefront(async () => getPublicProduct((await params).slug));
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const product = result.data;
  if (!product) {
    notFound();
  }
  const related = await relatedProducts(product.category.slug, product.id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    offers: { "@type": "Offer", priceCurrency: "KES", price: product.sellingPrice, availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };
  return (
    <article className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="aspect-square overflow-hidden rounded-md bg-brand-soft">
        {product.imageUrl ? <img src={product.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
      </div>
      <div>
        <p className="text-sm text-brand-muted">{product.category.name}</p>
        <h1 className="font-display text-4xl">{product.name}</h1>
        <p className="mt-2 text-2xl font-semibold">{formatKsh(parseMoneyToCents(product.sellingPrice))}</p>
        <p className="mt-2">{product.inStock ? `${product.stockQuantity} in stock` : "Out of stock"}</p>
        <p className="mt-4 max-w-xl">{product.description}</p>
        <ProductActions product={product} />
        <Link href="/shop" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold">
          Back to shop
        </Link>
      </div>
      {related.length > 0 ? (
        <section className="md:col-span-2">
          <h2 className="font-display text-2xl">More in {product.category.name}</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
