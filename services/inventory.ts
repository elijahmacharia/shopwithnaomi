import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { centsToDecimalString, decimalToCents } from "@/lib/domain/money";
import { isLowStock } from "@/lib/domain/stock";
import { getPage } from "@/lib/pagination";
import { optionalText } from "@/lib/domain/optional-text";
import { z } from "zod";
import { changeStock, runTransaction, writeAudit } from "./common";

export async function listInventory(query: { q?: string; page?: string }) {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "inventory");
  const paging = getPage(query.page);
  const where = {
    archivedAt: null,
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" as const } },
            { sku: { contains: query.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, include: { category: true }, orderBy: { name: "asc" }, skip: paging.skip, take: paging.take }),
  ]);
  return {
    ...paging,
    total,
    products: rows.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category.name,
      stockQuantity: product.stockQuantity,
      minimumStock: product.minimumStock,
      low: isLowStock(product.stockQuantity, product.minimumStock),
      out: product.stockQuantity === 0,
      ...(actor.role === "OWNER" ? { costPrice: centsToDecimalString(decimalToCents(product.costPrice)) } : {}),
    })),
  };
}

const adjustmentSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().refine((value) => value !== 0, "Enter a quantity to add or remove."),
  reason: z.string().trim().min(3, "Enter a reason.").max(200),
});

export async function adjustStock(input: unknown) {
  const actor = await requireUser(["OWNER"], "inventory");
  const data = adjustmentSchema.parse(input);
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || product.archivedAt) {
    throw new AppError("Product not found.");
  }
  await runTransaction(async (tx) => {
    await changeStock(tx, {
      productId: product.id,
      productName: product.name,
      delta: data.quantity,
      movementType: data.quantity > 0 ? "STOCK_ADDITION" : "MANUAL_ADJUSTMENT",
      userId: actor.id,
      reason: data.reason,
    });
    await writeAudit(tx, {
      userId: actor.id,
      action: "stock.adjusted",
      entityType: "product",
      entityId: product.id,
      description: `Owner adjusted ${product.name} by ${data.quantity}.`,
      newValue: { quantity: data.quantity, reason: data.reason },
    });
    if (product.stockQuantity + data.quantity <= product.minimumStock) {
      const { notifyOwners } = await import("./common");
      await notifyOwners(tx, {
        type: "low-stock",
        title: "Low stock",
        message: `${product.name} is at or below its minimum.`,
      });
    }
  });
}

const stockTakeSchema = z.object({
  notes: optionalText(300),
  items: z.array(
    z.object({
      productId: z.string(),
      physicalQuantity: z.number().int().min(0),
      reason: optionalText(160),
    }),
  ),
});

export async function confirmStockTake(input: unknown) {
  const actor = await requireUser(["OWNER"], "stock-take");
  const data = stockTakeSchema.parse(input);
  await runTransaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: data.items.map((item) => item.productId) }, archivedAt: null },
    });
    const byId = new Map(products.map((product) => [product.id, product]));
    const take = await tx.stockTake.create({
      data: { createdBy: actor.id, status: "APPROVED", notes: data.notes || null, completedAt: new Date() },
    });
    for (const item of data.items) {
      const product = byId.get(item.productId);
      if (!product) {
        continue;
      }
      const difference = item.physicalQuantity - product.stockQuantity;
      await tx.stockTakeItem.create({
        data: {
          stockTakeId: take.id,
          productId: product.id,
          systemQuantity: product.stockQuantity,
          physicalQuantity: item.physicalQuantity,
          difference,
          reason: item.reason || null,
        },
      });
      if (difference !== 0) {
        await changeStock(tx, {
          productId: product.id,
          productName: product.name,
          delta: difference,
          movementType: "STOCK_TAKE",
          userId: actor.id,
          reason: item.reason || "Stock take",
          referenceId: take.id,
        });
      }
    }
    await writeAudit(tx, {
      userId: actor.id,
      action: "stocktake.confirmed",
      entityType: "stockTake",
      entityId: take.id,
      description: "Owner confirmed a stock take.",
    });
  });
}

export async function listStockForTake() {
  await requireUser(["OWNER"], "stock-take");
  return prisma.product.findMany({
    where: { archivedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, sku: true, stockQuantity: true },
  });
}

export async function listMovements(query: { page?: string }) {
  await requireUser(["OWNER"], "inventory");
  const paging = getPage(query.page);
  const [total, rows] = await prisma.$transaction([
    prisma.stockMovement.count(),
    prisma.stockMovement.findMany({
      include: { product: true, user: true },
      orderBy: { createdAt: "desc" },
      skip: paging.skip,
      take: paging.take,
    }),
  ]);
  return {
    ...paging,
    total,
    movements: rows.map((row) => ({
      id: row.id,
      product: row.product.name,
      type: row.movementType,
      quantity: row.quantity,
      before: row.quantityBefore,
      after: row.quantityAfter,
      reason: row.reason,
      by: row.user?.name ?? "Online order",
      createdAt: row.createdAt,
    })),
  };
}
