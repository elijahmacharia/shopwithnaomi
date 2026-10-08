"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProducts } from "@/actions/shop";
import { formatKsh, parseMoneyToCents } from "@/lib/domain/money";
import { useStore } from "./store-provider";

type Product = Awaited<ReturnType<typeof loadProducts>>[number];

export function CartView() {
  const store = useStore();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const ids = store.cart.map((line) => line.productId);
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    void loadProducts(ids).then(setProducts);
  }, [store.cart]);

  if (store.cart.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-brand-secondary bg-white p-8">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link href="/shop" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-brand-ink px-4 font-semibold text-white">
          Browse products
        </Link>
      </div>
    );
  }

  const lines = store.cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    return product ? [{ line, product }] : [];
  });
  const total = lines.reduce((sum, { line, product }) => sum + parseMoneyToCents(product.sellingPrice) * line.quantity, 0);

  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Cart</h1>
      <ul className="divide-y divide-brand-soft rounded-md border border-brand-soft bg-white">
        {lines.map(({ line, product }) => (
          <li key={product.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 className="font-semibold">{product.name}</h2>
              <p>{formatKsh(parseMoneyToCents(product.sellingPrice))}</p>
              {!product.inStock && <p className="text-sm text-red-800">Out of stock</p>}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="min-h-11 min-w-11 rounded-md border" aria-label={`Decrease ${product.name}`} onClick={() => store.setQuantity(product.id, line.quantity - 1)}>
                −
              </button>
              <span>{line.quantity}</span>
              <button type="button" className="min-h-11 min-w-11 rounded-md border" aria-label={`Increase ${product.name}`} onClick={() => store.setQuantity(product.id, Math.min(line.quantity + 1, product.stockQuantity))}>
                +
              </button>
              <button type="button" className="min-h-11 px-2 text-sm" onClick={() => store.removeFromCart(product.id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xl font-semibold">Total {formatKsh(total)}</p>
      <div className="flex gap-3">
        <button type="button" className="min-h-11 rounded-md border px-4" onClick={() => store.clearCart()}>
          Clear cart
        </button>
        <Link href="/checkout" className="inline-flex min-h-11 items-center rounded-md bg-brand-ink px-4 font-semibold text-white">
          Checkout
        </Link>
      </div>
    </div>
  );
}
