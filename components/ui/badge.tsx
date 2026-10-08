export function Badge({ children, tone = "soft" }: { children: React.ReactNode; tone?: "soft" | "warn" | "good" }) {
  const tones = {
    soft: "bg-brand-soft text-brand-ink",
    warn: "bg-amber-100 text-amber-950",
    good: "bg-emerald-100 text-emerald-950",
  };
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
