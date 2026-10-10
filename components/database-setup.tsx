import type { DatabaseProblem } from "@/lib/database-problem";

const lead: Record<DatabaseProblem, string> = {
  "missing-url": "This deployment has no DATABASE_URL.",
  localhost: "DATABASE_URL points at localhost. A Vercel server cannot use the database on your laptop.",
  unreachable: "The server could not open the database.",
  "not-ready": "The database is open, and the shop tables have not been created yet.",
  "not-seeded": "The tables are ready, and the sample shop has not been loaded yet.",
};

export function DatabaseSetup({ problem }: { problem: DatabaseProblem }) {
  const needsHostedDatabase = problem === "missing-url" || problem === "localhost" || problem === "unreachable";
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl">{needsHostedDatabase ? "The shop database is not connected" : "The sample shop is not loaded"}</h1>
      <p className="mt-3">{lead[problem]}</p>
      {needsHostedDatabase ? (
        <>
          <p className="mt-3">On Vercel, open the project, then Settings, then Environment Variables. Add these, then redeploy:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <span className="font-semibold">DATABASE_URL</span> — Supabase transaction pooler, port 6543, ending in <span className="font-semibold">?pgbouncer=true&connection_limit=1&sslmode=require</span>.
            </li>
            <li>
              <span className="font-semibold">DIRECT_URL</span> — Supabase session pooler, port 5432, ending in <span className="font-semibold">?sslmode=require</span>. Migrations use this connection.
            </li>
            <li>
              <span className="font-semibold">SESSION_SECRET</span> — a long random string, at least 16 characters.
            </li>
            <li>
              <span className="font-semibold">NEXT_PUBLIC_WHATSAPP_NUMBER</span> — the shop WhatsApp number, digits only.
            </li>
          </ul>
        </>
      ) : (
        <p className="mt-3">In the project folder, run:</p>
      )}
      <pre className="mt-3 overflow-x-auto rounded-md bg-white p-3 text-sm">
        {problem === "not-seeded"
          ? "SEED_OWNER_PASSWORD=owner-dev-pass SEED_EMPLOYEE_PASSWORD=employee-dev-pass npm run db:seed"
          : "npx prisma migrate deploy\nnpm run db:seed"}
      </pre>
      {problem === "not-seeded" ? <p className="mt-3">Refresh this page after the seed finishes.</p> : null}
    </main>
  );
}
