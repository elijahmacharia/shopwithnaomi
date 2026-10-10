import { unstable_rethrow } from "next/navigation";
import { DatabaseSetup } from "@/components/database-setup";
import { PortalFrame } from "@/components/portal-frame";
import { requirePage } from "@/lib/auth";
import { databaseProblem } from "@/lib/database-problem";

const links = [
  { href: "/employee/dashboard", label: "Dashboard" },
  { href: "/employee/sales/new", label: "New sale" },
  { href: "/employee/sales", label: "My sales" },
  { href: "/employee/credit", label: "Credit" },
  { href: "/employee/inventory", label: "Stock" },
  { href: "/employee/damage-reports", label: "Damage to owner" },
  { href: "/employee/price-requests", label: "Price requests" },
  { href: "/employee/notifications", label: "Alerts" },
  { href: "/employee/profile", label: "Profile" },
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
    <PortalFrame title="Shopkeeper till" role="Shopkeeper" links={links}>
      {children}
    </PortalFrame>
  );
}
