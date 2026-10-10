import Link from "next/link";
import { DatabaseSetup } from "@/components/database-setup";
import { SiteHeader } from "@/components/shop/site-header";
import { StoreProvider } from "@/components/shop/store-provider";
import { WhatsappButton } from "@/components/shop/whatsapp-button";
import { readStorefront } from "@/lib/read-storefront";
import { getSettings, getWhatsappNumber } from "@/services/settings";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const shell = await readStorefront(() => Promise.all([getSettings(), getWhatsappNumber()]));
  if (!shell.ok) {
    return <DatabaseSetup problem={shell.problem} />;
  }
  const [settings, whatsapp] = shell.data;
  return (
    <StoreProvider>
      <SiteHeader />
      <main id="main" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">
        {children}
      </main>
      <footer className="bg-brand-ink text-brand-soft">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-2xl text-white">{settings.businessName}</p>
            <p className="mt-2">{settings.address}</p>
            <p>{settings.openingHours}</p>
          </div>
          <div className="grid gap-2 text-sm">
            <Link href="/shop">Shop</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="grid gap-2 text-sm">
            <Link href="/sign-in">Owner and shopkeeper sign in</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/wishlist">Wishlist</Link>
          </div>
        </div>
      </footer>
      <WhatsappButton number={whatsapp} />
    </StoreProvider>
  );
}
