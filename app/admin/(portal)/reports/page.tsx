import Link from "next/link";
import { profitReport } from "@/services/reports";

export const metadata = { title: "Reports" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const params = await searchParams;
  const report = await profitReport(params);
  const query = `from=${params.from ?? ""}&to=${params.to ?? ""}`;
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Reports</h1>
      <form className="flex flex-wrap gap-2">
        <input type="date" name="from" aria-label="From" className="min-h-11 rounded-md border px-3" />
        <input type="date" name="to" aria-label="To" className="min-h-11 rounded-md border px-3" />
        <button className="min-h-11 rounded-md bg-brand-ink px-4 text-white">Apply</button>
      </form>
      <p>{report.transactions} sales · revenue KSh {report.revenue} · net KSh {report.net}</p>
      <div className="flex gap-3">
        <Link className="min-h-11 rounded-md border px-4 leading-[2.75rem]" href={`/admin/reports/export?format=pdf&${query}`}>Export PDF</Link>
        <Link className="min-h-11 rounded-md border px-4 leading-[2.75rem]" href={`/admin/reports/export?format=xlsx&${query}`}>Export Excel</Link>
      </div>
    </div>
  );
}
