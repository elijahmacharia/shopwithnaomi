"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-2">Please try again. If it keeps happening, refresh the page.</p>
      <button type="button" className="mt-4 min-h-11 rounded-md bg-brand-ink px-4 font-semibold text-white" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
