import Link from "next/link";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/labels";
import { listSales } from "@/services/sales";

export const metadata = { title: "Sales" };

export default async function AdminSalesPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; method?: string; status?: string }> }) {
  const params = await searchParams;
  const data = await listSales(params);
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Sales</h1>
      <form className="grid gap-2 sm:grid-cols-4">
        <input name="q" defaultValue={params.q} aria-label="Search sales" placeholder="Sale, customer, employee" className="min-h-11 rounded-md border px-3" />
        <select name="method" defaultValue={params.method ?? ""} aria-label="Payment method" className="min-h-11 rounded-md border px-3"><option value="">Any method</option><option value="CASH">Cash</option><option value="MPESA">M-Pesa</option><option value="OTHER">Other</option><option value="CREDIT">Credit</option></select>
        <select name="status" defaultValue={params.status ?? ""} aria-label="Payment status" className="min-h-11 rounded-md border px-3"><option value="">Any status</option><option value="PAID">Paid</option><option value="PARTIALLY_PAID">Partially paid</option><option value="UNPAID">Unpaid</option></select>
        <button className="min-h-11 rounded-md bg-brand-ink text-white">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="border-b"><th className="p-3">Sale</th><th>Date</th><th>Employee</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>
            {data.sales.map((sale) => (
              <tr key={sale.id} className="border-b">
                <td className="p-3"><Link href={`/employee/sales/${sale.id}`}>{sale.saleNumber}</Link></td>
                <td>{sale.createdAt.toLocaleDateString("en-KE")}</td>
                <td>{sale.employee}</td>
                <td>{sale.customer}</td>
                <td>KSh {sale.total}</td>
                <td>KSh {sale.amountPaid}</td>
                <td>KSh {sale.balance}</td>
                <td>{paymentMethodLabel[sale.method]} · {paymentStatusLabel[sale.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
