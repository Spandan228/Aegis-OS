import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["Orbitron", "sans-serif"],
      },
      colors: {
        cyber: {
          bg: "#030712",
          dark: "#060A17",
          panel: "#0B1124",
          border: "rgba(34, 211, 238, 0.15)",
          cyan: "#00F0FF",
          emerald: "#00FF9D",
          amber: "#FFB800",
          crimson: "#FF0055",
        },
      },
      boxShadow: {
        "cyber-cyan": "0 0 25px -5px rgba(0, 240, 255, 0.4)",
        "cyber-crimson": "0 0 35px -5px rgba(255, 0, 85, 0.5)",
        "cyber-emerald": "0 0 25px -5px rgba(0, 255, 157, 0.4)",
        "cyber-amber": "0 0 25px -5px rgba(255, 184, 0, 0.4)",
        "glass-inset": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "strobe": "strobe 0.5s ease-in-out infinite alternate",
        "radar-sweep": "radar 4s linear infinite",
        "glitch-x": "glitchX 0.3s ease-in-out infinite",
        "flow": "flow 2s linear infinite",
      },
      keyframes: {
        strobe: {
          "0%": { opacity: "0.2" },
          "100%": { opacity: "1" },
        },
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        glitchX: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-2px)" },
          "80%": { transform: "translateX(2px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

