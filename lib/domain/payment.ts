export type PaymentStanding = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export function paymentStanding(totalCents: number, amountPaidCents: number): PaymentStanding {
  if (amountPaidCents <= 0) {
    return "UNPAID";
  }
  if (amountPaidCents >= totalCents) {
    return "PAID";
  }
  return "PARTIALLY_PAID";
}

export function assertPaymentAmount(amountCents: number, outstandingCents: number): void {
  if (amountCents < 0) {
    throw new Error("Payment amount cannot be negative.");
  }
  if (amountCents > outstandingCents) {
    throw new Error("Payment cannot exceed the amount due.");
  }
}

export function creditStatus(balanceCents: number, amountPaidCents: number, dueDate: Date, now = new Date()): "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" {
  if (balanceCents <= 0) {
    return "PAID";
  }
  if (dueDate.getTime() < now.getTime()) {
    return "OVERDUE";
  }
  if (amountPaidCents > 0) {
    return "PARTIALLY_PAID";
  }
  return "UNPAID";
}
