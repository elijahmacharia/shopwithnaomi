import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60",
        variant === "primary" && "bg-brand-ink text-white",
        variant === "ghost" && "border border-brand-secondary bg-white text-brand-ink",
        variant === "danger" && "bg-red-800 text-white",
        className,
      )}
      {...props}
    />
  );
}
