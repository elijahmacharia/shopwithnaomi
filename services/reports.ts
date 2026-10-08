import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { centsToDecimalString, decimalToCents } from "@/lib/domain/money";
import { grossProfitCents, netProfitCents } from "@/lib/domain/profit";

function range(from?: string, to?: string) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Choose a valid date range.");
  }
  return { start, end };
}

async function totals(start: Date, end: Date) {
  const [sales, expenses, cogsRows] = await Promise.all([
    prisma.sale.aggregate({ _sum: { total: true }, _count: { _all: true }, where: { createdAt: { gte: start, lte: end } } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { archivedAt: null, date: { gte: start, lte: end } } }),
    prisma.$queryRaw<Array<{ cogs: string | null }>>(Prisma.sql`
      SELECT COALESCE(SUM(si."costPriceSnapshot" * si.quantity), 0)::text AS cogs
      FROM "SaleItem" si
      JOIN "Sale" s ON s.id = si."saleId"
      WHERE s."createdAt" >= ${start} AND s."createdAt" <= ${end}
    `),
  ]);
  const revenue = sales._sum.total ? decimalToCents(sales._sum.total) : 0;
  const cogs = decimalToCents(cogsRows[0]?.cogs ?? "0");
  const expense = expenses._sum.amount ? decimalToCents(expenses._sum.amount) : 0;
  return {
    revenue,
    cogs,
    expenses: expense,
    gross: grossProfitCents(revenue, cogs),
    net: netProfitCents({ revenueCents: revenue, cogsCents: cogs, expenseCents: expense }),
    transactions: sales._count._all,
  };
}

export async function profitReport(query: { from?: string; to?: string }) {
  await requireUser(["OWNER"], "profit");
  const { start, end } = range(query.from, query.to);
  const result = await totals(start, end);
  return {
    from: start,
    to: end,
    revenue: centsToDecimalString(result.revenue),
    cogs: centsToDecimalString(result.cogs),
    expenses: centsToDecimalString(result.expenses),
    gross: centsToDecimalString(result.gross),
    net: centsToDecimalString(result.net),
    transactions: result.transactions,
  };
}

export async function salesSeries(days = 14) {
  await requireUser(["OWNER"], "owner-dashboard");
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const rows = await prisma.$queryRaw<Array<{ day: Date; revenue: string; transactions: number }>>(Prisma.sql`
    SELECT date_trunc('day', "createdAt") AS day,
           COALESCE(SUM("total"), 0)::text AS revenue,
           COUNT(*)::int AS transactions
    FROM "Sale"
    WHERE "createdAt" >= ${start}
    GROUP BY 1
    ORDER BY 1
  `);
  return rows.map((row) => ({
    day: new Date(row.day).toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
    revenue: decimalToCents(row.revenue) / 100,
    transactions: row.transactions,
  }));
}

export async function dashboardStats() {
  const actor = await requireUser(["OWNER"], "owner-dashboard");
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [today, month, credit, pendingPrices, pendingDamage, newOrders] = await Promise.all([
    totals(startToday, now),
    totals(startMonth, now),
    prisma.creditRecord.aggregate({ _sum: { balance: true }, where: { status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] } } }),
    prisma.priceChangeRequest.count({ where: { status: "PENDING" } }),
    prisma.damageReport.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "NEW" } }),
  ]);
  const low = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
    SELECT COUNT(*)::int AS count FROM "Product"
    WHERE "archivedAt" IS NULL AND "stockQuantity" <= "minimumStock"
  `);
  const activity = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { user: true },
  });
  return {
    actor,
    todaySales: centsToDecimalString(today.revenue),
    monthSales: centsToDecimalString(month.revenue),
    gross: centsToDecimalString(month.gross),
    net: centsToDecimalString(month.net),
    credit: centsToDecimalString(credit._sum.balance ? decimalToCents(credit._sum.balance) : 0),
    lowStock: low[0]?.count ?? 0,
    pendingPrices,
    pendingDamage,
    newOrders,
    activity: activity.map((row) => ({
      id: row.id,
      description: row.description,
      at: row.createdAt,
      by: row.user?.name ?? "Customer",
    })),
  };
}

export async function employeeDashboard() {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "employee-dashboard");
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const where = { employeeId: actor.id, createdAt: { gte: start } };
  const [sales, credit, low] = await Promise.all([
    prisma.sale.aggregate({ _sum: { total: true }, _count: { _all: true }, where }),
    prisma.creditRecord.count({ where: { sale: { employeeId: actor.id }, status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] } } }),
    prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS count FROM "Product"
      WHERE "archivedAt" IS NULL AND "isActive" = true AND "stockQuantity" <= "minimumStock"
    `),
  ]);
  const recent = await prisma.sale.findMany({
    where: { employeeId: actor.id },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { customer: true },
  });
  return {
    name: actor.name,
    todaySales: centsToDecimalString(sales._sum.total ? decimalToCents(sales._sum.total) : 0),
    transactions: sales._count._all,
    credit,
    lowStock: low[0]?.count ?? 0,
    recent: recent.map((sale) => ({
      id: sale.id,
      saleNumber: sale.saleNumber,
      total: centsToDecimalString(decimalToCents(sale.total)),
      customer: sale.customer?.name ?? "Walk-in",
      createdAt: sale.createdAt,
    })),
  };
}
