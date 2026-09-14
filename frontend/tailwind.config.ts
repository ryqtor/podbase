import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#FAF8F5",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F7F5F0",
          muted: "#EFECE6",
          card: "#FFFFFF",
        },
        brand: {
          DEFAULT: "#FF7A45",
          hover: "#F0642D",
          light: "#FFF3EE",
          dark: "#D95725",
        },
        secondary: {
          DEFAULT: "#0EA5E9",
          light: "#F0F9FF",
          dark: "#0284C7",
        },
        slate: {
          950: "#020617",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        border: {
          DEFAULT: "#E5E7EB",
          subtle: "#F1EFEA",
          strong: "#D1D5DB",
        },
        foreground: "#0F172A",
        "muted-foreground": "#64748B",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0, 0, 0, 0.04)",
        card: "0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)",
        "card-hover": "0 12px 28px -4px rgba(15, 23, 42, 0.08), 0 3px 10px -2px rgba(15, 23, 42, 0.04)",
        float: "0 20px 40px -6px rgba(15, 23, 42, 0.09), 0 6px 16px -2px rgba(15, 23, 42, 0.04)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem", // ~18px
        "3xl": "1.375rem", // ~22px
      },
      animation: {
        "fade-in": "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
