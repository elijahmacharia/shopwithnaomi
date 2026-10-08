"use server";

import { unstable_rethrow } from "next/navigation";
import { toUserMessage } from "@/lib/errors";
import { getPublicProductsByIds } from "@/services/catalog";
import { createGuestOrder } from "@/services/orders";
import { submitContact } from "@/services/notifications";
import { z } from "zod";

export async function loadProducts(ids: string[]) {
  return getPublicProductsByIds(ids.slice(0, 50));
}

export async function checkoutAction(input: unknown) {
  try {
    return { ok: true as const, order: await createGuestOrder(input) };
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false as const, error: toUserMessage(error) };
  }
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  phone: z.string().trim().min(8, "Enter your phone number."),
  message: z.string().trim().min(5, "Enter a message.").max(500),
});

export async function contactAction(_prev: { error?: string; success?: string } | null, formData: FormData) {
  try {
    const data = contactSchema.parse({
      name: formData.get("name"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    });
    await submitContact(data);
    return { success: "Message sent. The shop will get back to you." };
  } catch (error) {
    unstable_rethrow(error);
    return { error: toUserMessage(error) };
  }
}
