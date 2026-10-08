import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { decimalToCents, centsToDecimalString, marginPercent, profitPerUnitCents } from "@/lib/domain/money";
import { slugify } from "@/lib/domain/slug";
import { getPage } from "@/lib/pagination";
import { z } from "zod";
import { changeStock, money, writeAudit } from "./common";

const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(120),
  sku: z.string().trim().min(2, "Enter a SKU.").max(40),
  categoryId: z.string().min(1, "Choose a category."),
  description: z.string().trim().min(3, "Enter a description.").max(1000),
  imageUrl: z.string().trim().max(300).optional(),
  costPrice: z.string().trim().min(1, "Enter the cost price."),
  sellingPrice: z.string().trim().min(1, "Enter the selling price."),
  minimumStock: z.coerce.number().int().min(0),
  stockQuantity: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

function priceString(value: Prisma.Decimal) {
  return centsToDecimalString(decimalToCents(value));
}

function uniqueMessage(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new AppError("A product with this SKU or name already exists.");
  }
  throw error;
}

export async function listCategories() {
  return prisma.category.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } });
}

export async function listPublicProducts(query: { q?: string; category?: string; page?: string }) {
  const paging = getPage(query.page, 12);
  const where: Prisma.ProductWhereInput = {
    archivedAt: null,
    isActive: true,
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { sku: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
      skip: paging.skip,
      take: paging.take,
    }),
  ]);
  return {
    ...paging,
    total,
    products: rows.map(toPublicProduct),
  };
}

export async function getPublicProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, archivedAt: null, isActive: true },
    include: { category: true },
  });
  return product ? toPublicProduct(product) : null;
}

export async function getPublicProductsByIds(ids: string[]) {
  const rows = await prisma.product.findMany({
    where: { id: { in: ids }, archivedAt: null, isActive: true },
    include: { category: true },
  });
  return rows.map(toPublicProduct);
}

export function toPublicProduct(product: {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  imageUrl: string | null;
  sellingPrice: Prisma.Decimal;
  stockQuantity: number;
  category: { name: string; slug: string };
}) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    imageUrl: product.imageUrl,
    sellingPrice: priceString(product.sellingPrice),
    stockQuantity: product.stockQuantity,
    inStock: product.stockQuantity > 0,
    category: product.category,
  };
}

export async function listOwnerProducts(query: { q?: string; page?: string }) {
  await requireUser(["OWNER"], "products");
  const paging = getPage(query.page);
  const where: Prisma.ProductWhereInput = {
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { sku: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ archivedAt: "asc" }, { name: "asc" }],
      skip: paging.skip,
      take: paging.take,
    }),
  ]);
  return {
    ...paging,
    total,
    products: rows.map((product) => ({
      ...toPublicProduct(product),
      costPrice: priceString(product.costPrice),
      profit: centsToDecimalString(profitPerUnitCents(decimalToCents(product.sellingPrice), decimalToCents(product.costPrice))),
      margin: marginPercent(decimalToCents(product.sellingPrice), decimalToCents(product.costPrice)),
      minimumStock: product.minimumStock,
      isActive: product.isActive,
      archived: Boolean(product.archivedAt),
      belowCost: decimalToCents(product.sellingPrice) < decimalToCents(product.costPrice),
    })),
  };
}

export async function getOwnerProduct(id: string) {
  await requireUser(["OWNER"], "products");
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      priceHistory: { orderBy: { createdAt: "desc" }, take: 20, include: { user: true } },
      movements: { orderBy: { createdAt: "desc" }, take: 20, include: { user: true } },
      saleItems: { orderBy: { sale: { createdAt: "desc" } }, take: 20, include: { sale: true } },
    },
  });
  if (!product) {
    return null;
  }
  return {
    ...toPublicProduct(product),
    categoryId: product.categoryId,
    costPrice: priceString(product.costPrice),
    minimumStock: product.minimumStock,
    isActive: product.isActive,
    archived: Boolean(product.archivedAt),
    profit: centsToDecimalString(profitPerUnitCents(decimalToCents(product.sellingPrice), decimalToCents(product.costPrice))),
    margin: marginPercent(decimalToCents(product.sellingPrice), decimalToCents(product.costPrice)),
    belowCost: decimalToCents(product.sellingPrice) < decimalToCents(product.costPrice),
    priceHistory: product.priceHistory.map((row) => ({
      id: row.id,
      oldPrice: priceString(row.oldPrice),
      newPrice: priceString(row.newPrice),
      reason: row.reason,
      by: row.user.name,
      createdAt: row.createdAt,
    })),
    movements: product.movements.map((row) => ({
      id: row.id,
      type: row.movementType,
      quantity: row.quantity,
      before: row.quantityBefore,
      after: row.quantityAfter,
      reason: row.reason,
      by: row.user?.name ?? "System",
      createdAt: row.createdAt,
    })),
    sales: product.saleItems.map((row) => ({
      id: row.id,
      saleNumber: row.sale.saleNumber,
      quantity: row.quantity,
      subtotal: priceString(row.subtotal),
      createdAt: row.sale.createdAt,
    })),
  };
}

