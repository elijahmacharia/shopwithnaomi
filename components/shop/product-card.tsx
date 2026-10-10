"use client";

import Link from "next/link";
import { formatKsh, parseMoneyToCents } from "@/lib/domain/money";
import { useStore } from "./store-provider";

export type CardProduct = {
  id: string;
  name: string;
  slug: string;
  sellingPrice: string;
  stockQuantity: number;
  inStock: boolean;
  imageUrl: string | null;
  category: { name: string };
};

export function ProductCard({ product }: { product: CardProduct }) {
  const store = useStore();
  const saved = store.isInWishlist(product.id);
  return (
    <article className="group flex h-full flex-col">
      <div className="relative">
        <Link href={`/shop/${product.slug}`} className="block overflow-hidden rounded-2xl bg-brand-soft">
          <div className="aspect-[4/5]">
            {product.imageUrl ? <img src={product.imageUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : null}
          </div>
        </Link>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-brand-ink shadow-card"
          onClick={() => store.toggleWishlist(product.id, product.sellingPrice)}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
      <p className="mt-3 text-xs uppercase tracking-wide text-brand-muted">{product.category.name}</p>
      <Link href={`/shop/${product.slug}`} className="font-display text-lg leading-snug">
        {product.name}
      </Link>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="font-semibold">{formatKsh(parseMoneyToCents(product.sellingPrice))}</p>
        <button
          type="button"
          className="min-h-10 rounded-full bg-brand-soft px-3 text-sm font-semibold disabled:opacity-50"
          disabled={!product.inStock}
          onClick={() => store.addToCart(product.id, 1, product.stockQuantity)}
        >
          {product.inStock ? "Add" : "Out"}
        </button>
      </div>
    </article>
  );
}
