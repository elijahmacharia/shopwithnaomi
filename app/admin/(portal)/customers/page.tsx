import Link from "next/link";
import { customerAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { Pager } from "@/components/pager";
import { listCustomers } from "@/services/customers";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; notice?: string; error?: string }> }) {
  const params = await searchParams;
  const data = await listCustomers(params);
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Customers</h1>
      <Notice error={params.error} notice={params.notice} />
      <form className="flex gap-2"><input name="q" defaultValue={params.q} aria-label="Search customers" className="min-h-11 flex-1 rounded-md border px-3" /><button className="min-h-11 rounded-md bg-brand-ink px-4 text-white">Search</button></form>
      <ul className="divide-y rounded-md border bg-white">
        {data.customers.length === 0 && <li className="px-4 py-6">No customers yet.</li>}
        {data.customers.map((customer) => (
          <li key={customer.id} className="px-4 py-3">
            <Link href={`/admin/customers/${customer.id}`} className="font-semibold">{customer.name}</Link>
            <span> · {customer.phone} · {customer.purchases} purchases · credit KSh {customer.credit}</span>
          </li>
        ))}
      </ul>
      <Pager page={data.page} total={data.total} pageSize={data.pageSize} path="/admin/customers" query={{ q: params.q }} />
      <form action={customerAction} className="grid gap-2 rounded-md bg-white p-4 sm:grid-cols-2">
        <input name="name" required placeholder="Name" aria-label="Name" className="min-h-11 rounded-md border px-3" />
        <input name="phone" required placeholder="Phone" aria-label="Phone" className="min-h-11 rounded-md border px-3" />
        <input name="address" placeholder="Address" aria-label="Address" className="min-h-11 rounded-md border px-3" />
        <input name="landmark" placeholder="Landmark" aria-label="Landmark" className="min-h-11 rounded-md border px-3" />
        <button className="min-h-11 rounded-md bg-brand-ink text-white">Save customer</button>
      </form>
    </div>
  );
}
