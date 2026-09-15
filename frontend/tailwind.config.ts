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
        sidebar: "#0F1117",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F7F5F0",
          muted: "#EFECE6",
          card: "#FFFFFF",
        },
        brand: {
          DEFAULT: "#FF9A61",
          hover: "#F08A50",
          light: "#FFF3EE",
          dark: "#D97B3F",
        },
        secondary: {
          DEFAULT: "#0EA5E9",
          light: "#F0F9FF",
          dark: "#0284C7",
        },
        // Pastel card colors
        lavender: "#F3EEFF",
        mint: "#EEF9F0",
        pink: "#FFF1F5",
        beige: "#FFF8EA",
        // Text colors
        foreground: "#111827",
        "muted-foreground": "#6B7280",
        "secondary-text": "#6B7280",
        // Border colors
        border: {
          DEFAULT: "#ECECEC",
          subtle: "#F1EFEA",
          strong: "#D1D5DB",
        },
        // Sidebar-specific colors
        "sidebar-hover": "rgba(255, 255, 255, 0.06)",
        "sidebar-active": "rgba(255, 255, 255, 0.1)",
        "sidebar-text": "rgba(255, 255, 255, 0.5)",
        "sidebar-text-bright": "rgba(255, 255, 255, 0.9)",
        // Slate scale
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
        navy: "#1A1F36",
      },
      fontFamily: {
        serif: ["'DM Serif Display'", "Georgia", "serif"],
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "Fira Code", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.03)",
        float: "0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",     // 20px
        "3xl": "1.5rem",      // 24px
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
