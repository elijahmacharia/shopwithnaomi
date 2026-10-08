import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertCan, can } from "./permissions";

describe("permissions", () => {
  it("lets the owner see cost, profit, and approvals", () => {
    assert.equal(can("OWNER", "view-cost"), true);
    assert.equal(can("OWNER", "profit"), true);
    assert.equal(can("OWNER", "approvals"), true);
    assert.doesNotThrow(() => assertCan("OWNER", "employees"));
  });

  it("keeps cost, profit, and approvals away from employees", () => {
    assert.equal(can("EMPLOYEE", "view-cost"), false);
    assert.equal(can("EMPLOYEE", "profit"), false);
    assert.equal(can("EMPLOYEE", "expenses"), false);
    assert.equal(can("EMPLOYEE", "sales"), true);
    assert.throws(() => assertCan("EMPLOYEE", "settings"), /permission/);
  });
});
