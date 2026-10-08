export function WhatsappButton({ number }: { number: string }) {
  if (!number) {
    return null;
  }
  const href = `https://wa.me/${number}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 z-20 inline-flex min-h-12 items-center rounded-full bg-brand-ink px-4 text-sm font-semibold text-white shadow-card"
    >
      WhatsApp
    </a>
  );
}
