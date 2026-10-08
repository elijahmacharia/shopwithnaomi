import { orderStatusLabel } from "@/lib/labels";
import { listOrders } from "@/services/orders";

export const metadata = { title: "Deliveries" };

export default async function DeliveriesPage() {
  const data = await listOrders({ status: undefined });
  const deliveries = data.orders.filter((order) => order.deliveryMethod === "DELIVERY");
  return (
    <div>
      <h1 className="font-display text-3xl">Deliveries</h1>
      <p className="mt-2 text-sm text-brand-muted">Manual delivery tracking. Driver assignment and maps can be added later.</p>
      <ul className="mt-4 divide-y rounded-md border bg-white">
        {deliveries.length === 0 && <li className="px-4 py-6">No deliveries yet.</li>}
        {deliveries.map((order) => (
          <li key={order.id} className="px-4 py-3">
            <p className="font-semibold">{order.orderNumber} · {order.customer} · {order.phone}</p>
            <p>{order.address || "No address"}{order.landmark ? ` · ${order.landmark}` : ""} · {orderStatusLabel[order.status]}</p>
            {order.notes && <p className="text-sm">{order.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
