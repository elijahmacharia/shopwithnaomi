export default function Loading() {
  return <div className="grid gap-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-md bg-brand-soft" />)}</div>;
}
