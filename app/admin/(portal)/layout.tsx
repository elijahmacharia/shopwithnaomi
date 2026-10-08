import { PortalFrame } from "@/components/portal-frame";
import { requirePage } from "@/lib/auth";

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
  await requirePage("OWNER", "/admin/login");
  return (
    <PortalFrame title="SHOP WITH NÁOMÉ · Owner" links={links}>
      {children}
    </PortalFrame>
  );
}
