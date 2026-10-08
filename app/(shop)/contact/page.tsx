import { ContactForm } from "@/components/shop/contact-form";
import { getSettings } from "@/services/settings";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSettings();
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
