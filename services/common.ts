import { Prisma, type PrismaClient, type StockMovementType } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { centsToDecimalString } from "@/lib/domain/money";
import { assertSufficientStock } from "@/lib/domain/stock";

export type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">;

export function money(cents: number) {
  return new Prisma.Decimal(centsToDecimalString(cents));
}

export async function nextNumber(tx: Tx, key: string, prefix: string) {
  const row = await tx.counter.upsert({
    where: { id: key },
    create: { id: key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `${prefix}-${String(row.value).padStart(4, "0")}`;
}

export async function writeAudit(
  tx: Tx,
  entry: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    description: string;
    oldValue?: Prisma.InputJsonValue;
    newValue?: Prisma.InputJsonValue;
  },
) {
  await tx.auditLog.create({
    data: {
      userId: entry.userId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      description: entry.description,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
    },
  });
}

export async function notifyOwners(tx: Tx, notice: { type: string; title: string; message: string }) {
  const owners = await tx.user.findMany({
    where: { status: "ACTIVE", role: { name: "OWNER" } },
    select: { id: true },
  });
  if (owners.length === 0) {
    return;
  }
  await tx.notification.createMany({
    data: owners.map((owner) => ({ userId: owner.id, ...notice })),
  });
}

export async function notifyUser(tx: Tx, userId: string, notice: { type: string; title: string; message: string }) {
  await tx.notification.create({ data: { userId, ...notice } });
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length === 10 && digits.startsWith("0")) {
    return `254${digits.slice(1)}`;
  }
  return digits;
}

export async function upsertCustomer(
  tx: Tx,
  input: {
    name: string;
    phone: string;
    whatsappPhone?: string;
    email?: string;
    address?: string;
    landmark?: string;
  },
) {
  const phone = normalizePhone(input.phone);
  if (phone.length < 9) {
    throw new AppError("Enter a valid phone number.");
  }
  const existing = await tx.customer.findUnique({ where: { phone } });
  const data = {
    name: input.name.trim(),
    whatsappPhone: input.whatsappPhone ? normalizePhone(input.whatsappPhone) : phone,
    email: input.email?.trim() || null,
    address: input.address?.trim() || null,
    landmark: input.landmark?.trim() || null,
  };
  if (!data.name) {
    throw new AppError("Enter the customer name.");
  }
  if (existing) {
    return tx.customer.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        whatsappPhone: data.whatsappPhone,
        email: data.email ?? existing.email,
        address: data.address ?? existing.address,
        landmark: data.landmark ?? existing.landmark,
      },
    });
  }
  return tx.customer.create({ data: { ...data, phone } });
}

export async function changeStock(
  tx: Tx,
  input: {
    productId: string;
    productName: string;
    delta: number;
    movementType: StockMovementType;
    userId?: string | null;
    reason: string;
    referenceId?: string;
  },
) {
  if (input.delta === 0) {
    return;
  }
  if (input.delta < 0) {
    const current = await tx.product.findUnique({ where: { id: input.productId } });
    assertSufficientStock(current?.stockQuantity ?? 0, Math.abs(input.delta), input.productName);
  }
  const updated = await tx.product.update({
    where: {
      id: input.productId,
      ...(input.delta < 0 ? { stockQuantity: { gte: Math.abs(input.delta) } } : {}),
    },
    data: { stockQuantity: { increment: input.delta } },
  });
  await tx.stockMovement.create({
    data: {
      productId: input.productId,
      movementType: input.movementType,
      quantity: input.delta,
      quantityBefore: updated.stockQuantity - input.delta,
      quantityAfter: updated.stockQuantity,
      referenceId: input.referenceId,
      reason: input.reason,
      createdBy: input.userId ?? null,
    },
  });
  return updated;
}

export async function runTransaction<T>(work: (tx: Tx) => Promise<T>) {
  return prisma.$transaction(work, { timeout: 20000 });
}
