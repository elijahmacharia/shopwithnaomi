import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getPage } from "@/lib/pagination";

export async function listActivity(query: { page?: string }) {
  await requireUser(["OWNER"], "activity");
  const paging = getPage(query.page);
  const [total, rows] = await prisma.$transaction([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      skip: paging.skip,
      take: paging.take,
    }),
  ]);
  return {
    ...paging,
    total,
    logs: rows.map((row) => ({
      id: row.id,
      action: row.action,
      description: row.description,
      entityType: row.entityType,
      by: row.user?.name ?? "Customer",
      createdAt: row.createdAt,
    })),
  };
}
