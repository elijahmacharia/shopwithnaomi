import { databaseProblem, type DatabaseProblem } from "./database-problem";

export async function readStorefront<T>(load: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; problem: DatabaseProblem }> {
  try {
    return { ok: true, data: await load() };
  } catch (error) {
    const problem = databaseProblem(error);
    if (!problem) {
      throw error;
    }
    console.error(error);
    return { ok: false, problem };
  }
}
