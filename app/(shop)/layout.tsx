import { SiteHeader } from "@/components/shop/site-header";
import { StoreProvider } from "@/components/shop/store-provider";
import { WhatsappButton } from "@/components/shop/whatsapp-button";
import { getSettings, getWhatsappNumber } from "@/services/settings";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [settings, whatsapp] = await Promise.all([getSettings(), getWhatsappNumber()]);
  return (
    <StoreProvider>
      <SiteHeader />
      <main id="main" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-brand-soft bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-brand-muted sm:flex-row sm:justify-between">
          <p>{settings.businessName}</p>
          <p>{settings.address}</p>
          <p>{settings.openingHours}</p>
        </div>
      </footer>
      <WhatsappButton number={whatsapp} />
    </StoreProvider>
  );
}
