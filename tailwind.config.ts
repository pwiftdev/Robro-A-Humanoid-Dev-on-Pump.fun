import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        robroGreen: "#84EFAB",
        robroBlack: "#0d0d0d"
      },
      fontFamily: {
        mono: ["var(--font-space-mono)", "monospace"],
        display: ["Arial Black", "Arial", "sans-serif"]
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" }
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" }
        }
      },
      animation: {
        blink: "blink 800ms step-end infinite",
        fadeUp: "fadeUp 400ms ease-out both",
        bounceSoft: "bounceSoft 1.6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
