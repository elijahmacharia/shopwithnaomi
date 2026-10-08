import { archiveExpenseAction, expenseAction } from "@/actions/ops";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Notice } from "@/components/notice";
import { Pager } from "@/components/pager";
import { expenseCategoryLabel } from "@/lib/labels";
import { listExpenses } from "@/services/expenses";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; page?: string }> }) {
  const params = await searchParams;
  const data = await listExpenses(params);
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Expenses</h1>
      <Notice error={params.error} notice={params.notice} />
      <form action={expenseAction} className="grid gap-2 rounded-md bg-white p-4 sm:grid-cols-2">
        <select name="category" aria-label="Category" className="min-h-11 rounded-md border px-3">{Object.entries(expenseCategoryLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <input name="amount" required placeholder="Amount" aria-label="Amount" className="min-h-11 rounded-md border px-3" />
        <input name="description" required placeholder="Description" aria-label="Description" className="min-h-11 rounded-md border px-3" />
        <input name="date" type="date" required aria-label="Date" className="min-h-11 rounded-md border px-3" />
        <input name="notes" placeholder="Notes" aria-label="Notes" className="min-h-11 rounded-md border px-3 sm:col-span-2" />
        <button className="min-h-11 rounded-md bg-brand-ink text-white">Add expense</button>
      </form>
      <ul className="divide-y rounded-md border bg-white">
        {data.expenses.map((expense) => (
          <li key={expense.id} className="grid gap-2 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>{expense.description} · KSh {expense.amount} · {expenseCategoryLabel[expense.category]} · {expense.date.toLocaleDateString("en-KE")} · {expense.createdBy}</span>
              <ConfirmSubmit action={archiveExpenseAction} id={expense.id} label="Archive" message="Archive this expense? It stays out of profit and loss." />
            </div>
            <form action={expenseAction} className="grid gap-2 sm:grid-cols-2">
              <input type="hidden" name="id" value={expense.id} />
              <select name="category" defaultValue={expense.category} aria-label="Category" className="min-h-11 rounded-md border px-3">{Object.entries(expenseCategoryLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <input name="amount" required defaultValue={expense.amount} aria-label="Amount" className="min-h-11 rounded-md border px-3" />
              <input name="description" required defaultValue={expense.description} aria-label="Description" className="min-h-11 rounded-md border px-3" />
              <input name="date" type="date" required defaultValue={expense.date.toISOString().slice(0, 10)} aria-label="Date" className="min-h-11 rounded-md border px-3" />
              <input name="notes" defaultValue={expense.notes ?? ""} aria-label="Notes" className="min-h-11 rounded-md border px-3 sm:col-span-2" />
              <button className="min-h-11 rounded-md border px-3">Save expense</button>
            </form>
          </li>
        ))}
      </ul>
      <Pager page={data.page} total={data.total} pageSize={data.pageSize} path="/admin/expenses" />
    </div>
  );
}
