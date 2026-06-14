import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f6f4ef",
        ink: "#20231f",
        moss: {
          50: "#f3f6f2",
          100: "#e5ebe2",
          300: "#b5c5ae",
          500: "#73896b",
          700: "#4e6049",
          900: "#2f3b2d"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 20px 60px -35px rgba(32, 35, 31, 0.35)",
      },
      animation: {
        "fade-up": "fadeUp 600ms ease-out both",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
