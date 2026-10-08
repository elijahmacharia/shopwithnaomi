import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { centsToDecimalString, decimalToCents } from "@/lib/domain/money";
import { getPage } from "@/lib/pagination";
import { z } from "zod";
import { upsertCustomer, writeAudit } from "./common";

export async function listCustomers(query: { q?: string; page?: string }) {
  await requireUser(["OWNER"], "customers");
  const paging = getPage(query.page);
  const where = query.q
    ? {
        OR: [
          { name: { contains: query.q, mode: "insensitive" as const } },
          { phone: { contains: query.q } },
        ],
      }
    : {};
  const [total, rows] = await prisma.$transaction([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
      skip: paging.skip,
      take: paging.take,
      include: { sales: true, credits: true, orders: true },
    }),
  ]);
  return {
    ...paging,
    total,
    customers: rows.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      purchases: customer.sales.length + customer.orders.length,
      credit: centsToDecimalString(customer.credits.reduce((sum, credit) => sum + decimalToCents(credit.balance), 0)),
      lastPurchase: [...customer.sales.map((sale) => sale.createdAt), ...customer.orders.map((order) => order.createdAt)].sort(
        (a, b) => b.getTime() - a.getTime(),
      )[0] ?? null,
    })),
  };
}

export async function getCustomer(id: string) {
  await requireUser(["OWNER"], "customers");
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: { orderBy: { createdAt: "desc" }, take: 20 },
      credits: { orderBy: { createdAt: "desc" }, include: { payments: true } },
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!customer) {
    return null;
  }
  return {
    ...customer,
    sales: customer.sales.map((sale) => ({ ...sale, total: centsToDecimalString(decimalToCents(sale.total)) })),
    orders: customer.orders.map((order) => ({ ...order, total: centsToDecimalString(decimalToCents(order.total)) })),
    credits: customer.credits.map((credit) => ({
      ...credit,
      balance: centsToDecimalString(decimalToCents(credit.balance)),
      amount: centsToDecimalString(decimalToCents(credit.amount)),
    })),
    payments: customer.payments.map((payment) => ({ ...payment, amount: centsToDecimalString(decimalToCents(payment.amount)) })),
  };
}

const customerSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(8),
  email: z.string().trim().optional(),
  address: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
});

export async function saveCustomer(input: unknown, id?: string) {
  const actor = await requireUser(["OWNER"], "customers");
  const data = customerSchema.parse(input);
  const customer = await prisma.$transaction(async (tx) => {
    if (id) {
      const current = await tx.customer.findUnique({ where: { id } });
      if (!current) {
        throw new Error("Customer not found.");
      }
      return tx.customer.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email || null,
          address: data.address || null,
          landmark: data.landmark || null,
        },
      });
    }
    return upsertCustomer(tx, data);
  });
  await writeAudit(prisma, {
    userId: actor.id,
    action: id ? "customer.updated" : "customer.created",
    entityType: "customer",
    entityId: customer.id,
    description: `Owner saved customer ${customer.name}.`,
  });
  return customer.id;
}
