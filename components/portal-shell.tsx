"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/actions/auth";

export type PortalLink = { href: string; label: string; badge?: number };

function active(pathname: string, href: string) {
  if (href.endsWith("/dashboard")) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalShell({
  title,
  role,
  links,
  children,
}: {
  title: string;
  role: string;
  links: PortalLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentHref = links
    .filter((link) => active(pathname, link.href))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;
  const current = links.find((link) => link.href === currentHref);

  const nav = (
    <nav className="grid gap-1 px-3">
      {links.map((link) => {
        const on = link.href === currentHref;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`flex min-h-11 items-center justify-between rounded-xl px-3 text-sm ${on ? "bg-brand-primary font-semibold text-brand-ink" : "text-brand-muted hover:bg-brand-background"}`}
          >
            <span>{link.label}</span>
            {link.badge ? <span className="rounded-full bg-brand-ink px-2 text-xs text-white">{link.badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-brand-background lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-brand-soft bg-white lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-primary font-display text-lg">N</span>
          <div>
            <p className="font-display text-lg leading-none">Náomé</p>
            <p className="mt-1 text-xs text-brand-muted">{role}</p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-2">{nav}</div>
        <form action={logoutAction} className="border-t border-brand-soft p-3">
          <button className="min-h-11 w-full rounded-xl border border-brand-soft text-sm" type="submit">
            Log out
          </button>
        </form>
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 bg-brand-ink/30 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="flex h-full w-72 flex-col bg-white" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-4">
              <p className="font-display text-lg">Náomé</p>
              <button type="button" className="min-h-11 px-3" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-brand-soft bg-white/90 px-4 py-3 backdrop-blur">
          <button type="button" className="min-h-11 rounded-xl border border-brand-soft px-3 lg:hidden" onClick={() => setOpen(true)}>
            Menu
          </button>
          <div className="min-w-0">
            <p className="text-xs text-brand-muted">{title}</p>
            <p className="truncate font-display text-xl">{current?.label ?? "Office"}</p>
          </div>
          <Link href="/shop" className="ml-auto min-h-11 rounded-xl bg-brand-soft px-4 text-sm font-semibold leading-[2.75rem]">
            View shop
          </Link>
        </header>
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
