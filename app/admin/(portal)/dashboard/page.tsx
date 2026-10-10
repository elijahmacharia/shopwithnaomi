import Link from "next/link";
import { SalesChart } from "@/components/sales-chart";
import { decimalToCents, formatKsh } from "@/lib/domain/money";
import type { SalesView } from "@/lib/domain/sales-series";
import { paymentStatusLabel } from "@/lib/labels";
import { dashboardStats, salesSeries } from "@/services/reports";

export const metadata = { title: "Owner dashboard" };

const views: Array<[SalesView, string]> = [
  ["daily", "Daily"],
  ["weekly", "Weekly"],
  ["monthly", "Monthly"],
];

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const params = await searchParams;
  const view: SalesView = params.view === "weekly" || params.view === "monthly" ? params.view : "daily";
  const [stats, series] = await Promise.all([dashboardStats(), salesSeries(view)]);
  const today = new Intl.DateTimeFormat("en-KE", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Nairobi" }).format(new Date());
  const cards: Array<[string, string, string]> = [
    ["Today's sales", formatKsh(decimalToCents(stats.todaySales)), "/admin/sales"],
    ["This month", formatKsh(decimalToCents(stats.monthSales)), "/admin/sales"],
    ["Gross profit", formatKsh(decimalToCents(stats.gross)), "/admin/profit-loss"],
    ["Net profit", formatKsh(decimalToCents(stats.net)), "/admin/profit-loss"],
    ["Outstanding credit", formatKsh(decimalToCents(stats.credit)), "/admin/credit"],
    ["Low stock", String(stats.lowStock), "/admin/inventory"],
  ];
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm text-brand-muted">{today}</p>
        <h1 className="font-display text-3xl">Hello, {stats.actor.name}</h1>
      </div>
      {stats.actor.email.endsWith("@example.com") ? (
        <p className="rounded-xl border border-brand-secondary bg-white px-4 py-3 text-sm">This sign-in still uses a sample email. Open Profile and set a new password before customers use the live shop.</p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
            <p className="text-sm text-brand-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Sales overview</h2>
          <div className="flex gap-1 rounded-xl bg-brand-background p-1">
            {views.map(([value, label]) => (
              <Link key={value} href={value === "daily" ? "/admin/dashboard" : `/admin/dashboard?view=${value}`} className={`min-h-10 rounded-lg px-3 text-sm leading-10 ${view === value ? "bg-brand-primary font-semibold" : ""}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <SalesChart data={series} />
      </section>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
          <h2 className="font-display text-2xl">Needs your attention</h2>
          <ul className="mt-3 divide-y divide-brand-soft text-sm">
            <li><Link className="flex min-h-11 items-center justify-between" href="/admin/approvals"><span>Damage reports</span><span className="font-semibold">{stats.pendingDamage}</span></Link></li>
            <li><Link className="flex min-h-11 items-center justify-between" href="/admin/approvals"><span>Price requests</span><span className="font-semibold">{stats.pendingPrices}</span></Link></li>
            <li><Link className="flex min-h-11 items-center justify-between" href="/admin/inventory"><span>Low stock</span><span className="font-semibold">{stats.lowStock}</span></Link></li>
            <li><Link className="flex min-h-11 items-center justify-between" href="/admin/credit"><span>Overdue credit</span><span className="font-semibold">{stats.overdue}</span></Link></li>
            <li><Link className="flex min-h-11 items-center justify-between" href="/admin/orders"><span>New online orders</span><span className="font-semibold">{stats.newOrders}</span></Link></li>
          </ul>
        </section>
        <section className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
          <h2 className="font-display text-2xl">Low stock</h2>
          {stats.lowItems.length === 0 ? <p className="mt-3 text-sm text-brand-muted">No products are at or below their minimum.</p> : (
            <ul className="mt-3 divide-y divide-brand-soft text-sm">
              {stats.lowItems.map((item) => (
                <li key={item.id}><Link className="flex min-h-11 items-center justify-between" href={`/admin/products/${item.id}`}><span>{item.name}</span><span>{item.stockQuantity} left</span></Link></li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section className="overflow-x-auto rounded-2xl border border-brand-soft bg-white shadow-card">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-display text-2xl">Recent sales</h2>
          <Link href="/admin/sales" className="text-sm font-semibold">View all</Link>
        </div>
        {stats.recentSales.length === 0 ? <p className="px-4 pb-4 text-sm text-brand-muted">No sales recorded yet.</p> : (
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr className="border-y border-brand-soft text-brand-muted"><th className="px-4 py-2">Sale</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
          <tbody>
            {stats.recentSales.map((sale) => (
              <tr key={sale.id} className="border-b border-brand-soft">
                <td className="px-4 py-3 font-semibold"><Link href="/admin/sales">{sale.saleNumber}</Link></td>
                <td>{sale.customer}</td>
                <td>{paymentStatusLabel[sale.status]}</td>
                <td>{formatKsh(decimalToCents(sale.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </section>
    </div>
  );
}
