import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Owner sign in" };

export default function AdminLoginPage() {
  return <LoginForm portal="admin" title="Owner sign in" />;
}
