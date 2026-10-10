import { digitsOnly } from "./whatsapp";

const PLACEHOLDER_PHONES = new Set(["254700000000"]);
const PLACEHOLDER_EMAILS = new Set(["hello@shopwithnaome.test"]);
const PLACEHOLDER_ADDRESSES = new Set(["ngong road, nairobi"]);

export function isPlaceholderPhone(value: string | null | undefined) {
  const digits = digitsOnly(value ?? "");
  return digits.length === 0 || PLACEHOLDER_PHONES.has(digits);
}

export function isPlaceholderEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase() ?? "";
  return email.length === 0 || email.endsWith(".test") || email.endsWith("@example.com") || PLACEHOLDER_EMAILS.has(email);
}

export function isPlaceholderAddress(value: string | null | undefined) {
  const address = value?.trim().toLowerCase() ?? "";
  return address.length === 0 || PLACEHOLDER_ADDRESSES.has(address);
}

export type PublicBusiness = {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  whatsapp: string;
  deliveryNote: string;
  pickupNote: string;
  paymentInstructions: string;
  logoUrl: string | null;
};

export function publicBusiness(settings: {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  whatsappNumber: string;
  deliveryNote?: string | null;
  pickupNote?: string | null;
  paymentInstructions?: string | null;
  logoUrl?: string | null;
}): PublicBusiness {
  return {
    businessName: settings.businessName,
    phone: isPlaceholderPhone(settings.phone) ? "" : settings.phone.trim(),
    email: isPlaceholderEmail(settings.email) ? "" : settings.email.trim(),
    address: isPlaceholderAddress(settings.address) ? "" : settings.address.trim(),
    openingHours: settings.openingHours.trim(),
    whatsapp: isPlaceholderPhone(settings.whatsappNumber) ? "" : digitsOnly(settings.whatsappNumber),
    deliveryNote: settings.deliveryNote?.trim() ?? "",
    pickupNote: settings.pickupNote?.trim() ?? "",
    paymentInstructions: settings.paymentInstructions?.trim() ?? "",
    logoUrl: settings.logoUrl ?? null,
  };
}

export function publishedWhatsapp(settingsNumber: string, envNumber?: string) {
  const fromSettings = isPlaceholderPhone(settingsNumber) ? "" : digitsOnly(settingsNumber);
  if (fromSettings) {
    return fromSettings;
  }
  const fromEnv = isPlaceholderPhone(envNumber) ? "" : digitsOnly(envNumber ?? "");
  return fromEnv;
}
