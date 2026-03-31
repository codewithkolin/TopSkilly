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
        // Topskilly brand colour
        brand: {
          DEFAULT: "#1A56DB",
          50:  "#EBF0FD",
          100: "#C9D8F9",
          500: "#1A56DB",
          600: "#1547C0",
          700: "#1039A5",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config;
