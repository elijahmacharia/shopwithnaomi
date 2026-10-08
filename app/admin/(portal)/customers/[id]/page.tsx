import Link from "next/link";
import { notFound } from "next/navigation";
import { customerAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { getCustomer } from "@/services/customers";

export const metadata = { title: "Customer" };

export default async function CustomerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string; error?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const customer = await getCustomer(id);
  if (!customer) {
    notFound();
  }
  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/customers" className="text-sm font-semibold">All customers</Link>
        <h1 className="font-display text-3xl">{customer.name}</h1>
        <p>{customer.phone}{customer.email ? ` · ${customer.email}` : ""}</p>
      </div>
      <Notice error={query.error} notice={query.notice} />
      <form action={customerAction} className="grid max-w-xl gap-2 rounded-md bg-white p-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={customer.id} />
        <label className="grid gap-1 text-sm">Name<input name="name" required defaultValue={customer.name} className="min-h-11 rounded-md border px-3" /></label>
        <label className="grid gap-1 text-sm">Phone<input name="phone" required defaultValue={customer.phone} className="min-h-11 rounded-md border px-3" /></label>
        <label className="grid gap-1 text-sm">Email<input name="email" type="email" defaultValue={customer.email ?? ""} className="min-h-11 rounded-md border px-3" /></label>
        <label className="grid gap-1 text-sm">Landmark<input name="landmark" defaultValue={customer.landmark ?? ""} className="min-h-11 rounded-md border px-3" /></label>
        <label className="grid gap-1 text-sm sm:col-span-2">Address<input name="address" defaultValue={customer.address ?? ""} className="min-h-11 rounded-md border px-3" /></label>
        <button className="min-h-11 rounded-md bg-brand-ink text-white">Save customer</button>
      </form>
      <section>
        <h2 className="font-display text-2xl">Sales</h2>
        {customer.sales.length === 0 ? <p className="mt-2">No sales yet.</p> : <ul className="mt-2 divide-y rounded-md border bg-white">{customer.sales.map((sale) => <li key={sale.id} className="px-4 py-2"><Link href={`/employee/sales/${sale.id}`}>{sale.saleNumber}</Link> · KSh {sale.total}</li>)}</ul>}
      </section>
      <section>
        <h2 className="font-display text-2xl">Credit</h2>
        {customer.credits.length === 0 ? <p className="mt-2">No credit.</p> : <ul className="mt-2 divide-y rounded-md border bg-white">{customer.credits.map((credit) => <li key={credit.id} className="px-4 py-2">KSh {credit.amount} · balance KSh {credit.balance} · {credit.status}</li>)}</ul>}
      </section>
      <section>
        <h2 className="font-display text-2xl">Payments</h2>
        {customer.payments.length === 0 ? <p className="mt-2">No payments yet.</p> : <ul className="mt-2 divide-y rounded-md border bg-white">{customer.payments.map((payment) => <li key={payment.id} className="px-4 py-2">{payment.method} · KSh {payment.amount}</li>)}</ul>}
      </section>
      <section>
        <h2 className="font-display text-2xl">Online orders</h2>
        {customer.orders.length === 0 ? <p className="mt-2">No online orders yet.</p> : <ul className="mt-2 divide-y rounded-md border bg-white">{customer.orders.map((order) => <li key={order.id} className="px-4 py-2">{order.orderNumber} · KSh {order.total} · {order.status}</li>)}</ul>}
      </section>
    </div>
  );
}
