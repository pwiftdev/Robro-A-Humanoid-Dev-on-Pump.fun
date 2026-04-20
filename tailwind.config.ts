import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        robroGreen: "#84EFAB",
        robroBlack: "#0d0d0d",
        ink: {
          950: "#07090a",
          900: "#0b0d0e",
          800: "#101314",
          700: "#171b1c",
          600: "#1f2425"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ["Inter Tight", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "ui-serif", "Georgia", "serif"]
      },
      letterSpacing: {
        "label": "0.18em",
        "tightish": "-0.01em",
        "tightest": "-0.035em"
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" }
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        blink: "blink 1.1s steps(2, end) infinite",
        fadeUp: "fadeUp 600ms cubic-bezier(0.2, 0.7, 0.2, 1) both"
      }
    }
  },
  plugins: []
};

export default config;
