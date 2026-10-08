import { Prisma, type OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { centsToDecimalString, decimalToCents, formatKsh, parseMoneyToCents } from "@/lib/domain/money";
import { buildOrderMessage, whatsappUrl } from "@/lib/domain/whatsapp";
import { getPage } from "@/lib/pagination";
import { z } from "zod";
import { changeStock, money, nextNumber, notifyOwners, runTransaction, upsertCustomer, writeAudit } from "./common";
import { getSettings, getWhatsappNumber } from "./settings";

const checkoutSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1, "Your cart is empty."),
  fullName: z.string().trim().min(2, "Enter your full name."),
  phone: z.string().trim().min(8, "Enter your phone number."),
  whatsappPhone: z.string().trim().min(8, "Enter your WhatsApp number."),
  email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  address: z.string().trim().max(200).optional(),
  landmark: z.string().trim().max(160).optional(),
  deliveryMethod: z.enum(["PICKUP", "DELIVERY"]),
  notes: z.string().trim().max(400).optional(),
  clientRequestId: z.string().uuid(),
});

export async function createGuestOrder(input: unknown) {
  const data = checkoutSchema.parse(input);
  if (data.deliveryMethod === "DELIVERY" && !data.address) {
    throw new AppError("Enter the delivery address.");
  }
  const existing = await prisma.order.findUnique({ where: { clientRequestId: data.clientRequestId } });
  if (existing) {
    return presentOrder(existing.id);
  }
  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((item) => item.productId) }, archivedAt: null, isActive: true },
  });
  const byId = new Map(products.map((product) => [product.id, product]));
  let total = 0;
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
    total += subtotal;
    return { product, quantity: item.quantity, unit, subtotal };
  });
  const order = await runTransaction(async (tx) => {
    const customer = await upsertCustomer(tx, {
      name: data.fullName,
      phone: data.phone,
      whatsappPhone: data.whatsappPhone,
      email: data.email || undefined,
      address: data.address,
      landmark: data.landmark,
    });
    const orderNumber = await nextNumber(tx, "order", "O");
    const created = await tx.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        subtotal: money(total),
        total: money(total),
        deliveryMethod: data.deliveryMethod,
        deliveryAddress: data.address || null,
        landmark: data.landmark || null,
        notes: data.notes || null,
        clientRequestId: data.clientRequestId,
        status: "NEW",
        paymentStatus: "UNPAID",
      },
    });
    for (const line of lines) {
      await changeStock(tx, {
        productId: line.product.id,
        productName: line.product.name,
        delta: -line.quantity,
        movementType: "SALE",
        reason: `Online order ${orderNumber}`,
        referenceId: created.id,
      });
      await tx.orderItem.create({
        data: {
          orderId: created.id,
          productId: line.product.id,
          quantity: line.quantity,
          unitPrice: money(line.unit),
          subtotal: money(line.subtotal),
        },
      });
    }
    await tx.delivery.create({
      data: {
        orderId: created.id,
        status: "NEW",
        address: data.address || null,
        landmark: data.landmark || null,
        notes: data.notes || null,
      },
    });
    await writeAudit(tx, {
      action: "order.created",
      entityType: "order",
      entityId: created.id,
      description: `${data.fullName} placed online order ${orderNumber}.`,
      newValue: { total: centsToDecimalString(total), deliveryMethod: data.deliveryMethod },
    });
    await notifyOwners(tx, {
      type: "order",
      title: "New online order",
      message: `${orderNumber} from ${data.fullName}`,
    });
    return created;
  });
  return presentOrder(order.id);
}

async function presentOrder(id: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id },
    include: { items: { include: { product: true } }, customer: true },
  });
  const settings = await getSettings();
  const message = buildOrderMessage({
    businessName: settings.businessName,
    customerName: order.customer.name,
    phone: order.customer.phone,
    orderNumber: order.orderNumber,
    lines: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: formatKsh(decimalToCents(item.unitPrice)),
      subtotal: formatKsh(decimalToCents(item.subtotal)),
    })),
    total: formatKsh(decimalToCents(order.total)),
    deliveryMethod: order.deliveryMethod,
    address: order.deliveryAddress ?? undefined,
    landmark: order.landmark ?? undefined,
    notes: order.notes ?? undefined,
  });
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    total: centsToDecimalString(decimalToCents(order.total)),
    whatsappUrl: whatsappUrl(await getWhatsappNumber(), message),
  };
}

const statuses = [
  "NEW",
  "CONFIRMED",
  "AWAITING_PAYMENT",
  "PACKING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export async function listOrders(query: { page?: string; q?: string; status?: string }) {
  await requireUser(["OWNER"], "orders");
  const paging = getPage(query.page);
  const where: Prisma.OrderWhereInput = {
    ...(query.status ? { status: query.status as OrderStatus } : {}),
    ...(query.q
      ? {
          OR: [
            { orderNumber: { contains: query.q, mode: "insensitive" } },
            { customer: { name: { contains: query.q, mode: "insensitive" } } },
            { customer: { phone: { contains: query.q } } },
          ],
        }
      : {}),
  };
  const [total, rows] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip: paging.skip,
      take: paging.take,
    }),
  ]);
  return {
    ...paging,
    total,
    orders: rows.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.customer.name,
      phone: order.customer.phone,
      status: order.status,
      total: centsToDecimalString(decimalToCents(order.total)),
      createdAt: order.createdAt,
      deliveryMethod: order.deliveryMethod,
      address: order.deliveryAddress,
      landmark: order.landmark,
      notes: order.notes,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        subtotal: centsToDecimalString(decimalToCents(item.subtotal)),
      })),
    })),
  };
}

export async function updateOrderStatus(id: string, status: string) {
  const actor = await requireUser(["OWNER"], "orders");
  if (!statuses.includes(status as (typeof statuses)[number])) {
    throw new AppError("Choose a valid order status.");
  }
  const nextStatus = status as OrderStatus;
  await runTransaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
    if (!order) {
      throw new AppError("Order not found.");
    }
    if (order.status === nextStatus) {
      return;
    }
    if (nextStatus === "CANCELLED" && order.stockApplied) {
      for (const item of order.items) {
        await changeStock(tx, {
          productId: item.productId,
          productName: item.product.name,
          delta: item.quantity,
          movementType: "RETURN",
          userId: actor.id,
          reason: `Cancelled order ${order.orderNumber}`,
          referenceId: order.id,
        });
      }
    }
    if (order.status === "CANCELLED" && nextStatus !== "CANCELLED") {
      throw new AppError("A cancelled order stays cancelled. Create a new order instead.");
    }
    await tx.order.update({
      where: { id },
      data: { status: nextStatus, stockApplied: nextStatus === "CANCELLED" ? false : order.stockApplied },
    });
    await tx.delivery.update({ where: { orderId: id }, data: { status: nextStatus } });
    await writeAudit(tx, {
      userId: actor.id,
      action: "order.status",
      entityType: "order",
      entityId: id,
      description: `Owner moved ${order.orderNumber} to ${nextStatus}.`,
      oldValue: { status: order.status },
      newValue: { status: nextStatus },
    });
  });
}

export async function orderSummary() {
  await requireUser(["OWNER"], "orders");
  const grouped = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
  return Object.fromEntries(grouped.map((row) => [row.status, row._count._all]));
}

export function parseCheckoutMoney(value: string) {
  return parseMoneyToCents(value);
}
