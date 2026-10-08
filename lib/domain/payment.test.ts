import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertPaymentAmount, creditStatus, paymentStanding } from "./payment";

describe("payments", () => {
  it("marks unpaid, partial, and paid sales", () => {
    assert.equal(paymentStanding(200000, 0), "UNPAID");
    assert.equal(paymentStanding(200000, 150000), "PARTIALLY_PAID");
    assert.equal(paymentStanding(200000, 200000), "PAID");
  });

  it("rejects a negative amount and an overpayment", () => {
    assert.throws(() => assertPaymentAmount(-1, 100), /negative/);
    assert.throws(() => assertPaymentAmount(101, 100), /exceed/);
  });

  it("marks overdue credit when a balance remains after the due date", () => {
    const due = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-02-01T00:00:00Z");
    assert.equal(creditStatus(5000, 0, due, now), "OVERDUE");
    assert.equal(creditStatus(0, 5000, due, now), "PAID");
  });
});
