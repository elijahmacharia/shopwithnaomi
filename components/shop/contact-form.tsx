"use client";

import { useActionState } from "react";
import { contactAction } from "@/actions/shop";

export function ContactForm() {
  const [state, action, pending] = useActionState(contactAction, null);
  return (
    <form action={action} className="grid max-w-xl gap-3">
      <label className="grid gap-1 text-sm">Name<input name="name" required className="min-h-11 rounded-md border px-3" /></label>
      <label className="grid gap-1 text-sm">Phone<input name="phone" required className="min-h-11 rounded-md border px-3" /></label>
      <label className="grid gap-1 text-sm">Message<textarea name="message" required className="min-h-28 rounded-md border px-3 py-2" /></label>
      {state?.error && <p className="text-red-800">{state.error}</p>}
      {state?.success && <p>{state.success}</p>}
      <button disabled={pending} className="min-h-11 rounded-md bg-brand-ink font-semibold text-white" type="submit">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
