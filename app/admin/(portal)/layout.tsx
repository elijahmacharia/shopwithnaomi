import { unstable_rethrow } from "next/navigation";
import { DatabaseSetup } from "@/components/database-setup";
import { PortalFrame } from "@/components/portal-frame";
import { requirePage } from "@/lib/auth";
import { databaseProblem } from "@/lib/database-problem";

const links: Array<[string, string]> = [
  ["/admin/dashboard", "Dashboard"],
  ["/admin/sales", "Sales"],
  ["/admin/products", "Products"],
  ["/admin/inventory", "Stock"],
  ["/admin/stock-take", "Stock take"],
  ["/admin/credit", "Credit"],
  ["/admin/customers", "Customers"],
  ["/admin/orders", "Orders"],
  ["/admin/deliveries", "Deliveries"],
  ["/admin/profit-loss", "Profit & loss"],
  ["/admin/expenses", "Expenses"],
  ["/admin/reports", "Reports"],
  ["/admin/approvals", "Approvals"],
  ["/admin/activity", "Activity"],
  ["/admin/notifications", "Alerts"],
  ["/admin/employees", "Employees"],
  ["/admin/settings", "Settings"],
];

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
  return (
    <PortalFrame title="SHOP WITH NÁOMÉ · Owner" links={links}>
      {children}
    </PortalFrame>
  );
}
