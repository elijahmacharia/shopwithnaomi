export function Notice({ error, notice }: { error?: string; notice?: string }) {
  if (!error && !notice) {
    return null;
  }
  return <p className={`rounded-md px-3 py-2 text-sm ${error ? "bg-red-100 text-red-900" : "bg-brand-soft"}`}>{error || notice}</p>;
}
