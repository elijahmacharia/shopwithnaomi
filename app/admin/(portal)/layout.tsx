import { unstable_rethrow } from "next/navigation";
import { DatabaseSetup } from "@/components/database-setup";
import { PortalFrame } from "@/components/portal-frame";
import type { PortalLink } from "@/components/portal-shell";
import { requirePage } from "@/lib/auth";
import { databaseProblem } from "@/lib/database-problem";
import { prisma } from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let owner;
  try {
    owner = await requirePage("OWNER", "/admin/login");
  } catch (error) {
    unstable_rethrow(error);
    const problem = databaseProblem(error);
    if (problem) {
      return <DatabaseSetup problem={problem} />;
    }
    throw error;
  }
  const [pendingDamage, pendingPrices, unread] = await Promise.all([
    prisma.damageReport.count({ where: { status: "PENDING" } }),
    prisma.priceChangeRequest.count({ where: { status: "PENDING" } }),
    prisma.notification.count({ where: { userId: owner.id, isRead: false } }),
  ]);
  const links: PortalLink[] = [
    { href: "/admin/dashboard", label: "Dashboard", group: "Overview" },
    { href: "/admin/sales", label: "Sales", group: "Overview" },
    { href: "/admin/customers", label: "Customers", group: "Overview" },
    { href: "/admin/credit", label: "Credit", group: "Overview" },
    { href: "/admin/products", label: "Products", group: "Products" },
    { href: "/admin/inventory", label: "Inventory", group: "Products" },
    { href: "/admin/stock-take", label: "Stock takes", group: "Products" },
    { href: "/admin/approvals", label: "Approvals", group: "Products", badge: pendingDamage + pendingPrices },
    { href: "/admin/orders", label: "Online orders", group: "Online" },
    { href: "/admin/deliveries", label: "Deliveries", group: "Online" },
    { href: "/admin/expenses", label: "Expenses", group: "Finance" },
    { href: "/admin/profit-loss", label: "Profit & loss", group: "Finance" },
    { href: "/admin/reports", label: "Reports", group: "Finance" },
    { href: "/admin/employees", label: "Employees", group: "Management" },
    { href: "/admin/activity", label: "Activity log", group: "Management" },
    { href: "/admin/notifications", label: "Alerts", group: "Management", badge: unread },
    { href: "/admin/settings", label: "Settings", group: "Management" },
    { href: "/admin/profile", label: "Profile", group: "Management" },
  ];
  return (
    <PortalFrame title="Owner office" role="Owner" userName={owner.name} unread={unread} alertsHref="/admin/notifications" links={links}>
      {children}
    </PortalFrame>
  );
}
