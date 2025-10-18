import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          extend: "light",
          colors: {
            background: "#EFF1F3",
            foreground: "#0D1821",
            primary: "#4E6E5D",
            secondary: "#AD8A64",
            accent: "#A44A3F",
            focus: "#4E6E5D",
          },
          layout: {
            disabledOpacity: "0.4",
            radius: {
              small: "4px",
              medium: "6px",
              large: "8px",
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px",
            },
          },
        },
        dark: {
          extend: "dark",
          colors: {
            background: "#EFF1F3",
            foreground: "#0D1821",
            primary: "#4E6E5D",
            secondary: "#AD8A64",
            accent: "#A44A3F",
            focus: "#4E6E5D",
          },
          layout: {
            disabledOpacity: "0.4",
            radius: {
              small: "4px",
              medium: "6px",
              large: "8px",
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px",
            },
          },
        },
      },
    }),
  ],
};

module.exports = config;
