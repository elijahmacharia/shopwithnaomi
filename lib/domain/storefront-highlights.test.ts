import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { distinctHighlights } from "./storefront-highlights";

describe("storefront highlights", () => {
  it("does not repeat a product across the three rows", () => {
    const items = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
    const result = distinctHighlights(items.slice(0, 3), [items[0], items[1], items[3]], [items[2], items[4], items[0]]);
    const ids = [...result.shelf, ...result.popular, ...result.newest].map((item) => item.id);
    assert.deepEqual(ids, ["a", "b", "c", "d", "e"]);
    assert.equal(new Set(ids).size, ids.length);
  });
});