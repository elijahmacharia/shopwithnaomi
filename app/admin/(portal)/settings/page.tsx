import { settingsAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { getSettings } from "@/services/settings";

export const metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  return (
    <div>
      <h1 className="font-display text-3xl">Settings</h1>
      <Notice error={params.error} notice={params.notice} />
      <form action={settingsAction} className="mt-4 grid max-w-xl gap-3">
        <input name="businessName" defaultValue={settings.businessName} aria-label="Business name" className="min-h-11 rounded-md border px-3" />
        <input name="phone" defaultValue={settings.phone} aria-label="Phone" className="min-h-11 rounded-md border px-3" />
        <input name="whatsappNumber" defaultValue={settings.whatsappNumber} aria-label="WhatsApp number" className="min-h-11 rounded-md border px-3" />
        <input name="email" defaultValue={settings.email} aria-label="Email" className="min-h-11 rounded-md border px-3" />
        <input name="address" defaultValue={settings.address} aria-label="Address" className="min-h-11 rounded-md border px-3" />
        <input name="openingHours" defaultValue={settings.openingHours} aria-label="Opening hours" className="min-h-11 rounded-md border px-3" />
        <textarea name="receiptFooter" defaultValue={settings.receiptFooter} aria-label="Receipt footer" className="min-h-24 rounded-md border px-3 py-2" />
        <input name="lowStockDefault" type="number" defaultValue={settings.lowStockDefault} aria-label="Low stock default" className="min-h-11 rounded-md border px-3" />
        <button className="min-h-11 rounded-md bg-brand-ink font-semibold text-white">Save settings</button>
      </form>
    </div>
  );
}
