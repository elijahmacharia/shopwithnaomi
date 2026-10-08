"use client";

export function PrintButton() {
  return (
    <button type="button" className="min-h-11 rounded-md border px-3" onClick={() => window.print()}>
      Print receipt
    </button>
  );
}
