import { listInventory } from "@/services/inventory";

export const metadata = { title: "Stock" };

export default async function EmployeeInventoryPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const data = await listInventory(await searchParams);
  return (
    <div>
      <h1 className="font-display text-3xl">Stock</h1>
      <ul className="mt-4 divide-y rounded-md border bg-white">
        {data.products.map((product) => (
          <li key={product.id} className="flex items-center justify-between px-4 py-3">
            <span>{product.name}<span className="block text-sm text-brand-muted">{product.sku}</span></span>
            <span>{product.out ? "Out of stock" : product.low ? `Low · ${product.stockQuantity}` : product.stockQuantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
