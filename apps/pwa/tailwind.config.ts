import type { Config } from "tailwindcss";

// "Gece Matbaasi" (docs/gorsel-kimlik.md). Degerler CSS degiskenlerinden okunur => tek gercek kaynak.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-top": "var(--bg-top)",
        "bg-bottom": "var(--bg-bottom)",
        surface: "var(--surface)",
        hairline: "var(--hairline)",
        text: "var(--text)",
        "text-dim": "var(--text-dim)",
        "text-faint": "var(--text-faint)",
        accent: "var(--accent)",
        "accent-deep": "var(--accent-deep)",
        "accent-fill": "var(--accent-fill)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius)",
      },
      transitionTimingFunction: {
        out1: "var(--ease)",
      },
      transitionDuration: {
        DEFAULT: "var(--dur)",
      },
      keyframes: {
        "stagger-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shine-sweep": {
          from: { transform: "translateX(-120%)" },
          to: { transform: "translateX(120%)" },
        },
      },
      animation: {
        "stagger-in": "stagger-in var(--dur) var(--ease) both",
        "shine-sweep": "shine-sweep 900ms var(--ease)",
      },
    },
  },
  plugins: [],
} satisfies Config;
