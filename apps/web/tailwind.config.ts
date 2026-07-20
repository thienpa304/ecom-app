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
        accent: {
          DEFAULT: "#e85d04",
          dark: "#d00000",
          light: "#f48c06",
        },
        sale: {
          DEFAULT: "#dc2626",
          soft: "#fef2f2",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-be-vietnam)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
