import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { centsToDecimalString, decimalToCents, parseMoneyToCents } from "@/lib/domain/money";
import { assertPaymentAmount, creditStatus } from "@/lib/domain/payment";
import { getPage } from "@/lib/pagination";
import { optionalText } from "@/lib/domain/optional-text";
import { z } from "zod";
import { money, notifyOwners, runTransaction, writeAudit } from "./common";

export async function listCredit(query: { page?: string; status?: string }) {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "credit");
  const paging = getPage(query.page);
  const where = {
    ...(actor.role === "EMPLOYEE" ? { sale: { employeeId: actor.id } } : {}),
    ...(query.status ? { status: query.status as "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" } : {}),
  };
  const [total, rows] = await prisma.$transaction([
    prisma.creditRecord.count({ where }),
    prisma.creditRecord.findMany({
      where,
      include: { customer: true, sale: true },
      orderBy: { dueDate: "asc" },
      skip: paging.skip,
      take: paging.take,
    }),
  ]);
  const now = new Date();
  return {
    ...paging,
    total,
    records: rows.map((row) => {
      const balance = decimalToCents(row.balance);
      const paid = decimalToCents(row.amountPaid);
      const status = creditStatus(balance, paid, row.dueDate, now);
      return {
        id: row.id,
        customer: row.customer.name,
        phone: row.customer.phone,
        saleNumber: row.sale.saleNumber,
        amount: centsToDecimalString(decimalToCents(row.amount)),
        amountPaid: centsToDecimalString(paid),
        balance: centsToDecimalString(balance),
        dueDate: row.dueDate,
        status,
      };
    }),
  };
}

const paymentSchema = z.object({
  creditId: z.string().min(1),
  amount: z.string().trim().min(1, "Enter the amount paid."),
  method: z.enum(["CASH", "MPESA", "OTHER"]),
  reference: optionalText(80),
});

export async function recordCreditPayment(input: unknown) {
  const actor = await requireUser(["OWNER"], "record-credit-payment");
  const data = paymentSchema.parse(input);
  const amount = parseMoneyToCents(data.amount);
  if (amount <= 0) {
    throw new AppError("Enter an amount greater than zero.");
  }
  await runTransaction(async (tx) => {
    const credit = await tx.creditRecord.findUnique({ where: { id: data.creditId }, include: { sale: true, customer: true } });
    if (!credit) {
      throw new AppError("Credit record not found.");
    }
    const outstanding = decimalToCents(credit.balance);
    assertPaymentAmount(amount, outstanding);
    const paid = decimalToCents(credit.amountPaid) + amount;
    const balance = outstanding - amount;
    const salePaid = decimalToCents(credit.sale.amountPaid) + amount;
    const saleBalance = decimalToCents(credit.sale.balance) - amount;
    const status = creditStatus(balance, paid, credit.dueDate);
    await tx.creditRecord.update({
      where: { id: credit.id },
      data: { amountPaid: money(paid), balance: money(balance), status: status === "OVERDUE" ? "OVERDUE" : status },
    });
    await tx.sale.update({
      where: { id: credit.saleId },
      data: {
        amountPaid: money(salePaid),
        balance: money(saleBalance),
        paymentStatus: saleBalance <= 0 ? "PAID" : "PARTIALLY_PAID",
      },
    });
    await tx.creditPayment.create({
      data: { creditId: credit.id, amount: money(amount), method: data.method, reference: data.reference || null, recordedBy: actor.id },
    });
    await tx.payment.create({
      data: {
        saleId: credit.saleId,
        customerId: credit.customerId,
        method: data.method,
        amount: money(amount),
        reference: data.reference || null,
        recordedBy: actor.id,
      },
    });
    await writeAudit(tx, {
      userId: actor.id,
      action: "credit.payment",
      entityType: "credit",
      entityId: credit.id,
      description: `Owner recorded a credit payment for ${credit.customer.name}.`,
      newValue: { amount: centsToDecimalString(amount), method: data.method },
    });
    await notifyOwners(tx, {
      type: "payment",
      title: "Credit payment recorded",
      message: `${credit.sale.saleNumber} · ${centsToDecimalString(amount)}`,
    });
  });
}
