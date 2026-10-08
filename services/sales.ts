import { Prisma, type PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { decimalToCents, centsToDecimalString, parseMoneyToCents } from "@/lib/domain/money";
import { assertPaymentAmount, paymentStanding } from "@/lib/domain/payment";
import { getPage } from "@/lib/pagination";
import { z } from "zod";
import { changeStock, money, nextNumber, notifyOwners, runTransaction, upsertCustomer, writeAudit } from "./common";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive("Enter a valid quantity."),
});

const saleSchema = z.object({
  items: z.array(itemSchema).min(1, "Add at least one product."),
  method: z.enum(["CASH", "MPESA", "OTHER", "CREDIT"]),
  amountPaid: z.string().trim(),
  reference: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(400).optional(),
  customerName: z.string().trim().max(120).optional(),
  customerPhone: z.string().trim().max(30).optional(),
  dueDate: z.string().optional(),
  clientRequestId: z.string().uuid().optional(),
});

export type CompleteSaleInput = z.infer<typeof saleSchema>;

function price(value: Prisma.Decimal) {
  return centsToDecimalString(decimalToCents(value));
}

export async function listPosProducts(query?: string) {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "sales");
  const rows = await prisma.product.findMany({
    where: {
      archivedAt: null,
      isActive: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { sku: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { name: "asc" },
    take: 100,
  });
  return rows.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    sellingPrice: price(product.sellingPrice),
    stockQuantity: product.stockQuantity,
    category: product.category.name,
    ...(actor.role === "OWNER" ? { costPrice: price(product.costPrice) } : {}),
  }));
}

export async function completeSale(input: unknown) {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "sales");
  const data = saleSchema.parse(input);
  if (data.clientRequestId) {
    const existing = await prisma.sale.findUnique({ where: { clientRequestId: data.clientRequestId } });
    if (existing) {
      return { saleId: existing.id, saleNumber: existing.saleNumber };
    }
  }
  const amountPaidCents = data.amountPaid ? parseMoneyToCents(data.amountPaid) : 0;
  const ids = data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids }, archivedAt: null, isActive: true } });
  const byId = new Map(products.map((product) => [product.id, product]));
  let totalCents = 0;
  const lines = data.items.map((item) => {
    const product = byId.get(item.productId);
    if (!product) {
      throw new AppError("One of the products is no longer available.");
    }
    if (product.stockQuantity < item.quantity) {
      throw new AppError(
        product.stockQuantity <= 0
          ? `${product.name} is out of stock.`
          : `Only ${product.stockQuantity} units of ${product.name} are available.`,
      );
    }
    const unit = decimalToCents(product.sellingPrice);
    const subtotal = unit * item.quantity;
    totalCents += subtotal;
    return { product, quantity: item.quantity, unit, subtotal, cost: decimalToCents(product.costPrice) };
  });
  assertPaymentAmount(amountPaidCents, totalCents);
  const balanceCents = totalCents - amountPaidCents;
  if (data.method !== "CREDIT" && amountPaidCents === 0) {
    throw new AppError("Enter the amount paid, or choose Credit / Pay Later.");
  }
  if (balanceCents > 0 && (!data.customerName || !data.customerPhone || !data.dueDate)) {
    throw new AppError("A balance needs the customer name, phone, and due date.");
  }
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (balanceCents > 0 && (!dueDate || Number.isNaN(dueDate.getTime()))) {
    throw new AppError("Enter a valid due date.");
  }

  try {
    return await runTransaction(async (tx) => {
      const saleNumber = await nextNumber(tx, "sale", "S");
      const customer =
        data.customerName && data.customerPhone
          ? await upsertCustomer(tx, { name: data.customerName, phone: data.customerPhone })
          : null;
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          employeeId: actor.id,
          customerId: customer?.id,
          subtotal: money(totalCents),
          total: money(totalCents),
          amountPaid: money(amountPaidCents),
          balance: money(balanceCents),
          paymentStatus: paymentStanding(totalCents, amountPaidCents),
          paymentMethod: data.method,
          notes: data.notes || null,
          clientRequestId: data.clientRequestId,
        },
      });
      for (const line of lines) {
        await changeStock(tx, {
          productId: line.product.id,
          productName: line.product.name,
          delta: -line.quantity,
          movementType: "SALE",
          userId: actor.id,
          reason: `Sale ${saleNumber}`,
          referenceId: sale.id,
        });
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: line.product.id,
            quantity: line.quantity,
            unitPrice: money(line.unit),
            costPriceSnapshot: money(line.cost),
            subtotal: money(line.subtotal),
          },
        });
      }
      if (amountPaidCents > 0 && data.method !== "CREDIT") {
        await tx.payment.create({
          data: {
            saleId: sale.id,
            customerId: customer?.id,
            method: data.method,
            amount: money(amountPaidCents),
            reference: data.reference || null,
            notes: data.notes || null,
            recordedBy: actor.id,
          },
        });
      }
      if (amountPaidCents > 0 && data.method === "CREDIT") {
        await tx.payment.create({
          data: {
            saleId: sale.id,
            customerId: customer?.id,
            method: "CASH",
            amount: money(amountPaidCents),
            reference: data.reference || null,
            notes: "Amount received with a credit sale.",
            recordedBy: actor.id,
          },
        });
      }
      if (balanceCents > 0 && customer && dueDate) {
        await tx.creditRecord.create({
          data: {
            saleId: sale.id,
            customerId: customer.id,
            amount: money(balanceCents),
            amountPaid: money(0),
            balance: money(balanceCents),
            dueDate,
            status: "UNPAID",
            notes: data.notes || null,
          },
        });
      }
      await writeAudit(tx, {
        userId: actor.id,
        action: "sale.completed",
        entityType: "sale",
        entityId: sale.id,
        description: `${actor.name} completed sale ${saleNumber}.`,
        newValue: { total: centsToDecimalString(totalCents), amountPaid: centsToDecimalString(amountPaidCents), method: data.method },
      });
      await notifyOwners(tx, {
        type: balanceCents > 0 ? "credit" : "sale",
        title: balanceCents > 0 ? "Credit sale recorded" : "New sale",
        message: `${saleNumber} · KSh ${centsToDecimalString(totalCents)} · ${actor.name}`,
      });
      return { saleId: sale.id, saleNumber };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && data.clientRequestId) {
      const existing = await prisma.sale.findUnique({ where: { clientRequestId: data.clientRequestId } });
      if (existing) {
        return { saleId: existing.id, saleNumber: existing.saleNumber };
      }
    }
    throw error;
  }
}

