"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { checkoutAction, loadProducts } from "@/actions/shop";
import { formatKsh, parseMoneyToCents } from "@/lib/domain/money";
import { useStore } from "./store-provider";

export function CheckoutForm() {
  const store = useStore();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [method, setMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const ids = store.cart.map((line) => line.productId);
    if (ids.length === 0) {
      return;
    }
    void loadProducts(ids).then((products) => {
      const cents = store.cart.reduce((sum, line) => {
        const product = products.find((item) => item.id === line.productId);
        return product ? sum + parseMoneyToCents(product.sellingPrice) * line.quantity : sum;
      }, 0);
      setTotal(cents);
    });
  }, [store.cart]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await checkoutAction({
      items: store.cart,
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      whatsappPhone: String(form.get("whatsappPhone") ?? ""),
      email: String(form.get("email") ?? ""),
      address: String(form.get("address") ?? ""),
      landmark: String(form.get("landmark") ?? ""),
      deliveryMethod: method,
      notes: String(form.get("notes") ?? ""),
      clientRequestId: crypto.randomUUID(),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    store.clearCart();
    sessionStorage.setItem("naome.lastOrder", JSON.stringify(result.order));
    router.push(`/order-confirmation?order=${result.order.orderNumber}&wa=${encodeURIComponent(result.order.whatsappUrl)}`);
  }

  if (store.cart.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <form onSubmit={submit} className="grid max-w-xl gap-4">
      <h1 className="font-display text-3xl">Checkout</h1>
      <p className="text-lg font-semibold">Total {formatKsh(total)}</p>
      <label className="grid gap-1 text-sm">Full name<input name="fullName" required className="min-h-11 rounded-md border px-3" /></label>
      <label className="grid gap-1 text-sm">Phone number<input name="phone" required className="min-h-11 rounded-md border px-3" /></label>
      <label className="grid gap-1 text-sm">WhatsApp number<input name="whatsappPhone" required className="min-h-11 rounded-md border px-3" /></label>
      <label className="grid gap-1 text-sm">Email (optional)<input name="email" type="email" className="min-h-11 rounded-md border px-3" /></label>
      <fieldset className="flex gap-4">
        <label><input type="radio" name="method" checked={method === "DELIVERY"} onChange={() => setMethod("DELIVERY")} /> Delivery</label>
        <label><input type="radio" name="method" checked={method === "PICKUP"} onChange={() => setMethod("PICKUP")} /> Pickup</label>
      </fieldset>
      {method === "DELIVERY" && <label className="grid gap-1 text-sm">Delivery address<input name="address" required className="min-h-11 rounded-md border px-3" /></label>}
      <label className="grid gap-1 text-sm">Landmark<input name="landmark" className="min-h-11 rounded-md border px-3" /></label>
      <label className="grid gap-1 text-sm">Notes<textarea name="notes" className="min-h-24 rounded-md border px-3 py-2" /></label>
      {error && <p className="text-red-800">{error}</p>}
      <button disabled={pending} className="min-h-12 rounded-md bg-brand-ink font-semibold text-white" type="submit">
        {pending ? "Placing order…" : "Order via WhatsApp"}
      </button>
    </form>
  );
}
