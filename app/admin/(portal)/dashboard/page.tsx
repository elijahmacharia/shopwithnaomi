import Link from "next/link";
import { SalesChart } from "@/components/sales-chart";
import { dashboardStats, salesSeries } from "@/services/reports";

export const metadata = { title: "Owner dashboard" };

export default async function AdminDashboardPage() {
  const [stats, series] = await Promise.all([dashboardStats(), salesSeries()]);
  const cards = [
    ["Today's sales", `KSh ${stats.todaySales}`],
    ["This month", `KSh ${stats.monthSales}`],
    ["Gross profit", `KSh ${stats.gross}`],
    ["Net profit", `KSh ${stats.net}`],
    ["Outstanding credit", `KSh ${stats.credit}`],
    ["Low stock", String(stats.lowStock)],
  ];
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-3xl">How is the shop doing?</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-md border border-brand-soft bg-white p-4">
            <p className="text-sm text-brand-muted">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-md border border-brand-soft bg-white p-4">
        <h2 className="font-display text-2xl">Sales overview</h2>
        <SalesChart data={series} />
      </section>
      <section>
        <h2 className="font-display text-2xl">Needs your attention</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <li><Link className="block rounded-md bg-white p-4" href="/admin/approvals">{stats.pendingPrices} price requests</Link></li>
          <li><Link className="block rounded-md bg-white p-4" href="/admin/approvals">{stats.pendingDamage} damage reports</Link></li>
          <li><Link className="block rounded-md bg-white p-4" href="/admin/inventory">{stats.lowStock} low-stock products</Link></li>
          <li><Link className="block rounded-md bg-white p-4" href="/admin/orders">{stats.newOrders} new online orders</Link></li>
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl">Recent activity</h2>
        <ul className="mt-3 divide-y rounded-md border bg-white">
          {stats.activity.map((item) => <li key={item.id} className="px-4 py-3"><span className="font-semibold">{item.by}</span> · {item.description}</li>)}
        </ul>
      </section>
    </div>
  );
}
