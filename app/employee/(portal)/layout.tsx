import { PortalFrame } from "@/components/portal-frame";
import { requirePage } from "@/lib/auth";

const links: Array<[string, string]> = [
  ["/employee/dashboard", "Today"],
  ["/employee/sales/new", "New sale"],
  ["/employee/sales", "My sales"],
  ["/employee/credit", "Credit"],
  ["/employee/inventory", "Stock"],
  ["/employee/damage-reports", "Damage"],
  ["/employee/price-requests", "Prices"],
  ["/employee/notifications", "Alerts"],
  ["/employee/profile", "Profile"],
];

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  await requirePage(["EMPLOYEE", "OWNER"], "/employee/login");
  return (
    <PortalFrame title="SHOP WITH NÁOMÉ · Sales" links={links}>
      {children}
    </PortalFrame>
  );
}
