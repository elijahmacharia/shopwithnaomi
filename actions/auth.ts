"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { toUserMessage } from "@/lib/errors";
import { login, logout } from "@/services/auth-service";

export async function loginAction(_prev: { error?: string } | null, formData: FormData) {
  const portal = String(formData.get("portal") ?? "employee");
  try {
    const user = await login({ email: formData.get("email"), password: formData.get("password") });
    if (portal === "admin" && user.role !== "OWNER") {
      await logout();
      return { error: "This sign-in is for the owner." };
    }
    redirect(portal === "admin" ? "/admin/dashboard" : "/employee/dashboard");
  } catch (error) {
    unstable_rethrow(error);
    return { error: toUserMessage(error) };
  }
}

export async function logoutAction() {
  await logout();
  redirect("/");
}
