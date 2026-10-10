import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverActions: { bodySizeLimit: "4mb" },
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/client/**/*"],
  },
  async redirects() {
    return [
      { source: "/shop/products", destination: "/shop", permanent: false },
      { source: "/shop/products/:slug", destination: "/shop/:slug", permanent: false },
      { source: "/shop/categories/:slug", destination: "/shop?category=:slug", permanent: false },
      { source: "/admin/stock-takes", destination: "/admin/stock-take", permanent: false },
      { source: "/admin/online-orders", destination: "/admin/orders", permanent: false },
      { source: "/admin/activity-log", destination: "/admin/activity", permanent: false },
      { source: "/admin/damage-reports", destination: "/admin/approvals", permanent: false },
      { source: "/admin/price-requests", destination: "/admin/approvals", permanent: false },
      { source: "/order-confirmation/:reference", destination: "/order-confirmation?order=:reference", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
