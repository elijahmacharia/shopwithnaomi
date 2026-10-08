import Link from "next/link";
import { paymentMethodLabel } from "@/lib/labels";
import { shopReports } from "@/services/reports";

export const metadata = { title: "Reports" };

const presets = [
  ["today", "Today"],
  ["week", "This week"],
  ["month", "This month"],
] as const;

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; preset?: string }> }) {
  const params = await searchParams;
  const report = await shopReports(params);
  const query = new URLSearchParams();
  if (params.preset) {
    query.set("preset", params.preset);
  }
  if (params.from) {
    query.set("from", params.from);
  }
  if (params.to) {
    query.set("to", params.to);
  }
  const suffix = query.toString();
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Reports</h1>
      <div className="flex flex-wrap gap-2">
        {presets.map(([value, label]) => (
          <Link key={value} href={`/admin/reports?preset=${value}`} className="inline-flex min-h-11 items-center rounded-md border px-3">
            {label}
          </Link>
        ))}
      </div>
      <form className="flex flex-wrap gap-2">
        <input type="date" name="from" defaultValue={params.from} aria-label="From" className="min-h-11 rounded-md border px-3" />
        <input type="date" name="to" defaultValue={params.to} aria-label="To" className="min-h-11 rounded-md border px-3" />
        <button className="min-h-11 rounded-md bg-brand-ink px-4 text-white">Custom range</button>
      </form>
      <p className="text-sm text-brand-muted">{report.from.toLocaleDateString("en-KE")} – {report.to.toLocaleDateString("en-KE")}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Sales", `${report.transactions} transactions · KSh ${report.revenue}`],
          ["Profit and loss", `Revenue KSh ${report.revenue} · COGS KSh ${report.cogs} · gross KSh ${report.gross} · expenses KSh ${report.expenses} · net KSh ${report.net}`],
          ["Inventory", `${report.lowStock} products at or below minimum stock`],
          ["Credit", `${report.openCredit} open accounts · KSh ${report.creditBalance} outstanding`],
          ["Damaged products", report.damage.map((row) => `${row.count} ${row.status.toLowerCase()}`).join(" · ") || "None in this range"],
          ["Price changes", `${report.priceChanges} requests`],
          ["Stock discrepancies", `${report.discrepancies} counted differences`],
          ["Online orders", report.orders.map((row) => `${row.count} ${row.status.toLowerCase().replaceAll("_", " ")}`).join(" · ") || "None in this range"],
          ["Payments", report.payments.map((row) => `${paymentMethodLabel[row.method]} KSh ${row.amount}`).join(" · ") || "None in this range"],
        ].map(([title, body]) => (
          <section key={title} className="rounded-md border bg-white p-4">
            <h2 className="font-display text-xl">{title}</h2>
            <p className="mt-2">{body}</p>
          </section>
        ))}
      </div>
      <section className="rounded-md border bg-white p-4">
        <h2 className="font-display text-xl">Employee activity</h2>
        {report.employees.length === 0 ? <p className="mt-2">No sales in this range.</p> : (
          <ul className="mt-2 divide-y">{report.employees.map((employee) => <li key={employee.name} className="py-2">{employee.name} · {employee.sales} sales · KSh {employee.total}</li>)}</ul>
        )}
      </section>
      <div className="flex gap-3">
        <Link className="min-h-11 rounded-md border px-4 leading-[2.75rem]" href={`/admin/reports/export?format=pdf&${suffix}`}>Export PDF</Link>
        <Link className="min-h-11 rounded-md border px-4 leading-[2.75rem]" href={`/admin/reports/export?format=xlsx&${suffix}`}>Export Excel</Link>
      </div>
    </div>
  );
}