import { DatabaseSetup } from "@/components/database-setup";
import { readStorefront } from "@/lib/read-storefront";
import { getSettings } from "@/services/settings";

export const metadata = { title: "Privacy policy" };

export default async function PrivacyPage() {
  const result = await readStorefront(() => getSettings());
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const settings = result.data;
  return (
    <article className="mx-auto grid max-w-2xl gap-4">
      <h1 className="font-display text-4xl">Privacy policy</h1>
      <p className="text-brand-muted">This page describes how {settings.businessName} handles the details you give while shopping. There is no customer account.</p>
      <p>The cart and wishlist stay in your browser. They are not a customer profile.</p>
      <p>A guest order stores the name, phone, optional WhatsApp number and email, delivery or pickup choice, address, landmark, notes, and the products you asked for. The shop uses that record to prepare the order.</p>
      <p>Order via WhatsApp opens a message that includes the order reference, products, quantities, total, and delivery choice. Avoid putting extra personal details in that message.</p>
      <p>Staff sign-in is only for the owner and shopkeeper. Customers cannot sign in.</p>
      <p>To ask about an order, use the contact details on this site{settings.email ? `: ${settings.email}` : ""}{settings.phone ? ` or ${settings.phone}` : ""}.</p>
    </article>
  );
}
