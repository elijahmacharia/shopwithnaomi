import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#B1B2FF",
          secondary: "#AAC4FF",
          soft: "#D2DAFF",
          background: "#EEF1FF",
          ink: "#1E1B4B",
          muted: "#4C4680",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(30, 27, 75, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