export async function listSales(query: {
  page?: string;
  q?: string;
  employeeId?: string;
  method?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "sales");
  const paging = getPage(query.page);
  const where: Prisma.SaleWhereInput = {
    ...(actor.role === "EMPLOYEE" ? { employeeId: actor.id } : {}),
    ...(actor.role === "OWNER" && query.employeeId ? { employeeId: query.employeeId } : {}),
    ...(query.method ? { paymentMethod: query.method as PaymentMethod } : {}),
    ...(query.status ? { paymentStatus: query.status as Prisma.SaleWhereInput["paymentStatus"] } : {}),
    ...(query.from || query.to
      ? { createdAt: { gte: query.from ? new Date(query.from) : undefined, lte: query.to ? new Date(query.to) : undefined } }
      : {}),
    ...(query.q
      ? {
          OR: [
            { saleNumber: { contains: query.q, mode: "insensitive" } },
            { customer: { name: { contains: query.q, mode: "insensitive" } } },
            { employee: { name: { contains: query.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const [total, rows] = await prisma.$transaction([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      include: { customer: true, employee: true },
      orderBy: { createdAt: "desc" },
      skip: paging.skip,
      take: paging.take,
    }),
  ]);
  return {
    ...paging,
    total,
    sales: rows.map((sale) => ({
      id: sale.id,
      saleNumber: sale.saleNumber,
      createdAt: sale.createdAt,
      employee: sale.employee.name,
      customer: sale.customer?.name ?? "Walk-in",
      total: price(sale.total),
      amountPaid: price(sale.amountPaid),
      balance: price(sale.balance),
      method: sale.paymentMethod,
      status: sale.paymentStatus,
    })),
  };
}

export async function getSale(id: string) {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "sales");
  const sale = await prisma.sale.findFirst({
    where: { id, ...(actor.role === "EMPLOYEE" ? { employeeId: actor.id } : {}) },
    include: { items: { include: { product: true } }, payments: true, customer: true, employee: true, credit: true },
  });
  if (!sale) {
    return null;
  }
  return {
    id: sale.id,
    saleNumber: sale.saleNumber,
    createdAt: sale.createdAt,
    employee: sale.employee.name,
    customer: sale.customer?.name ?? "Walk-in",
    customerPhone: sale.customer?.phone ?? null,
    total: price(sale.total),
    subtotal: price(sale.subtotal),
    amountPaid: price(sale.amountPaid),
    balance: price(sale.balance),
    method: sale.paymentMethod,
    status: sale.paymentStatus,
    notes: sale.notes,
    items: sale.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: price(item.unitPrice),
      subtotal: price(item.subtotal),
      ...(actor.role === "OWNER" ? { cost: price(item.costPriceSnapshot) } : {}),
    })),
    payments: sale.payments.map((payment) => ({
      method: payment.method,
      amount: price(payment.amount),
      reference: payment.reference,
      createdAt: payment.createdAt,
    })),
  };
}
