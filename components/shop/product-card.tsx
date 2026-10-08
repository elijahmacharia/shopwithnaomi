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
    <article className="flex h-full flex-col rounded-md border border-brand-soft bg-white p-3 shadow-card">
      <Link href={`/shop/${product.slug}`}>
        <div className="mb-3 aspect-square overflow-hidden rounded-md bg-brand-soft">
          {product.imageUrl ? <img src={product.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <p className="text-xs text-brand-muted">{product.category.name}</p>
        <h2 className="font-display text-lg">{product.name}</h2>
      </Link>
      <p className="mt-1 font-semibold">{formatKsh(parseMoneyToCents(product.sellingPrice))}</p>
      <p className="text-sm">{product.inStock ? "In stock" : "Out of stock"}</p>
      <div className="mt-auto flex gap-2 pt-3">
        <button
          type="button"
          className="min-h-11 flex-1 rounded-md bg-brand-ink px-3 text-sm font-semibold text-white disabled:opacity-50"
          disabled={!product.inStock}
          onClick={() => store.addToCart(product.id, 1, product.stockQuantity)}
        >
          Add to cart
        </button>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="min-h-11 min-w-11 rounded-md border border-brand-secondary"
          onClick={() => store.toggleWishlist(product.id, product.sellingPrice)}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
    </article>
  );
}
