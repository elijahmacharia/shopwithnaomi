import { AppError } from "./errors";

const attempts = new Map<string, number[]>();

export function assertLoginAllowed(email: string) {
  const now = Date.now();
  const recent = (attempts.get(email) ?? []).filter((time) => now - time < 10 * 60 * 1000);
  if (recent.length >= 8) {
    throw new AppError("Too many sign-in attempts. Wait a few minutes and try again.");
  }
  attempts.set(email, recent);
}

export function recordLoginFailure(email: string) {
  const now = Date.now();
  const recent = (attempts.get(email) ?? []).filter((time) => now - time < 10 * 60 * 1000);
  recent.push(now);
  attempts.set(email, recent);
}
