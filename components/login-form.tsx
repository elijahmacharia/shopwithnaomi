"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export function LoginForm({ portal, title }: { portal: "admin" | "employee"; title: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form action={action} className="grid w-full gap-4 rounded-md border border-brand-soft bg-white p-6">
        <h1 className="font-display text-3xl">{title}</h1>
        <input type="hidden" name="portal" value={portal} />
        <label className="grid gap-1 text-sm">
          Email
          <input name="email" type="email" required autoComplete="username" className="min-h-11 rounded-md border px-3" />
        </label>
        <label className="grid gap-1 text-sm">
          Password
          <input name="password" type="password" required autoComplete="current-password" className="min-h-11 rounded-md border px-3" />
        </label>
        {state?.error && <p className="text-red-800">{state.error}</p>}
        <button disabled={pending} className="min-h-12 rounded-md bg-brand-ink font-semibold text-white" type="submit">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
