import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { publishedWhatsapp } from "@/lib/domain/public-settings";
import { digitsOnly } from "@/lib/domain/whatsapp";
import { optionalText } from "@/lib/domain/optional-text";
import { z } from "zod";
import { writeAudit } from "./common";

const settingsSchema = z.object({
  businessName: z.string().trim().min(2, "Enter the business name.").max(80),
  phone: z.string().trim().min(8, "Enter a phone number.").max(30),
  whatsappNumber: z.string().trim().min(8, "Enter the WhatsApp number.").max(30),
  email: z.string().trim().email("Enter a valid email."),
  address: z.string().trim().min(3, "Enter the address.").max(200),
  openingHours: z.string().trim().min(3, "Enter opening hours.").max(200),
  receiptFooter: optionalText(240),
  deliveryNote: optionalText(500),
  pickupNote: optionalText(500),
  paymentInstructions: optionalText(500),
  lowStockDefault: z.coerce.number().int().min(0).max(1000),
  logoUrl: optionalText(500),
});

export async function getSettings() {
  const settings = await prisma.businessSetting.findUnique({ where: { id: "default" } });
  if (!settings) {
    throw new Error("Business settings have not been seeded.");
  }
  return settings;
}

export async function getWhatsappNumber() {
  const settings = await getSettings();
  return publishedWhatsapp(settings.whatsappNumber, process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
}

export async function updateSettings(input: unknown) {
  const actor = await requireUser(["OWNER"], "settings");
  const data = settingsSchema.parse(input);
  const current = await getSettings();
  const next = await prisma.businessSetting.update({
    where: { id: "default" },
    data: {
      ...data,
      whatsappNumber: digitsOnly(data.whatsappNumber),
      receiptFooter: data.receiptFooter || "Thank you for shopping with us.",
      deliveryNote: data.deliveryNote ?? "",
      pickupNote: data.pickupNote ?? "",
      paymentInstructions: data.paymentInstructions ?? "",
      ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl || null } : {}),
    },
  });
  await writeAudit(prisma, {
    userId: actor.id,
    action: "settings.updated",
    entityType: "settings",
    entityId: "default",
    description: "Owner updated business settings.",
    oldValue: { businessName: current.businessName, whatsappNumber: current.whatsappNumber },
    newValue: { businessName: next.businessName, whatsappNumber: next.whatsappNumber },
  });
  return next;
}
