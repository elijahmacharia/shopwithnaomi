import { creditPaymentAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { creditStatusLabel } from "@/lib/labels";
import { listCredit } from "@/services/credit";

export const metadata = { title: "Credit" };

export default async function AdminCreditPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const params = await searchParams;
  const data = await listCredit({});
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Credit</h1>
      <Notice error={params.error} notice={params.notice} />
      {data.records.map((row) => (
        <article key={row.id} className="rounded-md border bg-white p-4">
          <p className="font-semibold">{row.customer} · {row.phone}</p>
          <p>{row.saleNumber} · Due {row.dueDate.toLocaleDateString("en-KE")} · {creditStatusLabel[row.status]}</p>
          <p>Balance KSh {row.balance} of KSh {row.amount}</p>
          {row.status !== "PAID" && (
            <form action={creditPaymentAction} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="creditId" value={row.id} />
              <input name="amount" required placeholder="Amount paid" aria-label="Amount paid" className="min-h-11 rounded-md border px-3" />
              <select name="method" aria-label="Method" className="min-h-11 rounded-md border px-3"><option value="CASH">Cash</option><option value="MPESA">M-Pesa</option><option value="OTHER">Other</option></select>
              <input name="reference" placeholder="Reference" aria-label="Reference" className="min-h-11 rounded-md border px-3" />
              <button className="min-h-11 rounded-md bg-brand-ink px-3 text-white">Record payment</button>
            </form>
          )}
        </article>
      ))}
    </div>
  );
}
