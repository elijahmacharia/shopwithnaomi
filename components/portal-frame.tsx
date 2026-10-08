import Link from "next/link";
import { logoutAction } from "@/actions/auth";

export function PortalFrame({
  title,
  links,
  children,
}: {
  title: string;
  links: Array<[string, string]>;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-brand-soft bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <p className="font-display text-lg">{title}</p>
          <form action={logoutAction}>
            <button className="min-h-11 rounded-md border border-brand-secondary px-3 text-sm" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="min-h-11 whitespace-nowrap rounded-md px-3 leading-[2.75rem] hover:bg-brand-soft">
              {label}
            </Link>
          ))}
        </nav>
        <div id="main">{children}</div>
      </div>
    </div>
  );
}
