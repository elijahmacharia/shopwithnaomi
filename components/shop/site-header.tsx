"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useStore } from "./store-provider";

const links = [
  ["/", "Home"],
  ["/shop", "Shop"],
  ["/categories", "Categories"],
  ["/wishlist", "Wishlist"],
  ["/cart", "Cart"],
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
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="font-display text-xl text-brand-ink">
          SHOP WITH NÁOMÉ
        </Link>
        <button className="ml-auto min-h-11 rounded-md border border-brand-secondary px-3 lg:hidden" type="button" onClick={() => setOpen((value) => !value)}>
          Menu
        </button>
        <nav className="ml-6 hidden items-center gap-4 text-sm lg:flex">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="min-h-11 leading-[2.75rem]">
              {label}
            </Link>
          ))}
        </nav>
        <form onSubmit={search} className="ml-auto hidden lg:block">
          <input
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="min-h-11 rounded-md border border-brand-secondary bg-brand-background px-3"
          />
        </form>
        <Link href="/wishlist" className="min-h-11 leading-[2.75rem] text-sm" aria-label={`Wishlist, ${wishlist.length} items`}>
          ♡ {wishlist.length}
        </Link>
        <Link href="/cart" className="min-h-11 leading-[2.75rem] text-sm font-semibold" aria-label={`Cart, ${cartCount} items`}>
          Cart ({cartCount})
        </Link>
      </div>
      {open && (
        <div className="grid gap-2 border-t border-brand-soft px-4 py-3 lg:hidden">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="min-h-11 leading-[2.75rem]" onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <form onSubmit={search}>
            <input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="min-h-11 w-full rounded-md border border-brand-secondary px-3" />
          </form>
        </div>
      )}
    </header>
  );
}
