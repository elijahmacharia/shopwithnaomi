import Link from "next/link";
import { DatabaseSetup } from "@/components/database-setup";
import { SiteHeader } from "@/components/shop/site-header";
import { StoreProvider } from "@/components/shop/store-provider";
import { WhatsappButton } from "@/components/shop/whatsapp-button";
import { readStorefront } from "@/lib/read-storefront";
import { listCategories } from "@/services/catalog";
import { getSettings, getWhatsappNumber } from "@/services/settings";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const shell = await readStorefront(() => Promise.all([getSettings(), getWhatsappNumber(), listCategories()]));
  if (!shell.ok) {
    return <DatabaseSetup problem={shell.problem} />;
  }
  const [settings, whatsapp, categories] = shell.data;
  return (
    <StoreProvider>
      <SiteHeader />
      <main id="main" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-brand-soft bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-2xl">{settings.businessName}</p>
            {settings.address ? <p className="mt-3 text-sm text-brand-muted">{settings.address}</p> : null}
            {settings.phone ? <p className="text-sm text-brand-muted">{settings.phone}</p> : null}
            {settings.email ? <p className="text-sm text-brand-muted">{settings.email}</p> : null}
            {settings.openingHours ? <p className="mt-2 text-sm text-brand-muted">{settings.openingHours}</p> : null}
          </div>
          <div className="grid content-start gap-2 text-sm">
            <p className="font-semibold">Shop</p>
            <Link href="/shop">All products</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/help">Help</Link>
          </div>
          <div className="grid content-start gap-2 text-sm">
            <p className="font-semibold">Categories</p>
            {categories.map((category) => (
              <Link key={category.id} href={`/shop?category=${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>
          <div className="grid content-start gap-2 text-sm">
            <p className="font-semibold">Account</p>
            <Link href="/sign-in">Owner and shopkeeper sign in</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/wishlist">Wishlist</Link>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms and conditions</Link>
          </div>
        </div>
      </footer>
      <WhatsappButton number={whatsapp} />
    </StoreProvider>
  );
}
