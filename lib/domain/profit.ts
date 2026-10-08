export type ProfitInput = {
  revenueCents: number;
  cogsCents: number;
  expenseCents: number;
};

export function grossProfitCents(revenueCents: number, cogsCents: number): number {
  return revenueCents - cogsCents;
}

export function netProfitCents(input: ProfitInput): number {
  return grossProfitCents(input.revenueCents, input.cogsCents) - input.expenseCents;
}
