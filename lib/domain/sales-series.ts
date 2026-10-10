const NAIROBI = "Africa/Nairobi";

export function nairobiDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIROBI,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function shiftDateKey(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateKeysEnding(endKey: string, days: number): string[] {
  return Array.from({ length: days }, (_, index) => shiftDateKey(endKey, index - (days - 1)));
}

export function nairobiDayStart(key: string): Date {
  return new Date(`${key}T00:00:00+03:00`);
}

export function salesDayLabel(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export type SalesView = "daily" | "weekly" | "monthly";

function weekStart(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - (weekday === 0 ? 6 : weekday - 1));
  return date.toISOString().slice(0, 10);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-KE", { month: "short", year: "numeric", timeZone: "UTC" });
}

export function buildSalesSeries(
  rows: Array<{ day: string; revenueCents: number }>,
  days: string[],
  view: SalesView = "daily",
): Array<{ day: string; revenue: number }> {
  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.day, (totals.get(row.day) ?? 0) + row.revenueCents);
  }
  if (view === "daily") {
    return days.map((day) => ({
      day: salesDayLabel(day),
      revenue: (totals.get(day) ?? 0) / 100,
    }));
  }
  const buckets = new Map<string, { label: string; cents: number }>();
  for (const day of days) {
    const key = view === "weekly" ? weekStart(day) : day.slice(0, 7);
    const current = buckets.get(key) ?? { label: view === "weekly" ? salesDayLabel(key) : monthLabel(day), cents: 0 };
    current.cents += totals.get(day) ?? 0;
    buckets.set(key, current);
  }
  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, bucket]) => ({ day: bucket.label, revenue: bucket.cents / 100 }));
}
