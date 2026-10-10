"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useStore } from "./store-provider";

const links = [
  ["/", "Home"],
  ["/shop", "Shop"],
  ["/categories", "Categories"],
  ["/about", "About"],
  ["/contact", "Contact"],
];

export function SiteHeader() {
  const { cart, wishlist } = useStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);

  function search(event: FormEvent) {
    event.preventDefault();
    router.push(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : "/shop");
    setOpen(false);
  }

  return (
    <header className="border-b border-brand-soft bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
        <button className="min-h-11 rounded-full border border-brand-soft px-3 lg:hidden" type="button" onClick={() => setOpen((value) => !value)}>
          Menu
        </button>
        <Link href="/" className="font-display text-2xl tracking-tight text-brand-ink">
          SHOP WITH NÁOMÉ
        </Link>
        <nav className="ml-6 hidden items-center gap-6 text-sm lg:flex">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="min-h-11 leading-[2.75rem] hover:underline hover:decoration-brand-primary hover:underline-offset-8">
              {label}
            </Link>
          ))}
        </nav>
        <form onSubmit={search} className="ml-auto hidden lg:block">
          <input
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the shop"
            className="min-h-11 w-56 rounded-full border border-brand-soft bg-brand-background px-4"
          />
        </form>
        <Link href="/wishlist" className="grid h-11 w-11 place-items-center rounded-full border border-brand-soft" aria-label={`Wishlist, ${wishlist.length} items`}>
          {wishlist.length > 0 ? "♥" : "♡"}
        </Link>
        <Link href="/cart" className="grid h-11 min-w-11 place-items-center rounded-full border border-brand-soft px-3 text-sm font-semibold" aria-label={`Cart, ${cartCount} items`}>
          {cartCount}
        </Link>
        <Link href="/sign-in" className="inline-flex min-h-11 items-center rounded-full bg-brand-primary px-3 text-sm font-semibold text-brand-ink sm:px-4">
          Sign in
        </Link>
      </div>
      {open && (
        <div className="grid gap-1 border-t border-brand-soft px-4 py-3 lg:hidden">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="min-h-11 leading-[2.75rem]" onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href="/sign-in" className="min-h-11 font-semibold leading-[2.75rem]" onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <form onSubmit={search}>
            <input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the shop" className="min-h-11 w-full rounded-full border border-brand-soft px-4" />
          </form>
        </div>
      )}
    </header>
  );
}
