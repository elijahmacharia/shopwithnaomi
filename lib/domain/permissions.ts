import type { RoleName } from "@prisma/client";
import { AppError } from "../errors";

export const permissions = [
  "owner-dashboard",
  "employee-dashboard",
  "sales",
  "products",
  "inventory",
  "stock-take",
  "credit",
  "record-credit-payment",
  "customers",
  "orders",
  "deliveries",
  "profit",
  "expenses",
  "reports",
  "approvals",
  "employees",
  "activity",
  "settings",
  "damage-report",
  "price-request",
  "notifications",
  "profile",
  "view-cost",
] as const;

export type Permission = (typeof permissions)[number];

const ownerPermissions = new Set<Permission>(permissions);

const employeePermissions = new Set<Permission>([
  "employee-dashboard",
  "sales",
  "inventory",
  "credit",
  "damage-report",
  "price-request",
  "notifications",
  "profile",
]);

export function can(role: RoleName, permission: Permission): boolean {
  const allowed = role === "OWNER" ? ownerPermissions : employeePermissions;
  return allowed.has(permission);
}

export function assertCan(role: RoleName, permission: Permission): void {
  if (!can(role, permission)) {
    throw new AppError("You do not have permission to do that.");
  }
}
