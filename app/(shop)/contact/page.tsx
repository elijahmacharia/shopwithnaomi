import { ContactForm } from "@/components/shop/contact-form";
import { DatabaseSetup } from "@/components/database-setup";
import { readStorefront } from "@/lib/read-storefront";
import { publicBusiness } from "@/lib/domain/public-settings";
import { getSettings } from "@/services/settings";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const result = await readStorefront(() => getSettings());
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const settings = publicBusiness(result.data);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Contact</h1>
        <p className="mt-2">{settings.phone || "Phone not published yet."}</p>
        <p>{settings.email || "Email not published yet."}</p>
        <p>{settings.address || "Address not published yet."}</p>
      </div>
      <ContactForm />
    </div>
  );
}
