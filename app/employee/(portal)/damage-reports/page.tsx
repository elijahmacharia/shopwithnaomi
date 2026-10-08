import { damageAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { damageReasonLabel } from "@/lib/labels";
import { listDamageReports } from "@/services/approvals";
import { listPosProducts } from "@/services/sales";

export const metadata = { title: "Damage reports" };

export default async function DamagePage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const params = await searchParams;
  const [reports, products] = await Promise.all([listDamageReports("own"), listPosProducts()]);
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-3xl">Report damage</h1>
      <Notice error={params.error} notice={params.notice} />
      <form action={damageAction} className="grid max-w-xl gap-3 rounded-md bg-white p-4">
        <select name="productId" required className="min-h-11 rounded-md border px-3" aria-label="Product">{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
        <input name="quantity" type="number" min={1} required placeholder="Quantity" aria-label="Quantity" className="min-h-11 rounded-md border px-3" />
        <select name="reason" aria-label="Reason" className="min-h-11 rounded-md border px-3">{Object.entries(damageReasonLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <textarea name="description" required placeholder="What happened?" aria-label="Description" className="min-h-24 rounded-md border px-3 py-2" />
        <input name="photo" type="file" accept="image/*" aria-label="Photo" />
        <button className="min-h-11 rounded-md bg-brand-ink font-semibold text-white">Submit damage report</button>
      </form>
      <ul className="divide-y rounded-md border bg-white">
        {reports.map((report) => <li key={report.id} className="px-4 py-3">{report.product} · {report.quantity} · {report.status}</li>)}
      </ul>
    </div>
  );
}
