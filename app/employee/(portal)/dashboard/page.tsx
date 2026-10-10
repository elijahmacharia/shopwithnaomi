import Link from "next/link";
import { decimalToCents, formatKsh } from "@/lib/domain/money";
import { employeeDashboard } from "@/services/reports";

export const metadata = { title: "Today" };

const statusCopy: Record<string, string> = {
  PENDING: "Waiting",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default async function EmployeeDashboardPage() {
  const data = await employeeDashboard();
  const cards: Array<[string, string, string]> = [
    ["Today's sales", formatKsh(decimalToCents(data.todaySales)), "/employee/sales"],
    ["Transactions", String(data.transactions), "/employee/sales"],
    ["Open credit", String(data.credit), "/employee/credit"],
    ["Low stock", String(data.lowStock), "/employee/inventory"],
  ];
  const actions = [
    ["/employee/damage-reports", "Report damaged item"],
    ["/employee/price-requests", "Request price change"],
    ["/employee/sales", "View my sales"],
    ["/employee/credit", "View credit records"],
  ];
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-brand-muted">Hello, {data.name}</p>
          <h1 className="font-display text-3xl">Today on the till</h1>
        </div>
        <Link href="/employee/sales/new" className="inline-flex min-h-12 items-center rounded-xl bg-brand-primary px-5 font-semibold text-brand-ink">
          + New sale
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
            <p className="text-sm text-brand-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {actions.map(([href, label]) => (
          <Link key={href} href={href} className="flex min-h-16 items-center rounded-2xl border border-brand-soft bg-white px-4 text-sm font-semibold">
            {label}
          </Link>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Recent sales</h2>
            <Link href="/employee/sales" className="text-sm font-semibold">View all</Link>
          </div>
          {data.recent.length === 0 ? <p className="mt-3 text-sm text-brand-muted">No sales yet.</p> : (
            <ul className="mt-3 divide-y divide-brand-soft text-sm">
              {data.recent.map((sale) => (
                <li key={sale.id}>
                  <Link href={`/employee/sales/${sale.id}`} className="flex min-h-11 items-center justify-between">
                    <span>
                      <span className="font-semibold">{sale.saleNumber}</span>
                      <span className="ml-2 text-brand-muted">{sale.customer}</span>
                    </span>
                    <span>{formatKsh(decimalToCents(sale.total))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
          <h2 className="font-display text-2xl">Stock alerts</h2>
          {data.lowItems.length === 0 ? <p className="mt-3 text-sm text-brand-muted">Nothing is at the minimum yet.</p> : (
            <ul className="mt-3 divide-y divide-brand-soft text-sm">
              {data.lowItems.map((item) => (
                <li key={item.id} className="flex min-h-11 items-center justify-between">
                  <span>{item.name}</span>
                  <span>{item.stockQuantity} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <StatusList title="Your damage reports" href="/employee/damage-reports" rows={data.damage} />
        <StatusList title="Your price requests" href="/employee/price-requests" rows={data.prices} />
      </div>
    </div>
  );
}

function StatusList({ title, href, rows }: { title: string; href: string; rows: Array<{ id: string; product: string; status: string; reviewNote: string | null }> }) {
  return (
    <section className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">{title}</h2>
        <Link href={href} className="text-sm font-semibold">Open</Link>
      </div>
      {rows.length === 0 ? <p className="mt-3 text-sm text-brand-muted">Nothing sent yet.</p> : (
        <ul className="mt-3 divide-y divide-brand-soft text-sm">
          {rows.map((row) => (
            <li key={row.id} className="py-3">
              <p className="flex justify-between gap-3">
                <span className="font-semibold">{row.product}</span>
                <span>{statusCopy[row.status] ?? row.status}</span>
              </p>
              {row.reviewNote ? <p className="mt-1 text-brand-muted">Owner: {row.reviewNote}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
