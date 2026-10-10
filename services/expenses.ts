import { type ExpenseCategory } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { centsToDecimalString, decimalToCents, parseMoneyToCents } from "@/lib/domain/money";
import { getPage } from "@/lib/pagination";
import { optionalText } from "@/lib/domain/optional-text";
import { z } from "zod";
import { money, writeAudit } from "./common";

const expenseSchema = z.object({
  category: z.enum(["TRANSPORT", "DELIVERY", "ELECTRICITY", "PACKAGING", "REPAIRS", "OTHER"]),
  description: z.string().trim().min(2, "Enter a description.").max(160),
  amount: z.string().trim().min(1, "Enter an amount."),
  date: z.string().min(1, "Choose a date."),
  notes: optionalText(300),
});

function mapExpense(row: {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: { toFixed: (digits: number) => string };
  date: Date;
  notes: string | null;
  user: { name: string };
}) {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    amount: centsToDecimalString(decimalToCents(row.amount)),
    date: row.date,
    notes: row.notes,
    createdBy: row.user.name,
  };
}

export async function listExpenses(query: { page?: string }) {
  await requireUser(["OWNER"], "expenses");
  const paging = getPage(query.page);
  const where = { archivedAt: null };
  const [total, rows] = await prisma.$transaction([
    prisma.expense.count({ where }),
    prisma.expense.findMany({ where, include: { user: true }, orderBy: { date: "desc" }, skip: paging.skip, take: paging.take }),
  ]);
  return { ...paging, total, expenses: rows.map(mapExpense) };
}

export async function createExpense(input: unknown) {
  const actor = await requireUser(["OWNER"], "expenses");
  const data = expenseSchema.parse(input);
  const expense = await prisma.expense.create({
    data: {
      category: data.category,
      description: data.description,
      amount: money(parseMoneyToCents(data.amount)),
      date: new Date(data.date),
      notes: data.notes || null,
      createdBy: actor.id,
    },
  });
  await writeAudit(prisma, {
    userId: actor.id,
    action: "expense.created",
    entityType: "expense",
    entityId: expense.id,
    description: `Owner recorded ${data.description}.`,
    newValue: { amount: data.amount, category: data.category },
  });
  return expense.id;
}

export async function updateExpense(id: string, input: unknown) {
  const actor = await requireUser(["OWNER"], "expenses");
  const data = expenseSchema.parse(input);
  const current = await prisma.expense.findUnique({ where: { id } });
  if (!current || current.archivedAt) {
    throw new AppError("Expense not found.");
  }
  await prisma.expense.update({
    where: { id },
    data: {
      category: data.category,
      description: data.description,
      amount: money(parseMoneyToCents(data.amount)),
      date: new Date(data.date),
      notes: data.notes || null,
    },
  });
  await writeAudit(prisma, {
    userId: actor.id,
    action: "expense.updated",
    entityType: "expense",
    entityId: id,
    description: `Owner updated ${data.description}.`,
    oldValue: { amount: centsToDecimalString(decimalToCents(current.amount)) },
    newValue: { amount: data.amount },
  });
}

export async function archiveExpense(id: string) {
  const actor = await requireUser(["OWNER"], "expenses");
  await prisma.expense.update({ where: { id }, data: { archivedAt: new Date() } });
  await writeAudit(prisma, {
    userId: actor.id,
    action: "expense.archived",
    entityType: "expense",
    entityId: id,
    description: "Owner archived an expense.",
  });
}
