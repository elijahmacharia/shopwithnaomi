import { profitReport } from "@/services/reports";

export const metadata = { title: "Profit and loss" };

export default async function ProfitPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const params = await searchParams;
  const report = await profitReport(params);
  const rows = [
    ["Revenue", report.revenue],
    ["Cost of goods", report.cogs],
    ["Gross profit", report.gross],
    ["Operating expenses", report.expenses],
    ["Net profit", report.net],
  ];
  return (
    <div>
      <h1 className="font-display text-3xl">Profit and loss</h1>
      <form className="mt-4 flex flex-wrap gap-2">
        <input type="date" name="from" aria-label="From" className="min-h-11 rounded-md border px-3" />
        <input type="date" name="to" aria-label="To" className="min-h-11 rounded-md border px-3" />
        <button className="min-h-11 rounded-md bg-brand-ink px-4 text-white">Update</button>
      </form>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => <div key={label} className="rounded-md bg-white p-4"><dt className="text-sm text-brand-muted">{label}</dt><dd className="text-2xl font-semibold">KSh {value}</dd></div>)}
      </dl>
    </div>
  );
}
