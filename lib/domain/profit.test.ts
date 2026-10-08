import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { grossProfitCents, netProfitCents } from "./profit";

describe("profit", () => {
  it("subtracts cost and expenses from revenue", () => {
    assert.equal(grossProfitCents(100000, 40000), 60000);
    assert.equal(netProfitCents({ revenueCents: 100000, cogsCents: 40000, expenseCents: 15000 }), 45000);
  });
});
