import Link from "next/link";
import { employeeDashboard } from "@/services/reports";

export const metadata = { title: "Today" };

export default async function EmployeeDashboardPage() {
  const data = await employeeDashboard();
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm text-brand-muted">Hello {data.name}</p>
        <h1 className="font-display text-4xl">Sell products</h1>
      </div>
      <Link href="/employee/sales/new" className="inline-flex min-h-16 items-center justify-center rounded-md bg-brand-ink text-xl font-semibold text-white">
        + New sale
      </Link>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Today's sales", `KSh ${data.todaySales}`],
          ["Transactions", String(data.transactions)],
          ["Credit sales", String(data.credit)],
          ["Low stock", String(data.lowStock)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-brand-soft bg-white p-4">
            <p className="text-sm text-brand-muted">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link className="min-h-11 rounded-md border border-brand-secondary px-4 leading-[2.75rem]" href="/employee/damage-reports">Report damage</Link>
        <Link className="min-h-11 rounded-md border border-brand-secondary px-4 leading-[2.75rem]" href="/employee/price-requests">Request price change</Link>
        <Link className="min-h-11 rounded-md border border-brand-secondary px-4 leading-[2.75rem]" href="/employee/sales">View my sales</Link>
      </div>
      <section>
        <h2 className="font-display text-2xl">Recent sales</h2>
        {data.recent.length === 0 ? <p className="mt-2">No sales yet today.</p> : (
          <ul className="mt-3 divide-y rounded-md border border-brand-soft bg-white">
            {data.recent.map((sale) => (
              <li key={sale.id} className="flex justify-between px-4 py-3">
                <Link href={`/employee/sales/${sale.id}`} className="font-semibold">{sale.saleNumber}</Link>
                <span>KSh {sale.total}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
