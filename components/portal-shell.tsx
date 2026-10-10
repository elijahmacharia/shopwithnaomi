"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/actions/auth";

export type PortalLink = { href: string; label: string; badge?: number; group: string };

function active(pathname: string, href: string) {
  if (href.endsWith("/dashboard")) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalShell({
  title,
  role,
  userName,
  unread,
  alertsHref,
  links,
  children,
}: {
  title: string;
  role: string;
  userName: string;
  unread: number;
  alertsHref: string;
  links: PortalLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentHref = links
    .filter((link) => active(pathname, link.href))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;
  const current = links.find((link) => link.href === currentHref);
  const groups = links.reduce<Array<{ name: string; links: PortalLink[] }>>((list, link) => {
    const group = list.find((item) => item.name === link.group);
    if (group) {
      group.links.push(link);
    } else {
      list.push({ name: link.group, links: [link] });
    }
    return list;
  }, []);
  const today = new Intl.DateTimeFormat("en-KE", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Nairobi" }).format(new Date());

  const nav = (
    <nav className="grid gap-4 px-3">
      {groups.map((group) => (
        <div key={group.name} className="grid gap-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-brand-muted">{group.name}</p>
          {group.links.map((link) => {
            const on = link.href === currentHref;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-11 items-center justify-between rounded-xl px-3 text-sm ${on ? "bg-brand-primary font-semibold text-brand-ink" : "text-brand-ink hover:bg-brand-background"}`}
              >
                <span>{link.label}</span>
                {link.badge ? <span className="rounded-full bg-brand-ink px-2 text-xs text-white">{link.badge}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-brand-background lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-brand-soft bg-white lg:flex">
        <div className="px-5 py-5">
          <p className="font-display text-xl leading-none">SHOP WITH NÁOMÉ</p>
          <p className="mt-2 text-xs text-brand-muted">{role}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-4">{nav}</div>
        <form action={logoutAction} className="border-t border-brand-soft p-3">
          <p className="truncate px-2 text-sm font-semibold">{userName}</p>
          <button className="mt-2 min-h-11 w-full rounded-xl border border-brand-soft text-sm" type="submit">
            Log out
          </button>
        </form>
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 bg-brand-ink/30 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="flex h-full w-72 flex-col bg-white" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-4">
              <p className="font-display text-lg">SHOP WITH NÁOMÉ</p>
              <button type="button" className="min-h-11 px-3" onClick={() => setOpen(false)} aria-label="Close menu">
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{nav}</div>
            <form action={logoutAction} className="border-t border-brand-soft p-3">
              <button className="min-h-11 w-full rounded-xl border border-brand-soft text-sm" type="submit">
                Log out
              </button>
            </form>
          </aside>
        </div>
      ) : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-brand-soft bg-white px-4 py-3">
          <button type="button" className="min-h-11 rounded-xl border border-brand-soft px-3 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            Menu
          </button>
          <div className="min-w-0">
            <p className="text-xs text-brand-muted">{title}</p>
            <p className="truncate font-display text-xl">{current?.label ?? "Office"}</p>
          </div>
          <p className="ml-auto hidden text-sm text-brand-muted sm:block">{today}</p>
          <Link href={alertsHref} className="relative grid h-11 w-11 place-items-center rounded-xl border border-brand-soft" aria-label={`Alerts, ${unread} unread`}>
            <span aria-hidden>🔔</span>
            {unread > 0 ? <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-primary px-1 text-[10px] font-semibold">{unread}</span> : null}
          </Link>
        </header>
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
