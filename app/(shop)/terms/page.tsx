import { DatabaseSetup } from "@/components/database-setup";
import { readStorefront } from "@/lib/read-storefront";
import { getSettings } from "@/services/settings";

export const metadata = { title: "Terms and conditions" };

export default async function TermsPage() {
  const result = await readStorefront(() => getSettings());
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const settings = result.data;
  return (
    <article className="mx-auto grid max-w-2xl gap-4">
      <h1 className="font-display text-4xl">Terms and conditions</h1>
      <p className="text-brand-muted">These terms cover orders placed with {settings.businessName} through this website.</p>
      <p>Prices and stock on the site are checked again when you place an order. The shop can decline an item that is no longer available. The amount in the order record is the amount confirmed at that time.</p>
      <p>Sending the WhatsApp message creates a pending order. It is not a payment and it is not a completed sale until the shop confirms it.</p>
      <p>Choose home delivery or shop pickup and give an address and landmark the shop can use. Delivery timing is agreed with the shop.</p>
      <p>Pay the shop directly using the method they confirm, such as cash on delivery or another manual payment. This website does not charge a card or send an automatic mobile-money request.</p>
      <p>{settings.address ? `Shop address: ${settings.address}. ` : ""}{settings.openingHours ? `Hours: ${settings.openingHours}.` : ""}</p>
    </article>
  );
}
