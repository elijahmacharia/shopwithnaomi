import Link from "next/link";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/labels";
import { listSales } from "@/services/sales";

export const metadata = { title: "My sales" };

export default async function MySalesPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams;
  const data = await listSales(params);
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">My sales</h1>
      <form className="flex gap-2"><input name="q" defaultValue={params.q} aria-label="Search sales" className="min-h-11 flex-1 rounded-md border px-3" placeholder="Sale number or customer" /><button className="min-h-11 rounded-md bg-brand-ink px-4 text-white">Search</button></form>
      {data.sales.length === 0 ? <p>No sales yet today. <Link href="/employee/sales/new" className="font-semibold">Create new sale</Link></p> : (
        <div className="overflow-x-auto rounded-md border border-brand-soft bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead><tr className="border-b"><th className="p-3">Sale</th><th>Customer</th><th>Total</th><th>Paid</th><th>Status</th></tr></thead>
            <tbody>
              {data.sales.map((sale) => (
                <tr key={sale.id} className="border-b">
                  <td className="p-3"><Link href={`/employee/sales/${sale.id}`} className="font-semibold">{sale.saleNumber}</Link></td>
                  <td>{sale.customer}</td>
                  <td>KSh {sale.total}</td>
                  <td>KSh {sale.amountPaid}</td>
                  <td>{paymentStatusLabel[sale.status]} · {paymentMethodLabel[sale.method]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
