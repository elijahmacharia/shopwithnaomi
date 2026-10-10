import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { centsToDecimalString, decimalToCents, parseMoneyToCents } from "@/lib/domain/money";
import { optionalTextRule } from "@/lib/domain/optional-text";
import { z } from "zod";
import { changeStock, money, notifyUser, runTransaction, writeAudit } from "./common";

const damageSchema = z.object({
  productId: z.string().min(1, "Choose a product."),
  quantity: z.coerce.number().int().positive("Enter the damaged quantity."),
  reason: z.enum(["BROKEN", "FAULTY", "EXPIRED", "CUSTOMER_RETURN", "OTHER"]),
  description: z.string().trim().min(3, "Describe the damage.").max(500),
  photoUrl: optionalTextRule(500, (value) => !value || value.startsWith("/media/"), "Upload the picture as a file."),
});

export async function createDamageReport(input: unknown) {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "damage-report");
  const data = damageSchema.parse(input);
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || product.archivedAt) {
    throw new AppError("Product not found.");
  }
  const report = await prisma.damageReport.create({
    data: {
      productId: product.id,
      quantity: data.quantity,
      reason: data.reason,
      description: data.description,
      photoUrl: data.photoUrl || null,
      reportedBy: actor.id,
    },
  });
  await runTransaction(async (tx) => {
    await writeAudit(tx, {
      userId: actor.id,
      action: "damage.reported",
      entityType: "damage",
      entityId: report.id,
      description: `${actor.name} reported damage for ${product.name}.`,
    });
    const { notifyOwners } = await import("./common");
    await notifyOwners(tx, { type: "damage", title: "Damage report", message: `${product.name} · ${data.quantity}` });
  });
}

