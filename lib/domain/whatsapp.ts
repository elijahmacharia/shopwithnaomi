export type WhatsappLine = {
  name: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
};

export type WhatsappOrder = {
  businessName: string;
  customerName: string;
  phone: string;
  orderNumber: string;
  lines: WhatsappLine[];
  total: string;
  deliveryMethod: "PICKUP" | "DELIVERY";
  address?: string;
  landmark?: string;
  notes?: string;
};

export function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function buildOrderMessage(order: WhatsappOrder): string {
  const lines = order.lines
    .map((line) => `- ${line.name} x ${line.quantity} @ ${line.unitPrice} = ${line.subtotal}`)
    .join("\n");
  const delivery =
    order.deliveryMethod === "DELIVERY"
      ? `Delivery\nAddress: ${order.address || "-"}\nLandmark: ${order.landmark || "-"}`
      : "Pickup";
  return [
    order.businessName,
    `Order ${order.orderNumber}`,
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    "Items:",
    lines,
    `Total: ${order.total}`,
    delivery,
    order.notes ? `Notes: ${order.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function whatsappUrl(phone: string, message: string): string {
  const number = digitsOnly(phone);
  if (!number) {
    throw new Error("Add a WhatsApp number in settings before sending orders.");
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
