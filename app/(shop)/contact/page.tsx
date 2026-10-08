import { ContactForm } from "@/components/shop/contact-form";
import { DatabaseSetup } from "@/components/database-setup";
import { readStorefront } from "@/lib/read-storefront";
import { getSettings } from "@/services/settings";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const result = await readStorefront(() => getSettings());
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const settings = result.data;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Contact</h1>
        <p className="mt-2">{settings.phone} · {settings.email}</p>
        <p>{settings.address}</p>
      </div>
      <ContactForm />
    </div>
  );
}
