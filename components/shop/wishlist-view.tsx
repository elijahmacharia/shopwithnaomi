"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loadProducts } from "@/actions/shop";
import { formatKsh, parseMoneyToCents } from "@/lib/domain/money";
import { useStore } from "./store-provider";

type Product = Awaited<ReturnType<typeof loadProducts>>[number];

export function WishlistView() {
  const store = useStore();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const ids = store.wishlist.map((item) => item.productId);
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    void loadProducts(ids).then(setProducts);
  }, [store.wishlist]);

  if (store.wishlist.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-brand-secondary bg-white p-8">
        <h1 className="font-display text-3xl">Your Wishlist Is Empty</h1>
        <p className="mt-2">Save products you&apos;re interested in and come back when you&apos;re ready to shop.</p>
        <Link href="/shop" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-brand-ink px-4 font-semibold text-white">
          Browse Products
        </Link>
      </div>
    );
  }

  function addAvailable() {
    let added = 0;
    let missing = 0;
    for (const item of store.wishlist) {
      const product = products.find((row) => row.id === item.productId);
      if (!product || !product.inStock) {
        missing += 1;
        continue;
      }
      store.addToCart(product.id, 1, product.stockQuantity);
      added += 1;
    }
    toast.success(missing ? `${added} products were added to your cart. ${missing} product is currently out of stock.` : "Added to cart.");
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Wishlist</h1>
        <button type="button" className="min-h-11 rounded-md bg-brand-ink px-4 font-semibold text-white" onClick={addAvailable}>
          Add all available to cart
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {store.wishlist.map((item) => {
          const product = products.find((row) => row.id === item.productId);
          if (!product) {
            return null;
          }
          const changed = item.savedPrice !== product.sellingPrice;
          return (
            <article key={item.productId} className="grid grid-cols-[96px_1fr] gap-3 rounded-md border border-brand-soft bg-white p-3">
              <div className="h-24 overflow-hidden rounded-md bg-brand-soft">{product.imageUrl ? <img src={product.imageUrl} alt="" className="h-full w-full object-cover" /> : null}</div>
              <div>
                <h2 className="font-semibold">{product.name}</h2>
                <p>{formatKsh(parseMoneyToCents(product.sellingPrice))}</p>
                {changed && <p className="text-sm">Price changed since you saved this item.</p>}
                <p className="text-sm">{product.inStock ? "In stock" : "Out of stock"}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" disabled={!product.inStock} className="min-h-11 rounded-md bg-brand-ink px-3 text-sm text-white disabled:opacity-50" onClick={() => store.addToCart(product.id, 1, product.stockQuantity)}>
                    Add to cart
                  </button>
                  <button type="button" className="min-h-11 px-2 text-sm" onClick={() => store.removeFromWishlist(product.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
