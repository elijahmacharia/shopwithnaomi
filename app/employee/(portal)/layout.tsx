import { unstable_rethrow } from "next/navigation";
import { DatabaseSetup } from "@/components/database-setup";
import { PortalFrame } from "@/components/portal-frame";
import { requirePage } from "@/lib/auth";
import { databaseProblem } from "@/lib/database-problem";

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
  try {
    await requirePage(["EMPLOYEE", "OWNER"], "/employee/login");
  } catch (error) {
    unstable_rethrow(error);
    const problem = databaseProblem(error);
    if (problem) {
      return <DatabaseSetup problem={problem} />;
    }
    throw error;
  }
  return (
    <PortalFrame title="SHOP WITH NÁOMÉ · Sales" links={links}>
      {children}
    </PortalFrame>
  );
}
