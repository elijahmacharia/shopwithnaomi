import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-3xl">Page not found</h1>
      <Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold">
        Back to the shop
      </Link>
    </main>
  );
}
