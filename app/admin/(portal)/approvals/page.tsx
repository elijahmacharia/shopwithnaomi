import { reviewDamageAction, reviewPriceAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { listDamageReports, listPriceRequests } from "@/services/approvals";

export const metadata = { title: "Approvals" };

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const params = await searchParams;
  const [damage, prices] = await Promise.all([listDamageReports("all"), listPriceRequests("all")]);
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-3xl">Approvals</h1>
      <Notice error={params.error} notice={params.notice} />
      <section>
        <h2 className="font-display text-2xl">Damage reports</h2>
        <ul className="mt-3 grid gap-3">
          {damage.filter((item) => item.status === "PENDING").map((item) => (
            <li key={item.id} className="rounded-md bg-white p-4">
              <p>{item.product} · {item.quantity} · {item.by}</p>
              <p>{item.description}</p>
              <div className="mt-2 flex gap-2">
                <form action={reviewDamageAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="decision" value="APPROVED" /><button className="min-h-11 rounded-md bg-brand-ink px-3 text-white">Approve</button></form>
                <form action={reviewDamageAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="decision" value="REJECTED" /><button className="min-h-11 rounded-md border px-3">Reject</button></form>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl">Price requests</h2>
        <ul className="mt-3 grid gap-3">
          {prices.filter((item) => item.status === "PENDING").map((item) => (
            <li key={item.id} className="rounded-md bg-white p-4">
              <p>{item.product}: KSh {item.currentPrice} → KSh {item.requestedPrice}</p>
              <p>{item.reason} · {item.by}</p>
              <div className="mt-2 flex gap-2">
                <form action={reviewPriceAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="decision" value="APPROVED" /><button className="min-h-11 rounded-md bg-brand-ink px-3 text-white">Approve</button></form>
                <form action={reviewPriceAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="decision" value="REJECTED" /><button className="min-h-11 rounded-md border px-3">Reject</button></form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
