export const paymentMethodLabel = {
  CASH: "Cash",
  MPESA: "M-Pesa",
  OTHER: "Other",
  CREDIT: "Credit / Pay Later",
} as const;

export const paymentStatusLabel = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
} as const;

export const orderStatusLabel = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  AWAITING_PAYMENT: "Awaiting payment",
  PACKING: "Packing",
  READY_FOR_DELIVERY: "Ready for delivery",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

export const creditStatusLabel = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
} as const;

export const damageReasonLabel = {
  BROKEN: "Broken",
  FAULTY: "Faulty",
  EXPIRED: "Expired",
  CUSTOMER_RETURN: "Customer return",
  OTHER: "Other",
} as const;

export const expenseCategoryLabel = {
  TRANSPORT: "Transport",
  DELIVERY: "Delivery",
  ELECTRICITY: "Electricity",
  PACKAGING: "Packaging",
  REPAIRS: "Repairs",
  OTHER: "Other",
} as const;