async function uniqueSlug(db: PrismaClient | TxClient, name: string, ignoreId?: string) {
  const base = slugify(name);
  for (let index = 0; index < 20; index += 1) {
    const slug = index === 0 ? base : `${base}-${index + 1}`;
    const existing = await db.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) {
      return slug;
    }
  }
  return `${base}-${Date.now()}`;
}

type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export async function createProduct(input: unknown) {
  const actor = await requireUser(["OWNER"], "products");
  const data = productSchema.parse(input);
  const cost = decimalToCents(new Prisma.Decimal(data.costPrice));
  const selling = decimalToCents(new Prisma.Decimal(data.sellingPrice));
  const stock = data.stockQuantity ?? 0;
  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: data.name,
          slug: await uniqueSlug(tx, data.name),
          sku: data.sku.toUpperCase(),
          categoryId: data.categoryId,
          description: data.description,
          imageUrl: data.imageUrl || null,
          costPrice: money(cost),
          sellingPrice: money(selling),
          minimumStock: data.minimumStock,
          stockQuantity: 0,
          isActive: data.isActive ?? true,
        },
      });
      if (stock > 0) {
        await changeStock(tx, {
          productId: created.id,
          productName: created.name,
          delta: stock,
          movementType: "STOCK_ADDITION",
          userId: actor.id,
          reason: "Opening stock",
        });
      }
      await writeAudit(tx, {
        userId: actor.id,
        action: "product.created",
        entityType: "product",
        entityId: created.id,
        description: `Owner added ${created.name}.`,
        newValue: { sku: created.sku, sellingPrice: centsToDecimalString(selling) },
      });
      return created;
    });
    return { id: product.id, warning: selling < cost ? "Selling price is below cost." : undefined };
  } catch (error) {
    uniqueMessage(error);
  }
}

export async function updateProduct(id: string, input: unknown) {
  const actor = await requireUser(["OWNER"], "products");
  const data = productSchema.omit({ stockQuantity: true }).parse(input);
  const cost = decimalToCents(new Prisma.Decimal(data.costPrice));
  const selling = decimalToCents(new Prisma.Decimal(data.sellingPrice));
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current || current.archivedAt) {
    throw new AppError("This product is not available to edit.");
  }
  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: current.name === data.name ? current.slug : await uniqueSlug(tx, data.name, id),
          sku: data.sku.toUpperCase(),
          categoryId: data.categoryId,
          description: data.description,
          imageUrl: data.imageUrl || null,
          costPrice: money(cost),
          sellingPrice: money(selling),
          minimumStock: data.minimumStock,
          isActive: data.isActive ?? current.isActive,
        },
      });
      if (!current.sellingPrice.equals(updated.sellingPrice)) {
        await tx.productPriceHistory.create({
          data: {
            productId: id,
            oldPrice: current.sellingPrice,
            newPrice: updated.sellingPrice,
            changedBy: actor.id,
            reason: "Owner updated the selling price.",
          },
        });
      }
      await writeAudit(tx, {
        userId: actor.id,
        action: "product.updated",
        entityType: "product",
        entityId: id,
        description: `Owner updated ${updated.name}.`,
        oldValue: { sellingPrice: priceString(current.sellingPrice), costPrice: priceString(current.costPrice) },
        newValue: { sellingPrice: centsToDecimalString(selling), costPrice: centsToDecimalString(cost) },
      });
    });
  } catch (error) {
    uniqueMessage(error);
  }
  return { warning: selling < cost ? "Selling price is below cost." : undefined };
}

export async function archiveProduct(id: string) {
  const actor = await requireUser(["OWNER"], "products");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.archivedAt) {
    throw new AppError("This product is already archived.");
  }
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: { archivedAt: new Date(), isActive: false } });
    await writeAudit(tx, {
      userId: actor.id,
      action: "product.archived",
      entityType: "product",
      entityId: id,
      description: `Owner archived ${product.name}.`,
    });
  });
}

const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(240).optional(),
});

export async function createCategory(input: unknown) {
  const actor = await requireUser(["OWNER"], "products");
  const data = categorySchema.parse(input);
  const category = await prisma.category.create({
    data: { name: data.name, slug: slugify(data.name), description: data.description || null },
  });
  await writeAudit(prisma, {
    userId: actor.id,
    action: "category.created",
    entityType: "category",
    entityId: category.id,
    description: `Owner added the ${category.name} category.`,
  });
  return category;
}

export async function archiveCategory(id: string) {
  const actor = await requireUser(["OWNER"], "products");
  const count = await prisma.product.count({ where: { categoryId: id, archivedAt: null } });
  if (count > 0) {
    throw new AppError("Move or archive the products in this category first.");
  }
  await prisma.category.update({ where: { id }, data: { status: "ARCHIVED" } });
  await writeAudit(prisma, {
    userId: actor.id,
    action: "category.archived",
    entityType: "category",
    entityId: id,
    description: "Owner archived a category.",
  });
}
