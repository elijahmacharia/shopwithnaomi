import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { publicBusiness, publishedWhatsapp } from "./public-settings";

const sample = {
  businessName: "SHOP WITH NÁOMÉ",
  phone: "254700000000",
  email: "hello@shopwithnaome.test",
  address: "Ngong Road, Nairobi",
  openingHours: "Monday to Saturday, 8:00 to 19:00",
  whatsappNumber: "254700000000",
  deliveryNote: "",
  pickupNote: "",
  paymentInstructions: "",
};

describe("public business details", () => {
  it("hides the sample phone, email, address, and WhatsApp number", () => {
    const shown = publicBusiness(sample);
    assert.equal(shown.phone, "");
    assert.equal(shown.email, "");
    assert.equal(shown.address, "");
    assert.equal(shown.whatsapp, "");
    assert.equal(shown.openingHours, sample.openingHours);
  });

  it("keeps details the owner has replaced", () => {
    const shown = publicBusiness({
      ...sample,
      phone: "0712 345 678",
      email: "shop@naome.co.ke",
      address: "Kilimani, Nairobi",
      whatsappNumber: "+254712345678",
      deliveryNote: "Delivery inside Kilimani.",
    });
    assert.equal(shown.phone, "0712 345 678");
    assert.equal(shown.email, "shop@naome.co.ke");
    assert.equal(shown.address, "Kilimani, Nairobi");
    assert.equal(shown.whatsapp, "254712345678");
    assert.equal(shown.deliveryNote, "Delivery inside Kilimani.");
  });

  it("ignores a placeholder environment number when settings are still the sample", () => {
    assert.equal(publishedWhatsapp("254700000000", "254700000000"), "");
    assert.equal(publishedWhatsapp("254700000000", "254712345678"), "254712345678");
    assert.equal(publishedWhatsapp("0712345678", "254700000000"), "0712345678");
  });
});
