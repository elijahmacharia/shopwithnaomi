import Link from "next/link";
import { damageAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { damageReasonLabel } from "@/lib/labels";
import { listDamageReports } from "@/services/approvals";
import { listPosProducts } from "@/services/sales";

export const metadata = { title: "Damage reports" };

const statusCopy: Record<string, string> = {
  PENDING: "Waiting for the owner",
  APPROVED: "Owner approved",
  REJECTED: "Owner rejected",
};

export default async function DamagePage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const params = await searchParams;
  const [reports, products] = await Promise.all([listDamageReports("own"), listPosProducts()]);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Report damage</h1>
        <p className="mt-2 max-w-xl text-sm text-brand-muted">This goes straight to the owner. They review it under Shopkeeper reports, then stock changes only if they approve.</p>
      </div>
      <Notice error={params.error} notice={params.notice} />
      <form action={damageAction} className="grid max-w-xl gap-3 rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
        <select name="productId" required className="min-h-11 rounded-xl border border-brand-soft px-3" aria-label="Product">{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
        <input name="quantity" type="number" min={1} required placeholder="Quantity" aria-label="Quantity" className="min-h-11 rounded-xl border border-brand-soft px-3" />
        <select name="reason" aria-label="Reason" className="min-h-11 rounded-xl border border-brand-soft px-3">{Object.entries(damageReasonLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <textarea name="description" required placeholder="What happened?" aria-label="Description" className="min-h-24 rounded-xl border border-brand-soft px-3 py-2" />
        <label className="grid gap-1 text-sm">
          Picture
          <input name="photo" type="file" accept="image/*" aria-label="Photo" />
        </label>
        <button className="min-h-11 rounded-xl bg-brand-primary font-semibold text-brand-ink">Send to the owner</button>
      </form>
      <section className="rounded-2xl border border-brand-soft bg-white">
        <h2 className="border-b border-brand-soft px-4 py-3 font-display text-2xl">Sent to the owner</h2>
        {reports.length === 0 ? <p className="px-4 py-6">No damage reports yet.</p> : (
          <ul className="divide-y divide-brand-soft">
            {reports.map((report) => (
              <li key={report.id} className="grid gap-1 px-4 py-3">
                <p className="font-semibold">{report.product} · {report.quantity}</p>
                <p className="text-sm">{report.description}</p>
                <p className="text-sm text-brand-muted">{statusCopy[report.status] ?? report.status}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="text-sm text-brand-muted">The owner signs in at the office and opens Shopkeeper reports. <Link href="/sign-in" className="font-semibold">Sign-in page</Link></p>
    </div>
  );
}
