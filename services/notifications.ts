import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function listNotifications() {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "notifications");
  const [unread, rows] = await Promise.all([
    prisma.notification.count({ where: { userId: actor.id, isRead: false } }),
    prisma.notification.findMany({ where: { userId: actor.id }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  return { unread, notifications: rows };
}

export async function markNotificationRead(id: string) {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "notifications");
  await prisma.notification.updateMany({ where: { id, userId: actor.id }, data: { isRead: true } });
}

export async function markAllRead() {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "notifications");
  await prisma.notification.updateMany({ where: { userId: actor.id, isRead: false }, data: { isRead: true } });
}

export async function submitContact(input: { name: string; phone: string; message: string }) {
  const owners = await prisma.user.findMany({ where: { status: "ACTIVE", role: { name: "OWNER" } }, select: { id: true } });
  if (owners.length === 0) {
    return;
  }
  await prisma.notification.createMany({
    data: owners.map((owner) => ({
      userId: owner.id,
      type: "contact",
      title: "New contact message",
      message: `${input.name} (${input.phone}): ${input.message}`,
    })),
  });
}
