import { reviewDamageAction, reviewPriceAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { listDamageReports, listPriceRequests } from "@/services/approvals";

export const metadata = { title: "Approvals" };

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const params = await searchParams;
  const [damage, prices] = await Promise.all([listDamageReports("all"), listPriceRequests("all")]);
  const pendingDamage = damage.filter((item) => item.status === "PENDING");
  const pendingPrices = prices.filter((item) => item.status === "PENDING");
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Approvals</h1>
        <p className="mt-2 text-sm text-brand-muted">Damage and price requests arrive here from the shopkeeper. Approving damage removes that quantity from stock once.</p>
      </div>
      <Notice error={params.error} notice={params.notice} />
      <section className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
        <h2 className="font-display text-2xl">Damage from the shopkeeper</h2>
        {pendingDamage.length === 0 ? <p className="mt-3">No damage reports waiting.</p> : (
          <ul className="mt-3 grid gap-3">
            {pendingDamage.map((item) => (
              <li key={item.id} className="rounded-xl bg-brand-background p-4">
                <p className="font-semibold">{item.product} · {item.quantity} · {item.reason} · {item.by}</p>
                <p className="mt-1 text-sm text-brand-muted">In stock now: {item.stock}</p>
                <p className="mt-1">{item.description}</p>
                {item.photoUrl ? <img src={item.photoUrl} alt="" className="mt-3 h-32 w-32 rounded-xl object-cover" /> : null}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <form action={reviewDamageAction} className="grid gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="decision" value="APPROVED" />
                    <input name="note" placeholder="Note, optional" aria-label="Approval note" className="min-h-11 rounded-xl border border-brand-soft px-3" />
                    <button className="min-h-11 rounded-xl bg-brand-primary px-3 font-semibold text-brand-ink">Approve and adjust stock</button>
                  </form>
                  <form action={reviewDamageAction} className="grid gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="decision" value="REJECTED" />
                    <input name="note" required placeholder="Reason for rejecting" aria-label="Rejection reason" className="min-h-11 rounded-xl border border-brand-soft px-3" />
                    <button className="min-h-11 rounded-xl border border-brand-secondary px-3">Reject</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        {damage.some((item) => item.status !== "PENDING") ? (
          <ul className="mt-4 divide-y divide-brand-soft text-sm">
            {damage.filter((item) => item.status !== "PENDING").map((item) => (
              <li key={item.id} className="py-2">{item.product} · {item.by} · {item.status === "APPROVED" ? "Approved" : "Rejected"}</li>
            ))}
          </ul>
        ) : null}
      </section>
      <section className="rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
        <h2 className="font-display text-2xl">Price requests</h2>
        {pendingPrices.length === 0 ? <p className="mt-3">No price requests waiting.</p> : (
          <ul className="mt-3 grid gap-3">
            {pendingPrices.map((item) => (
              <li key={item.id} className="rounded-xl bg-brand-background p-4">
                <p className="font-semibold">{item.product}: KSh {item.currentPrice} → KSh {item.requestedPrice}</p>
                <p className="mt-1">{item.reason} · {item.by}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <form action={reviewPriceAction} className="grid gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="decision" value="APPROVED" />
                    <input name="note" placeholder="Note, optional" aria-label="Approval note" className="min-h-11 rounded-xl border border-brand-soft px-3" />
                    <button className="min-h-11 rounded-xl bg-brand-primary px-3 font-semibold text-brand-ink">Approve price</button>
                  </form>
                  <form action={reviewPriceAction} className="grid gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="decision" value="REJECTED" />
                    <input name="note" required placeholder="Reason for rejecting" aria-label="Rejection reason" className="min-h-11 rounded-xl border border-brand-soft px-3" />
                    <button className="min-h-11 rounded-xl border border-brand-secondary px-3">Reject</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
