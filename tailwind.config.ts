import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        diwali: {
          night: "#02040a",
          navy: "#060919",
          deep: "#0a0f26",
          surface: "rgba(10, 15, 38, 0.75)",
          card: "#0d1330",
          border: "rgba(245, 192, 66, 0.22)",
          "border-bright": "rgba(245, 192, 66, 0.55)",
          gold: "#f5c042",
          "gold-light": "#fef08a",
          amber: "#f59e0b",
          saffron: "#ea580c",
          marigold: "#f97316",
          ivory: "#fdfbf7",
          muted: "#94a3b8",
        },
      },
      boxShadow: {
        "glow-gold": "0 0 25px rgba(245, 192, 66, 0.35)",
        "glow-gold-lg": "0 0 50px rgba(245, 192, 66, 0.5)",
        "glow-flame": "0 0 35px rgba(234, 88, 12, 0.45)",
        "glass-gold": "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
      },
      fontFamily: {
        serif: ["var(--font-cinzel)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        flicker: "flicker 3s infinite alternate ease-in-out",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        spin_slow: "spin 40s linear infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.88", transform: "scale(0.97)" },
          "25%": { opacity: "0.95", transform: "scale(1.02)" },
          "75%": { opacity: "0.92", transform: "scale(0.99)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
