import { redirect } from "next/navigation";
import type { RoleName } from "@prisma/client";
import { AppError } from "./errors";
import { assertCan, type Permission } from "./domain/permissions";
import { getSessionUser, type SessionUser } from "./session";

export async function requireUser(roles?: RoleName[], permission?: Permission): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AppError("Your session has expired. Please sign in again.");
  }
  if (roles && !roles.includes(user.role)) {
    throw new AppError("You do not have permission to do that.");
  }
  if (permission) {
    assertCan(user.role, permission);
  }
  return user;
}

export async function requirePage(role: RoleName | RoleName[], loginPath: string) {
  const user = await getSessionUser();
  const roles = Array.isArray(role) ? role : [role];
  if (!user || !roles.includes(user.role)) {
    redirect(loginPath);
  }
  return user;
}
