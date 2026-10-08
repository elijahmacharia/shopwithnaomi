import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addToCart, cartCount, cartTotal, parseCart, setQuantity, type CartLine } from "./cart.ts";

describe("cart", () => {
  it("adds a new line and increments an existing one", () => {
    const once = addToCart([], "ceramic-mug");
    const twice = addToCart(once, "ceramic-mug");
    assert.deepEqual(twice, [{ productId: "ceramic-mug", quantity: 2 }]);
  });

  it("removes a line when the quantity drops to zero", () => {
    const lines: CartLine[] = [{ productId: "aa-coffee", quantity: 1 }];
    assert.deepEqual(setQuantity(lines, "aa-coffee", 0), []);
  });

  it("totals price by quantity and ignores unknown products", () => {
    const lines: CartLine[] = [
      { productId: "market-tote", quantity: 1 },
      { productId: "missing", quantity: 2 },
    ];
    const prices: Record<string, number> = { "market-tote": 240_000 };
    assert.equal(cartCount(lines), 3);
    assert.equal(
      cartTotal(lines, (id) => prices[id] ?? 0),
      240_000,
    );
  });

  it("drops malformed saved lines", () => {
    const raw = JSON.stringify([
      { productId: "cotton-scarf", quantity: 2 },
      { productId: "", quantity: 1 },
      { productId: "beeswax-candle", quantity: 1.5 },
      { nope: true },
    ]);
    assert.deepEqual(parseCart(raw), [{ productId: "cotton-scarf", quantity: 2 }]);
    assert.deepEqual(parseCart("not-json"), []);
    assert.deepEqual(parseCart(null), []);
  });
});