export async function listDamageReports(scope: "own" | "all") {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], scope === "all" ? "approvals" : "damage-report");
  const rows = await prisma.damageReport.findMany({
    where: scope === "own" && actor.role === "EMPLOYEE" ? { reportedBy: actor.id } : {},
    include: { product: true, reporter: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map((row) => ({
    id: row.id,
    product: row.product.name,
    quantity: row.quantity,
    reason: row.reason,
    description: row.description,
    photoUrl: row.photoUrl,
    status: row.status,
    by: row.reporter.name,
    stock: row.product.stockQuantity,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt,
  }));
}

export async function reviewDamage(id: string, decision: "APPROVED" | "REJECTED", note = "") {
  const actor = await requireUser(["OWNER"], "approvals");
  const reviewNote = note.trim();
  if (decision === "REJECTED" && reviewNote.length < 3) {
    throw new AppError("Enter a reason for rejecting the damage report.");
  }
  await runTransaction(async (tx) => {
    const report = await tx.damageReport.findUnique({ where: { id }, include: { product: true } });
    if (!report || report.status !== "PENDING") {
      throw new AppError("This damage report has already been reviewed.");
    }
    const updated = await tx.damageReport.updateMany({
      where: { id, status: "PENDING" },
      data: { status: decision, reviewedBy: actor.id, reviewedAt: new Date(), reviewNote: reviewNote || null },
    });
    if (updated.count !== 1) {
      throw new AppError("This damage report has already been reviewed.");
    }
    if (decision === "APPROVED") {
      await changeStock(tx, {
        productId: report.productId,
        productName: report.product.name,
        delta: -report.quantity,
        movementType: "DAMAGE",
        userId: actor.id,
        reason: report.description,
        referenceId: report.id,
      });
    }
    await writeAudit(tx, {
      userId: actor.id,
      action: decision === "APPROVED" ? "damage.approved" : "damage.rejected",
      entityType: "damage",
      entityId: id,
      description: `Owner ${decision === "APPROVED" ? "approved" : "rejected"} a damage report for ${report.product.name}.`,
    });
    await notifyUser(tx, report.reportedBy, {
      type: "damage",
      title: decision === "APPROVED" ? "Damage report approved" : "Damage report rejected",
      message: report.product.name,
    });
  });
}

const priceSchema = z.object({
  productId: z.string().min(1),
  requestedPrice: z.string().trim().min(1, "Enter the requested price."),
  reason: z.string().trim().min(3, "Enter a reason.").max(300),
});

export async function createPriceRequest(input: unknown) {
  const actor = await requireUser(["EMPLOYEE"], "price-request");
  const data = priceSchema.parse(input);
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || product.archivedAt) {
    throw new AppError("Product not found.");
  }
  const request = await prisma.priceChangeRequest.create({
    data: {
      productId: product.id,
      currentPrice: product.sellingPrice,
      requestedPrice: money(parseMoneyToCents(data.requestedPrice)),
      reason: data.reason,
      requestedBy: actor.id,
    },
  });
  await runTransaction(async (tx) => {
    await writeAudit(tx, {
      userId: actor.id,
      action: "price.requested",
      entityType: "priceRequest",
      entityId: request.id,
      description: `${actor.name} requested a new price for ${product.name}.`,
    });
    const { notifyOwners } = await import("./common");
    await notifyOwners(tx, { type: "price", title: "Price change request", message: product.name });
  });
}

export async function listPriceRequests(scope: "own" | "all") {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], scope === "all" ? "approvals" : "price-request");
  const rows = await prisma.priceChangeRequest.findMany({
    where: scope === "own" && actor.role === "EMPLOYEE" ? { requestedBy: actor.id } : {},
    include: { product: true, requester: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map((row) => ({
    id: row.id,
    product: row.product.name,
    currentPrice: centsToDecimalString(decimalToCents(row.currentPrice)),
    requestedPrice: centsToDecimalString(decimalToCents(row.requestedPrice)),
    reason: row.reason,
    status: row.status,
    reviewNote: row.reviewNote,
    by: row.requester.name,
    requestedBy: row.requestedBy,
    createdAt: row.createdAt,
  }));
}

export async function reviewPriceRequest(id: string, decision: "APPROVED" | "REJECTED", note = "") {
  const actor = await requireUser(["OWNER"], "approvals");
  const reviewNote = note.trim();
  if (decision === "REJECTED" && reviewNote.length < 3) {
    throw new AppError("Enter a reason for rejecting the price request.");
  }
  await runTransaction(async (tx) => {
    const request = await tx.priceChangeRequest.findUnique({ where: { id }, include: { product: true } });
    if (!request || request.status !== "PENDING") {
      throw new AppError("This price request has already been reviewed.");
    }
    if (request.requestedBy === actor.id) {
      throw new AppError("You cannot approve your own price request.");
    }
    const updated = await tx.priceChangeRequest.updateMany({
      where: { id, status: "PENDING" },
      data: { status: decision, reviewedBy: actor.id, reviewedAt: new Date(), reviewNote: reviewNote || null },
    });
    if (updated.count !== 1) {
      throw new AppError("This price request has already been reviewed.");
    }
    if (decision === "APPROVED") {
      await tx.product.update({ where: { id: request.productId }, data: { sellingPrice: request.requestedPrice } });
      await tx.productPriceHistory.create({
        data: {
          productId: request.productId,
          oldPrice: request.currentPrice,
          newPrice: request.requestedPrice,
          changedBy: actor.id,
          reason: request.reason,
        },
      });
    }
    await writeAudit(tx, {
      userId: actor.id,
      action: decision === "APPROVED" ? "price.approved" : "price.rejected",
      entityType: "priceRequest",
      entityId: id,
      description: `Owner ${decision === "APPROVED" ? "approved" : "rejected"} a price change for ${request.product.name}.`,
      oldValue: { price: centsToDecimalString(decimalToCents(request.currentPrice)) },
      newValue: { price: centsToDecimalString(decimalToCents(request.requestedPrice)) },
    });
    await notifyUser(tx, request.requestedBy, {
      type: "price",
      title: decision === "APPROVED" ? "Price change approved" : "Price change rejected",
      message: request.product.name,
    });
  });
}
