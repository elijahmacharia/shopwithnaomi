import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { imageMime } from "./image-file";

describe("image files", () => {
  it("recognises jpeg, png, and webp from the file bytes", () => {
    assert.equal(imageMime(Uint8Array.from([0xff, 0xd8, 0xff, 0x00])), "image/jpeg");
    assert.equal(imageMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])), "image/png");
    const webp = new Uint8Array(12);
    webp.set([0x52, 0x49, 0x46, 0x46], 0);
    webp.set([0x57, 0x45, 0x42, 0x50], 8);
    assert.equal(imageMime(webp), "image/webp");
  });

  it("rejects a file that only claims to be an image", () => {
    assert.equal(imageMime(Uint8Array.from([0x3c, 0x73, 0x76, 0x67])), null);
  });
});
