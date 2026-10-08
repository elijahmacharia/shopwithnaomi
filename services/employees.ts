import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { z } from "zod";
import { hashPassword } from "./auth-service";
import { writeAudit } from "./common";

const employeeSchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(80),
  phone: z.string().trim().min(8, "Enter a phone number.").max(30),
  email: z.string().trim().email("Enter a valid email."),
  role: z.enum(["OWNER", "EMPLOYEE"]),
});

export async function listEmployees() {
  await requireUser(["OWNER"], "employees");
  const rows = await prisma.user.findMany({ include: { role: true }, orderBy: { name: "asc" } });
  return rows.map((user) => ({
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role.name,
    status: user.status,
    createdAt: user.createdAt,
  }));
}

export async function createEmployee(input: unknown) {
  const actor = await requireUser(["OWNER"], "employees");
  const data = employeeSchema.parse(input);
  const role = await prisma.role.findUniqueOrThrow({ where: { name: data.role } });
  const temporaryPassword = randomBytes(9).toString("base64url");
  const user = await prisma.user.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email.toLowerCase(),
      passwordHash: await hashPassword(temporaryPassword),
      roleId: role.id,
    },
  });
  await writeAudit(prisma, {
    userId: actor.id,
    action: "employee.created",
    entityType: "user",
    entityId: user.id,
    description: `Owner added ${user.name}.`,
  });
  return { id: user.id, temporaryPassword };
}

export async function updateEmployee(id: string, input: unknown) {
  const actor = await requireUser(["OWNER"], "employees");
  if (actor.id === id && employeeSchema.parse(input).role !== "OWNER") {
    throw new AppError("You cannot remove your own owner access.");
  }
  const data = employeeSchema.parse(input);
  const role = await prisma.role.findUniqueOrThrow({ where: { name: data.role } });
  await prisma.user.update({
    where: { id },
    data: { name: data.name, phone: data.phone, email: data.email.toLowerCase(), roleId: role.id },
  });
  await writeAudit(prisma, {
    userId: actor.id,
    action: "employee.updated",
    entityType: "user",
    entityId: id,
    description: `Owner updated ${data.name}.`,
  });
}

export async function setEmployeeStatus(id: string, status: "ACTIVE" | "INACTIVE") {
  const actor = await requireUser(["OWNER"], "employees");
  if (actor.id === id && status === "INACTIVE") {
    throw new AppError("You cannot deactivate your own account.");
  }
  await prisma.user.update({ where: { id }, data: { status } });
  if (status === "INACTIVE") {
    await prisma.session.deleteMany({ where: { userId: id } });
  }
  await writeAudit(prisma, {
    userId: actor.id,
    action: "employee.status",
    entityType: "user",
    entityId: id,
    description: `Owner set an account to ${status}.`,
  });
}

export async function resetEmployeeAccess(id: string) {
  const actor = await requireUser(["OWNER"], "employees");
  const temporaryPassword = randomBytes(9).toString("base64url");
  await prisma.user.update({ where: { id }, data: { passwordHash: await hashPassword(temporaryPassword) } });
  await prisma.session.deleteMany({ where: { userId: id } });
  await writeAudit(prisma, {
    userId: actor.id,
    action: "employee.reset",
    entityType: "user",
    entityId: id,
    description: "Owner reset an account password.",
  });
  return temporaryPassword;
}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(30),
});

export async function updateProfile(input: unknown) {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "profile");
  const data = profileSchema.parse(input);
  await prisma.user.update({ where: { id: actor.id }, data });
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  nextPassword: z.string().min(8, "Use at least 8 characters."),
});

export async function changePassword(input: unknown) {
  const actor = await requireUser(["OWNER", "EMPLOYEE"], "profile");
  const data = passwordSchema.parse(input);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: actor.id } });
  const bcrypt = await import("bcryptjs");
  const matches = await bcrypt.default.compare(data.currentPassword, user.passwordHash);
  if (!matches) {
    throw new AppError("The current password is incorrect.");
  }
  await prisma.user.update({ where: { id: actor.id }, data: { passwordHash: await hashPassword(data.nextPassword) } });
}
