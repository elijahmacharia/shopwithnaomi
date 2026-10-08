import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { centsToDecimalString, formatKsh, marginPercent, parseMoneyToCents, profitPerUnitCents } from "./money";

describe("money", () => {
  it("parses shillings into cents", () => {
    assert.equal(parseMoneyToCents("1500"), 150000);
    assert.equal(parseMoneyToCents("10.5"), 1050);
    assert.equal(centsToDecimalString(1050), "10.50");
    assert.equal(formatKsh(150000), "KSh 1,500.00");
  });

  it("rejects invalid amounts", () => {
    assert.throws(() => parseMoneyToCents("-1"));
    assert.throws(() => parseMoneyToCents("1.234"));
  });

  it("calculates profit and margin from integer cents", () => {
    assert.equal(profitPerUnitCents(35000, 20000), 15000);
    assert.equal(marginPercent(20000, 5000), 75);
  });
});
