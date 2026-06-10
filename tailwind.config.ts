import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080A12",
        panel: "#10131F",
        raise: "#161A2A",
        line: "rgba(255,255,255,0.08)",
        you: { DEFAULT: "#8B7CFF", soft: "#2A2550", glow: "#A99BFF" },
        str: { DEFAULT: "#FF7A66", soft: "#46241F", glow: "#FFA08F" },
        mint: "#5EE6B8",
        gold: "#FFC861"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"]
      },
      boxShadow: {
        glowYou: "0 0 40px -8px rgba(139,124,255,0.45)",
        glowStr: "0 0 40px -8px rgba(255,122,102,0.45)"
      },
      animation: {
        drift: "drift 14s ease-in-out infinite alternate",
        drift2: "drift2 18s ease-in-out infinite alternate",
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
        marquee: "marquee 38s linear infinite"
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate(-6%, -4%) scale(1)" },
          "100%": { transform: "translate(8%, 10%) scale(1.15)" }
        },
        drift2: {
          "0%": { transform: "translate(6%, 8%) scale(1.1)" },
          "100%": { transform: "translate(-8%, -6%) scale(0.95)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      }
    }
  },
  plugins: []
};
export default config;
