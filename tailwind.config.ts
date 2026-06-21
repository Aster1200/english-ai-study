import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b1320",
        panel: "#111f2f",
        cyanGlow: "#5ed8ff",
        warm: "#f7c86a",
        calm: "#90f2c4",
        review: "#ffb38a",
      },
      boxShadow: {
        glow: "0 22px 70px rgba(2, 8, 23, 0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
