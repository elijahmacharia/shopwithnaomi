import { unstable_rethrow } from "next/navigation";
import { DatabaseSetup } from "@/components/database-setup";
import { PortalFrame } from "@/components/portal-frame";
import type { PortalLink } from "@/components/portal-shell";
import { requirePage } from "@/lib/auth";
import { databaseProblem } from "@/lib/database-problem";
import { prisma } from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requirePage("OWNER", "/admin/login");
  } catch (error) {
    unstable_rethrow(error);
    const problem = databaseProblem(error);
    if (problem) {
      return <DatabaseSetup problem={problem} />;
    }
    throw error;
  }
  const pendingDamage = await prisma.damageReport.count({ where: { status: "PENDING" } });
  const links: PortalLink[] = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/sales", label: "Sales" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/inventory", label: "Stock" },
    { href: "/admin/stock-take", label: "Stock take" },
    { href: "/admin/credit", label: "Credit" },
    { href: "/admin/customers", label: "Customers" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/deliveries", label: "Deliveries" },
    { href: "/admin/profit-loss", label: "Profit & loss" },
    { href: "/admin/expenses", label: "Expenses" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/approvals", label: "Shopkeeper reports", badge: pendingDamage },
    { href: "/admin/activity", label: "Activity" },
    { href: "/admin/notifications", label: "Alerts" },
    { href: "/admin/employees", label: "Shopkeepers" },
    { href: "/admin/settings", label: "Settings" },
  ];
  return (
    <PortalFrame title="Owner office" role="Owner" links={links}>
      {children}
    </PortalFrame>
  );
}
