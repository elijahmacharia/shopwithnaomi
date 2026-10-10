import Link from "next/link";
import { employeeDashboard } from "@/services/reports";

export const metadata = { title: "Today" };

export default async function EmployeeDashboardPage() {
  const data = await employeeDashboard();
  const cards = [
    ["Today's sales", `KSh ${data.todaySales}`],
    ["Transactions", String(data.transactions)],
    ["Credit sales", String(data.credit)],
    ["Low stock", String(data.lowStock)],
  ];
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-brand-muted">Hello {data.name}</p>
          <h1 className="font-display text-4xl">Sell products</h1>
        </div>
        <Link href="/employee/sales/new" className="inline-flex min-h-12 items-center rounded-xl bg-brand-primary px-5 font-semibold text-brand-ink">
          + New sale
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
            <p className="text-sm text-brand-muted">{label}</p>
            <p className="mt-2 font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/employee/damage-reports" className="rounded-2xl border border-brand-soft bg-white p-5">
          <p className="font-display text-2xl">Report damaged goods</p>
          <p className="mt-2 text-sm text-brand-muted">The owner sees the report in Shopkeeper reports and can approve or reject it.</p>
        </Link>
        <Link href="/employee/price-requests" className="rounded-2xl border border-brand-soft bg-white p-5">
          <p className="font-display text-2xl">Ask for a price change</p>
          <p className="mt-2 text-sm text-brand-muted">The owner approves the new price before it is used.</p>
        </Link>
      </div>
      <section className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
        <h2 className="font-display text-2xl">Recent sales</h2>
        {data.recent.length === 0 ? <p className="mt-2">No sales yet today.</p> : (
          <ul className="mt-3 divide-y">
            {data.recent.map((sale) => (
              <li key={sale.id} className="flex justify-between py-3">
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
