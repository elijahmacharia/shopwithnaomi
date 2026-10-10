import Link from "next/link";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-8 py-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-wide text-brand-muted">Staff</p>
        <h1 className="mt-2 font-display text-4xl">Sign in</h1>
        <p className="mt-3 text-brand-muted">Customers shop without an account. The owner and the shopkeeper sign in here.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/login" className="rounded-3xl border border-brand-soft bg-white p-6 shadow-card">
          <p className="text-sm text-brand-muted">Owner</p>
          <p className="mt-2 font-display text-3xl">Office</p>
          <p className="mt-3 text-sm">Stock, profit, expenses, and shopkeeper reports.</p>
        </Link>
        <Link href="/employee/login" className="rounded-3xl border border-brand-soft bg-brand-primary p-6 shadow-card">
          <p className="text-sm text-brand-ink/80">Shopkeeper</p>
          <p className="mt-2 font-display text-3xl">Till</p>
          <p className="mt-3 text-sm">Sales, credit, and damage reports for the owner.</p>
        </Link>
      </div>
    </div>
  );
}
