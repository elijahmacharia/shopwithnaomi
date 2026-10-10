export type DatabaseProblem = "missing-url" | "localhost" | "unreachable" | "not-ready" | "not-seeded";

export function databaseProblem(error: unknown): DatabaseProblem | null {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  if (/Environment variable not found: (DATABASE_URL|DIRECT_URL)/i.test(message)) {
    return "missing-url";
  }
  if (/localhost|127\.0\.0\.1/.test(message) && /reach|connect|ECONNREFUSED|database/i.test(message)) {
    return "localhost";
  }
  if (/have not been seeded/i.test(message)) {
    return "not-seeded";
  }
  if (/does not exist|P2021/i.test(message)) {
    return "not-ready";
  }
  if (/P1001|P1000|P1017|Can't reach database|Server has closed the connection|Query Engine|PrismaClientInitialization|ECONNREFUSED|ENOTFOUND|SSL|certificate/i.test(message)) {
    return "unreachable";
  }
  return null;
}
