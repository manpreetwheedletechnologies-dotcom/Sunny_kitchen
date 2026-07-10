import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF2DA",
        creamDark: "#F5E6C3",
        card: "#FFFDF6",
        forest: "#1E4B36",
        forestDark: "#123024",
        sun: "#F6B93B",
        sunDeep: "#EFA323",
        tomato: "#E8542E",
        ink: "#2B2A22",
      },
      fontFamily: {
        script: ["Caveat", "cursive"],
        display: ["Baloo 2", "sans-serif"],
        body: ["Quicksand", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
