import { orderStatusAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { Pager } from "@/components/pager";
import { orderStatusLabel } from "@/lib/labels";
import { listOrders } from "@/services/orders";

export const metadata = { title: "Orders" };

const statuses = Object.entries(orderStatusLabel);

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; status?: string; q?: string; page?: string }> }) {
  const params = await searchParams;
  const data = await listOrders(params);
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Online orders</h1>
      <Notice error={params.error} notice={params.notice} />
      <form className="flex gap-2">
        <input name="q" defaultValue={params.q} aria-label="Search orders" className="min-h-11 flex-1 rounded-md border px-3" />
        <select name="status" defaultValue={params.status ?? ""} aria-label="Status" className="min-h-11 rounded-md border px-3"><option value="">All</option>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <button className="min-h-11 rounded-md bg-brand-ink px-4 text-white">Filter</button>
      </form>
      {data.orders.length === 0 && <p>No online orders yet.</p>}
      {data.orders.map((order) => (
        <article key={order.id} className="rounded-md border bg-white p-4">
          <p className="font-semibold">{order.orderNumber} · {order.customer} · {order.phone}</p>
          <p>KSh {order.total} · {order.deliveryMethod} · {orderStatusLabel[order.status]}</p>
          {order.address && <p>{order.address}{order.landmark ? ` · ${order.landmark}` : ""}</p>}
          <ul className="mt-2 text-sm">{order.items.map((item) => <li key={item.name}>{item.name} × {item.quantity} · KSh {item.subtotal}</li>)}</ul>
          <form action={orderStatusAction} className="mt-3 flex gap-2">
            <input type="hidden" name="id" value={order.id} />
            <select name="status" defaultValue={order.status} aria-label={`Status for ${order.orderNumber}`} className="min-h-11 rounded-md border px-3">{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <button className="min-h-11 rounded-md bg-brand-ink px-3 text-white">Update status</button>
          </form>
        </article>
      ))}
      <Pager page={data.page} total={data.total} pageSize={data.pageSize} path="/admin/orders" query={{ q: params.q, status: params.status }} />
    </div>
  );
}
