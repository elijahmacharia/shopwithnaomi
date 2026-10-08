import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { assertLoginAllowed, recordLoginFailure } from "@/lib/rate-limit";
import { createSession, destroySession } from "@/lib/session";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export async function login(input: unknown) {
  const data = loginSchema.parse(input);
  const email = data.email.toLowerCase();
  assertLoginAllowed(email);
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  const matches = user ? await bcrypt.compare(data.password, user.passwordHash) : false;
  if (!user || !matches || user.status !== "ACTIVE") {
    recordLoginFailure(email);
    throw new AppError("Email or password is incorrect.");
  }
  await createSession(user.id);
  return { id: user.id, role: user.role.name, name: user.name };
}

export async function logout() {
  await destroySession();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
