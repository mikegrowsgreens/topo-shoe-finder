import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1A365D",
        teal: "#00A0A0",
        "teal-dark": "#007A7A",
        "topo-black": "#1A1A1A",
        "warm-gray": {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          400: "#A3A3A3",
          600: "#525252",
          800: "#262626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        "1": "8px",
        "2": "16px",
        "3": "24px",
        "4": "32px",
        "5": "40px",
        "6": "48px",
        "8": "64px",
        "10": "80px",
      },
    },
  },
  plugins: [],
};
export default config;
