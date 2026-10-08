import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { databaseProblem } from "./database-problem";

describe("database problems", () => {
  it("recognises a missing connection string", () => {
    assert.equal(databaseProblem(new Error("Environment variable not found: DATABASE_URL.")), "missing-url");
  });

  it("recognises a localhost database from a deployed server", () => {
    assert.equal(databaseProblem(new Error("Can't reach database server at `localhost:5432`")), "localhost");
  });

  it("recognises missing tables and an empty shop", () => {
    assert.equal(databaseProblem(new Error("The table `public.BusinessSetting` does not exist in the current database.")), "not-ready");
    assert.equal(databaseProblem(new Error("Business settings have not been seeded.")), "not-seeded");
  });

  it("leaves ordinary errors alone", () => {
    assert.equal(databaseProblem(new Error("Enter a product name.")), null);
  });
});
