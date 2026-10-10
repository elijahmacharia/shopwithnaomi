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
  if (total === 0) {
    return null;
  }
  function href(next: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value) {
        params.set(key, value);
      }
    }
    if (next > 1) {
      params.set("page", String(next));
    }
    const search = params.toString();
    return search ? `${path}?${search}` : path;
  }
  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter((number) => number === 1 || number === pages || Math.abs(number - page) <= 1);
  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Pages">
      {page > 1 ? (
        <Link className="grid h-11 min-w-11 place-items-center rounded-full border border-brand-soft bg-white px-3" href={href(page - 1)}>
          Previous
        </Link>
      ) : (
        <span className="grid h-11 min-w-11 place-items-center rounded-full border border-dashed border-brand-soft px-3 text-brand-muted">Previous</span>
      )}
      {numbers.map((number, index) => {
        const previous = numbers[index - 1];
        return (
          <span key={number} className="flex items-center gap-2">
            {previous && number - previous > 1 ? <span className="text-brand-muted">…</span> : null}
            <Link
              href={href(number)}
              aria-current={number === page ? "page" : undefined}
              className={`grid h-11 w-11 place-items-center rounded-full ${number === page ? "bg-brand-primary font-semibold text-brand-ink" : "border border-brand-soft bg-white"}`}
            >
              {number}
            </Link>
          </span>
        );
      })}
      {page < pages ? (
        <Link className="grid h-11 min-w-11 place-items-center rounded-full border border-brand-soft bg-white px-3" href={href(page + 1)}>
          Next
        </Link>
      ) : (
        <span className="grid h-11 min-w-11 place-items-center rounded-full border border-dashed border-brand-soft px-3 text-brand-muted">Next</span>
      )}
    </nav>
  );
}
