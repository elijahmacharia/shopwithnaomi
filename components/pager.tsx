import Link from "next/link";
import { pageCount } from "@/lib/pagination";

export function Pager({
  page,
  total,
  pageSize,
  path,
  query,
}: {
  page: number;
  total: number;
  pageSize: number;
  path: string;
  query?: Record<string, string | undefined>;
}) {
  const pages = pageCount(total, pageSize);
  if (total === 0 || pages <= 1) {
    return null;
  }
  function href(next: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value) {
        params.set(key, value);
      }
    }
    params.set("page", String(next));
    return `${path}?${params.toString()}`;
  }
  return (
    <nav className="flex items-center gap-3" aria-label="Pages">
      {page > 1 ? (
        <Link className="min-h-11 leading-[2.75rem]" href={href(page - 1)}>
          Previous
        </Link>
      ) : null}
      <span>
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link className="min-h-11 leading-[2.75rem]" href={href(page + 1)}>
          Next
        </Link>
      ) : null}
    </nav>
  );
}
