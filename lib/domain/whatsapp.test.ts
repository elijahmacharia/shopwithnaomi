import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildOrderMessage, whatsappUrl } from "./whatsapp";

describe("whatsapp", () => {
  it("builds one order message and a wa.me link", () => {
    const message = buildOrderMessage({
      businessName: "SHOP WITH NÁOMÉ",
      customerName: "Amina Yusuf",
      phone: "0712345678",
      orderNumber: "O-1001",
      lines: [{ name: "Rice 2kg", quantity: 2, unitPrice: "KSh 380.00", subtotal: "KSh 760.00" }],
      total: "KSh 760.00",
      deliveryMethod: "DELIVERY",
      address: "Kilimani",
      landmark: "Near the stage",
    });
    assert.match(message, /O-1001/);
    assert.match(message, /Rice 2kg x 2/);
    assert.match(whatsappUrl("+254 700 000 000", message), /^https:\/\/wa\.me\/254700000000\?text=/);
  });
});
