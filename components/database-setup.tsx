import type { DatabaseProblem } from "@/lib/database-problem";

const lead: Record<DatabaseProblem, string> = {
  "missing-url": "This deployment has no DATABASE_URL.",
  localhost: "DATABASE_URL points at localhost. A Vercel server cannot use the database on your laptop.",
  unreachable: "The server could not open the database.",
  "not-ready": "The database is there, and the shop tables have not been created yet.",
  "not-seeded": "The tables are ready, and the shop has not been filled in yet.",
};

export function DatabaseSetup({ problem }: { problem: DatabaseProblem }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-3xl">The shop database is not connected</h1>
      <p className="mt-3">{lead[problem]}</p>
      <p className="mt-3">On Vercel, open the project, then Settings, then Environment Variables. Add these, then redeploy:</p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <span className="font-semibold">DATABASE_URL</span> — the hosted Postgres connection string. Use port 5432 and add <span className="font-semibold">?sslmode=require&connection_limit=1</span>. Do not use localhost.
        </li>
        <li>
          <span className="font-semibold">SESSION_SECRET</span> — a long random string, at least 16 characters.
        </li>
        <li>
          <span className="font-semibold">NEXT_PUBLIC_WHATSAPP_NUMBER</span> — the shop WhatsApp number, digits only.
        </li>
      </ul>
      <p className="mt-3">A redeploy creates the tables when DATABASE_URL points at that hosted database. The first time, load the sample shop from your computer with the same connection string:</p>
      <pre className="mt-3 overflow-x-auto rounded-md bg-white p-3 text-sm">npx prisma migrate deploy{"\n"}npm run db:seed</pre>
    </main>
  );
}
