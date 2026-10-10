import { CheckoutForm } from "@/components/shop/checkout-form";
import { DatabaseSetup } from "@/components/database-setup";
import { publicBusiness } from "@/lib/domain/public-settings";
import { readStorefront } from "@/lib/read-storefront";
import { getSettings } from "@/services/settings";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const result = await readStorefront(() => getSettings());
  if (!result.ok) {
    return <DatabaseSetup problem={result.problem} />;
  }
  const settings = publicBusiness(result.data);
  return <CheckoutForm instructions={{ delivery: settings.deliveryNote, pickup: settings.pickupNote, payment: settings.paymentInstructions }} />;
}
