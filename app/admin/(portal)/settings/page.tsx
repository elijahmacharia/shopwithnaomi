import { settingsAction } from "@/actions/ops";
import { ImagePicker } from "@/components/image-picker";
import { Notice } from "@/components/notice";
import { isPlaceholderAddress, isPlaceholderEmail, isPlaceholderPhone } from "@/lib/domain/public-settings";
import { getSettings } from "@/services/settings";

export const metadata = { title: "Settings" };

const field = "min-h-11 rounded-xl border border-brand-soft px-3";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  const hidden = isPlaceholderPhone(settings.phone) || isPlaceholderEmail(settings.email) || isPlaceholderAddress(settings.address) || isPlaceholderPhone(settings.whatsappNumber);
  return (
    <div className="grid max-w-xl gap-4">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-brand-muted">These details appear on the shop, receipts, and WhatsApp messages.</p>
      </div>
      {hidden ? <p className="rounded-xl border border-brand-secondary bg-white px-4 py-3 text-sm">Sample contact details are hidden from customers. Replace the phone, WhatsApp number, email, and address with the shop&apos;s own details.</p> : null}
      <Notice error={params.error} notice={params.notice} />
      <form action={settingsAction} className="grid gap-3 rounded-2xl border border-brand-soft bg-white p-4 shadow-card">
        <label className="grid gap-1 text-sm">Business name<input name="businessName" defaultValue={settings.businessName} required className={field} /></label>
        <ImagePicker name="logo" label="Choose logo" currentUrl={settings.logoUrl} />
        <label className="grid gap-1 text-sm">Telephone<input name="phone" defaultValue={settings.phone} required className={field} /></label>
        <label className="grid gap-1 text-sm">WhatsApp number<input name="whatsappNumber" defaultValue={settings.whatsappNumber} required className={field} /></label>
        <label className="grid gap-1 text-sm">Email<input name="email" type="email" defaultValue={settings.email} required className={field} /></label>
        <label className="grid gap-1 text-sm">Address<input name="address" defaultValue={settings.address} required className={field} /></label>
        <label className="grid gap-1 text-sm">Opening hours<input name="openingHours" defaultValue={settings.openingHours} required className={field} /></label>
        <label className="grid gap-1 text-sm">Delivery information<textarea name="deliveryNote" defaultValue={settings.deliveryNote} className="min-h-24 rounded-xl border border-brand-soft px-3 py-2" /></label>
        <label className="grid gap-1 text-sm">Pickup information<textarea name="pickupNote" defaultValue={settings.pickupNote} className="min-h-24 rounded-xl border border-brand-soft px-3 py-2" /></label>
        <label className="grid gap-1 text-sm">Payment instructions<textarea name="paymentInstructions" defaultValue={settings.paymentInstructions} className="min-h-24 rounded-xl border border-brand-soft px-3 py-2" /></label>
        <label className="grid gap-1 text-sm">Receipt footer<textarea name="receiptFooter" defaultValue={settings.receiptFooter} className="min-h-24 rounded-xl border border-brand-soft px-3 py-2" /></label>
        <label className="grid gap-1 text-sm">Default low-stock threshold<input name="lowStockDefault" type="number" min={0} defaultValue={settings.lowStockDefault} className={field} /></label>
        <button className="min-h-11 rounded-xl bg-brand-primary font-semibold text-brand-ink">Save settings</button>
      </form>
    </div>
  );
}
