import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertSufficientStock, isLowStock, stockAfterSale } from "./stock";

describe("stock", () => {
  it("reduces stock and blocks a sale that exceeds availability", () => {
    assert.equal(stockAfterSale(25, 2), 23);
    assert.throws(() => assertSufficientStock(3, 4, "Maize flour"), /Only 3 units/);
  });

  it("treats minimum stock as low stock", () => {
    assert.equal(isLowStock(5, 5), true);
    assert.equal(isLowStock(0, 5), true);
    assert.equal(isLowStock(6, 5), false);
  });
});
