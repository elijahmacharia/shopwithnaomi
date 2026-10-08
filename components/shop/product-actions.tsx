"use client";

import { useStore } from "./store-provider";

export function ProductActions({
  product,
}: {
  product: { id: string; name: string; sellingPrice: string; stockQuantity: number; inStock: boolean };
}) {
  const store = useStore();
  const saved = store.isInWishlist(product.id);
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        disabled={!product.inStock}
        className="min-h-12 rounded-md bg-brand-ink px-5 font-semibold text-white disabled:opacity-50"
        onClick={() => store.addToCart(product.id, 1, product.stockQuantity)}
      >
        Add to cart
      </button>
      <button type="button" className="min-h-12 rounded-md border border-brand-secondary px-5" onClick={() => store.toggleWishlist(product.id, product.sellingPrice)}>
        {saved ? "♥ Wishlist" : "♡ Wishlist"}
      </button>
    </div>
  );
}
