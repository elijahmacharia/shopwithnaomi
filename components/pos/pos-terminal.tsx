"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { completeSaleAction } from "@/actions/ops";
import { formatKsh, parseMoneyToCents } from "@/lib/domain/money";

type Product = {
  id: string;
  name: string;
  sku: string;
  sellingPrice: string;
  stockQuantity: number;
  category: string;
};

export function PosTerminal({ products }: { products: Product[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [step, setStep] = useState<"cart" | "pay">("cart");
  const [method, setMethod] = useState<"CASH" | "MPESA" | "OTHER" | "CREDIT">("CASH");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const visible = products.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;
    const needle = query.trim().toLowerCase();
    return matchesCategory && (!needle || product.name.toLowerCase().includes(needle) || product.sku.toLowerCase().includes(needle));
  });
  const lines = cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    return product ? [{ ...line, product }] : [];
  });
  const total = lines.reduce((sum, line) => sum + parseMoneyToCents(line.product.sellingPrice) * line.quantity, 0);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  function add(product: Product) {
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id);
      const next = (existing?.quantity ?? 0) + 1;
      if (next > product.stockQuantity) {
        setError(`Only ${product.stockQuantity} units of ${product.name} are available.`);
        return current;
      }
      setError("");
      if (!existing) {
        return [...current, { productId: product.id, quantity: 1 }];
      }
      return current.map((line) => (line.productId === product.id ? { ...line, quantity: next } : line));
    });
  }

  const summary = useMemo(() => formatKsh(total), [total]);

  async function pay(formData: FormData) {
    setPending(true);
    setError("");
    const result = await completeSaleAction({
      items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      method,
      amountPaid: String(formData.get("amountPaid") ?? "0"),
      reference: String(formData.get("reference") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      customerName: String(formData.get("customerName") ?? ""),
      customerPhone: String(formData.get("customerPhone") ?? ""),
      dueDate: String(formData.get("dueDate") ?? ""),
      clientRequestId: crypto.randomUUID(),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/employee/sales/${result.saleId}`);
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search products" placeholder="Search products" className="min-h-12 flex-1 rounded-md border px-3" />
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category" className="min-h-12 rounded-md border px-3">
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {visible.map((product) => (
            <button key={product.id} type="button" disabled={product.stockQuantity <= 0} onClick={() => add(product)} className="min-h-24 rounded-md border border-brand-soft bg-white p-3 text-left disabled:opacity-50">
              <span className="block font-semibold">{product.name}</span>
              <span className="block text-sm">{formatKsh(parseMoneyToCents(product.sellingPrice))}</span>
              <span className="block text-xs">{product.stockQuantity} in stock</span>
            </button>
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-md border border-brand-soft bg-white p-4 lg:sticky lg:top-4">
        <h2 className="font-display text-2xl">Cart ({count})</h2>
        <ul className="mt-3 divide-y">
          {lines.map((line) => (
            <li key={line.productId} className="flex items-center justify-between gap-2 py-2">
              <span>{line.product.name}</span>
              <span className="flex items-center gap-1">
                <button type="button" aria-label={`Decrease ${line.product.name}`} className="min-h-11 min-w-11" onClick={() => setCart((current) => current.flatMap((item) => (item.productId === line.productId ? (item.quantity <= 1 ? [] : [{ ...item, quantity: item.quantity - 1 }]) : [item])))}>−</button>
                {line.quantity}
                <button type="button" aria-label={`Increase ${line.product.name}`} className="min-h-11 min-w-11" onClick={() => add(line.product)}>+</button>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xl font-semibold">{summary}</p>
        {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
        {step === "cart" ? (
          <button type="button" disabled={lines.length === 0} className="mt-4 min-h-12 w-full rounded-md bg-brand-ink font-semibold text-white" onClick={() => setStep("pay")}>
            Continue to payment
          </button>
        ) : (
          <form action={pay} className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              {(["CASH", "MPESA", "OTHER", "CREDIT"] as const).map((item) => (
                <button key={item} type="button" className={`min-h-11 rounded-md border ${method === item ? "bg-brand-ink text-white" : ""}`} onClick={() => setMethod(item)}>
                  {item === "CREDIT" ? "Credit / Pay Later" : item === "MPESA" ? "M-Pesa" : item === "CASH" ? "Cash" : "Other"}
                </button>
              ))}
            </div>
            <label className="grid gap-1 text-sm">Amount paid<input name="amountPaid" defaultValue={(total / 100).toFixed(2)} className="min-h-11 rounded-md border px-3" /></label>
            {method === "MPESA" && <label className="grid gap-1 text-sm">M-Pesa reference code<input name="reference" className="min-h-11 rounded-md border px-3" /></label>}
            <label className="grid gap-1 text-sm">Customer name<input name="customerName" className="min-h-11 rounded-md border px-3" /></label>
            <label className="grid gap-1 text-sm">Customer phone<input name="customerPhone" className="min-h-11 rounded-md border px-3" /></label>
            <label className="grid gap-1 text-sm">Due date<input name="dueDate" type="date" className="min-h-11 rounded-md border px-3" /></label>
            <label className="grid gap-1 text-sm">Note<input name="notes" className="min-h-11 rounded-md border px-3" /></label>
            <button disabled={pending} className="min-h-12 rounded-md bg-brand-ink font-semibold text-white" type="submit">
              {pending ? "Saving…" : "Confirm payment"}
            </button>
          </form>
        )}
      </aside>
      <a href="#main" className="fixed bottom-4 right-4 inline-flex min-h-12 items-center rounded-full bg-brand-ink px-4 font-semibold text-white lg:hidden">
        Cart ({count})
      </a>
    </div>
  );
}
