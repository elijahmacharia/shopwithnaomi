import { creditStatusLabel } from "@/lib/labels";
import { listCredit } from "@/services/credit";

export const metadata = { title: "Credit" };

export default async function EmployeeCreditPage() {
  const data = await listCredit({});
  return (
    <div>
      <h1 className="font-display text-3xl">Credit sales</h1>
      {data.records.length === 0 ? <p className="mt-4">No credit sales yet.</p> : (
        <ul className="mt-4 divide-y rounded-md border bg-white">
          {data.records.map((row) => (
            <li key={row.id} className="grid gap-1 px-4 py-3 sm:grid-cols-4">
              <span className="font-semibold">{row.customer}</span>
              <span>{row.saleNumber}</span>
              <span>Balance KSh {row.balance}</span>
              <span>{creditStatusLabel[row.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
