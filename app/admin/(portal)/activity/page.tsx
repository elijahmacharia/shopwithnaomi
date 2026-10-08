import { Pager } from "@/components/pager";
import { listActivity } from "@/services/activity";

export const metadata = { title: "Activity" };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const data = await listActivity(await searchParams);
  return (
    <div>
      <h1 className="font-display text-3xl">Activity</h1>
      <ul className="mt-4 divide-y rounded-md border bg-white">
        {data.logs.map((log) => <li key={log.id} className="px-4 py-3"><span className="font-semibold">{log.by}</span> · {log.description}<span className="block text-sm text-brand-muted">{log.createdAt.toLocaleString("en-KE")}</span></li>)}
      </ul>
      <Pager page={data.page} total={data.total} pageSize={data.pageSize} path="/admin/activity" />
    </div>
  );
}
