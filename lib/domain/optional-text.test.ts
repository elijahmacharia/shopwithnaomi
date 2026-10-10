import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { optionalText, optionalTextRule } from "./optional-text";

describe("optional form text", () => {
  it("treats a missing form field as blank", () => {
    assert.equal(optionalText(40).parse(null), null);
    assert.equal(optionalText(40).parse(undefined), undefined);
    assert.equal(optionalText(40).parse("  Rice  "), "Rice");
  });

  it("still checks a picture path when one is sent", () => {
    const picture = optionalTextRule(80, (value) => !value || value.startsWith("/"), "Upload the picture as a file.");
    assert.equal(picture.parse(null), null);
    assert.equal(picture.parse("/media/photo.png"), "/media/photo.png");
    assert.throws(() => picture.parse("not-a-path"));
  });
});
