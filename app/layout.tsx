import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sans = Nunito({ subsets: ["latin"], variable: "--font-sans" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: { default: "SHOP WITH NÁOMÉ", template: "%s · SHOP WITH NÁOMÉ" },
  description: "Everything your home needs, in one place. Household essentials, kitchen products, food, cleaning, and poultry.",
  openGraph: {
    title: "SHOP WITH NÁOMÉ",
    description: "Everything your home needs, in one place.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} bg-brand-background font-sans text-brand-ink antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>
        {children}
        <Toaster position="bottom-center" offset={96} />
      </body>
    </html>
  );
}
