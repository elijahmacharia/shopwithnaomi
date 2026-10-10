import Link from "next/link";
import { DatabaseSetup } from "@/components/database-setup";
import { readStorefront } from "@/lib/read-storefront";
import { getSettings } from "@/services/settings";

export const metadata = { title: "Help" };

export default async function HelpPage() {
  const result = await readStorefront(() => getSettings());
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const settings = result.data;
  return (
    <article className="mx-auto grid max-w-2xl gap-6">
      <h1 className="font-display text-4xl">Help</h1>
      <section>
        <h2 className="font-display text-2xl">How to order</h2>
        <p className="mt-2 text-brand-muted">Browse the shop, add items to the cart, and check out as a guest. The last step is Order via WhatsApp. That creates a pending order and opens a message to the shop. Opening WhatsApp does not mark the order as paid.</p>
      </section>
      <section>
        <h2 className="font-display text-2xl">Wishlist</h2>
        <p className="mt-2 text-brand-muted">The heart on a product saves it in this browser. It stays after a refresh and does not need an account. The cart is separate.</p>
      </section>
      <section>
        <h2 className="font-display text-2xl">Delivery and pickup</h2>
        <p className="mt-2 text-brand-muted">Checkout asks for delivery or shop pickup, plus a landmark. The shop confirms availability before it packs the order.</p>
      </section>
      <section>
        <h2 className="font-display text-2xl">Payment</h2>
        <p className="mt-2 text-brand-muted">Payment is arranged with the shop. Cash on delivery and other manual payments follow the instructions the owner has set. The site does not take card or automatic mobile-money payments.</p>
      </section>
      <section>
        <h2 className="font-display text-2xl">Contact</h2>
        <p className="mt-2 text-brand-muted">{settings.businessName}{settings.phone ? ` · ${settings.phone}` : ""}{settings.email ? ` · ${settings.email}` : ""}</p>
        <Link href="/contact" className="mt-3 inline-flex min-h-11 items-center font-semibold underline decoration-brand-primary underline-offset-4">
          Contact page
        </Link>
      </section>
    </article>
  );
}
