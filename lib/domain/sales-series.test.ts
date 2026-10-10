import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSalesSeries, dateKeysEnding, nairobiDateKey, nairobiDayStart, salesDayLabel } from "./sales-series";

describe("sales series", () => {
  it("keeps a bar for every day, including days with no sales", () => {
    const days = dateKeysEnding("2026-10-10", 14);
    assert.equal(days.length, 14);
    assert.equal(days[0], "2026-09-27");
    assert.equal(days.at(-1), "2026-10-10");
    const series = buildSalesSeries(
      [
        { day: "2026-10-10", revenueCents: 429000 },
        { day: "2026-10-10", revenueCents: 10000 },
      ],
      days,
    );
    assert.equal(series.length, 14);
    assert.equal(series[0]?.revenue, 0);
    assert.equal(series.at(-1)?.day, salesDayLabel("2026-10-10"));
    assert.equal(series.at(-1)?.revenue, 4390);
    const weekly = buildSalesSeries([{ day: "2026-10-10", revenueCents: 429000 }], days, "weekly");
    assert.equal(weekly.at(-1)?.revenue, 4290);
    assert.ok(weekly.length < 14);
  });

  it("labels a Nairobi calendar day without shifting it", () => {
    assert.equal(nairobiDateKey(new Date("2026-10-10T22:30:00.000Z")), "2026-10-11");
    assert.equal(nairobiDayStart("2026-10-10").toISOString(), "2026-10-09T21:00:00.000Z");
    assert.equal(salesDayLabel("2026-10-10"), "10 Oct");
  });
});
