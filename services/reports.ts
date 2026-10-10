import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { centsToDecimalString, decimalToCents } from "@/lib/domain/money";
import { grossProfitCents, netProfitCents } from "@/lib/domain/profit";
import { buildSalesSeries, dateKeysEnding, nairobiDateKey, nairobiDayStart } from "@/lib/domain/sales-series";

function range(from?: string, to?: string) {
  const end = to ? new Date(to) : new Date();
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    end.setHours(23, 59, 59, 999);
  }
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Choose a valid date range.");
  }
  return { start, end };
}

export function reportWindow(query: { preset?: string; from?: string; to?: string }) {
  if (query.preset === "today" || query.preset === "week" || query.preset === "month") {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if (query.preset === "week") {
      const day = start.getDay();
      start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    }
    if (query.preset === "month") {
      start.setDate(1);
    }
    return { start, end };
  }
  return range(query.from, query.to);
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

export async function profitReport(query: { from?: string; to?: string; preset?: string }) {
  await requireUser(["OWNER"], "profit");
  const { start, end } = reportWindow(query);
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
  const dayKeys = dateKeysEnding(nairobiDateKey(new Date()), days);
  const start = nairobiDayStart(dayKeys[0]);
  const rows = await prisma.$queryRaw<Array<{ day: string; revenue: string }>>(Prisma.sql`
    SELECT to_char(("createdAt" AT TIME ZONE 'Africa/Nairobi')::date, 'YYYY-MM-DD') AS day,
           COALESCE(SUM("total"), 0)::text AS revenue
    FROM "Sale"
    WHERE "createdAt" >= ${start}
    GROUP BY 1
    ORDER BY 1
  `);
  return buildSalesSeries(
    rows.map((row) => ({ day: row.day, revenueCents: decimalToCents(row.revenue) })),
    dayKeys,
  );
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

export async function shopReports(query: { preset?: string; from?: string; to?: string }) {
  await requireUser(["OWNER"], "reports");
  const { start, end } = reportWindow(query);
  const created = { gte: start, lte: end };
  const [profit, payments, credit, damage, prices, orders, low, discrepancies, staff] = await Promise.all([
    totals(start, end),
    prisma.payment.groupBy({ by: ["method"], where: { createdAt: created }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.creditRecord.aggregate({ _sum: { balance: true }, _count: { _all: true }, where: { status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] } } }),
    prisma.damageReport.groupBy({ by: ["status"], where: { createdAt: created }, _count: { _all: true } }),
    prisma.priceChangeRequest.count({ where: { createdAt: created } }),
    prisma.order.groupBy({ by: ["status"], where: { createdAt: created }, _count: { _all: true } }),
    prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS count FROM "Product"
      WHERE "archivedAt" IS NULL AND "stockQuantity" <= "minimumStock"
    `),
    prisma.stockTakeItem.count({ where: { difference: { not: 0 }, stockTake: { createdAt: created } } }),
    prisma.sale.groupBy({ by: ["employeeId"], where: { createdAt: created }, _count: { _all: true }, _sum: { total: true } }),
  ]);
  const people = await prisma.user.findMany({ where: { id: { in: staff.map((row) => row.employeeId) } } });
  const names = new Map(people.map((person) => [person.id, person.name]));
  return {
    from: start,
    to: end,
    revenue: centsToDecimalString(profit.revenue),
    cogs: centsToDecimalString(profit.cogs),
    expenses: centsToDecimalString(profit.expenses),
    gross: centsToDecimalString(profit.gross),
    net: centsToDecimalString(profit.net),
    transactions: profit.transactions,
    payments: payments.map((row) => ({
      method: row.method,
      count: row._count._all,
      amount: centsToDecimalString(row._sum.amount ? decimalToCents(row._sum.amount) : 0),
    })),
    creditBalance: centsToDecimalString(credit._sum.balance ? decimalToCents(credit._sum.balance) : 0),
    openCredit: credit._count._all,
    damage: damage.map((row) => ({ status: row.status, count: row._count._all })),
    priceChanges: prices,
    orders: orders.map((row) => ({ status: row.status, count: row._count._all })),
    lowStock: low[0]?.count ?? 0,
    discrepancies: discrepancies,
    employees: staff.map((row) => ({
      name: names.get(row.employeeId) ?? "Employee",
      sales: row._count._all,
      total: centsToDecimalString(row._sum.total ? decimalToCents(row._sum.total) : 0),
    })),
  };
}
