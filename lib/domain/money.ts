export function parseMoneyToCents(input: string): number {
  const trimmed = input.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error("Enter a valid amount.");
  }
  const [whole, frac = ""] = trimmed.split(".");
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, "0").slice(0, 2));
  if (!Number.isSafeInteger(cents)) {
    throw new Error("Amount is too large.");
  }
  return cents;
}

export function centsToDecimalString(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  return `${sign}${whole}.${frac}`;
}

export function formatKsh(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100).toLocaleString("en-KE");
  const frac = String(abs % 100).padStart(2, "0");
  return `${negative ? "-" : ""}KSh ${whole}.${frac}`;
}

export function decimalToCents(value: { toFixed: (digits: number) => string } | string | number): number {
  const fixed = typeof value === "object" ? value.toFixed(2) : Number(value).toFixed(2);
  const negative = fixed.startsWith("-");
  return (negative ? -1 : 1) * parseMoneyToCents(fixed.replace("-", ""));
}

export function addCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function profitPerUnitCents(sellingCents: number, costCents: number): number {
  return sellingCents - costCents;
}

export function marginPercent(sellingCents: number, costCents: number): number {
  if (sellingCents <= 0) {
    return 0;
  }
  return Math.round(((sellingCents - costCents) * 10000) / sellingCents) / 100;
}
