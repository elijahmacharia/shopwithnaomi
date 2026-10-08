import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Employee sign in" };

export default function EmployeeLoginPage() {
  return <LoginForm portal="employee" title="Employee sign in" />;
}
