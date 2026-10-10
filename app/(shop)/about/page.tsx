import { DatabaseSetup } from "@/components/database-setup";
import { readStorefront } from "@/lib/read-storefront";
import { publicBusiness } from "@/lib/domain/public-settings";
import { getSettings } from "@/services/settings";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const result = await readStorefront(() => getSettings());
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const settings = publicBusiness(result.data);
  return (
    <article className="max-w-2xl">
      <h1 className="font-display text-3xl">About {settings.businessName}</h1>
      <p className="mt-4">We sell household essentials for Kenyan homes: cleaning, kitchen, food, poultry, and the small things that keep a house running.</p>
      {settings.address ? <p className="mt-3">{settings.address}</p> : <p className="mt-3">The shop has not published an address yet.</p>}
      {settings.openingHours ? <p>{settings.openingHours}</p> : null}
      {settings.phone ? <p>{settings.phone}</p> : null}
    </article>
  );
}
