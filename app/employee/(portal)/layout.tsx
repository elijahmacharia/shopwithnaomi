import { unstable_rethrow } from "next/navigation";
import { DatabaseSetup } from "@/components/database-setup";
import { PortalFrame } from "@/components/portal-frame";
import type { PortalLink } from "@/components/portal-shell";
import { requirePage } from "@/lib/auth";
import { databaseProblem } from "@/lib/database-problem";
import { prisma } from "@/lib/db";

const links: PortalLink[] = [
  { href: "/employee/dashboard", label: "Dashboard", group: "Today" },
  { href: "/employee/sales/new", label: "New sale", group: "Today" },
  { href: "/employee/sales", label: "My sales", group: "Today" },
  { href: "/employee/credit", label: "Credit", group: "Today" },
  { href: "/employee/inventory", label: "Inventory", group: "Stock" },
  { href: "/employee/damage-reports", label: "Damage reports", group: "Stock" },
  { href: "/employee/price-requests", label: "Price requests", group: "Stock" },
  { href: "/employee/notifications", label: "Alerts", group: "Account" },
  { href: "/employee/profile", label: "Profile", group: "Account" },
];

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requirePage(["EMPLOYEE", "OWNER"], "/employee/login");
  } catch (error) {
    unstable_rethrow(error);
    const problem = databaseProblem(error);
    if (problem) {
      return <DatabaseSetup problem={problem} />;
    }
    throw error;
  }
  const unread = await prisma.notification.count({ where: { userId: user.id, isRead: false } });
  return (
    <PortalFrame
      title="Shop floor"
      role="Shopkeeper"
      userName={user.name}
      unread={unread}
      alertsHref="/employee/notifications"
      links={links.map((link) => (link.href === "/employee/notifications" ? { ...link, badge: unread } : link))}
    >
      {children}
    </PortalFrame>
  );
}
