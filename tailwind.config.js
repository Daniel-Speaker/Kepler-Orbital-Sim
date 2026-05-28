/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(217 33% 20%)",
        input: "hsl(217 33% 20%)",
        ring: "hsl(199 89% 48%)",
        background: "hsl(222 47% 7%)",
        foreground: "hsl(210 40% 96%)",
        muted: { DEFAULT: "hsl(217 33% 14%)", foreground: "hsl(215 20% 65%)" },
        card: { DEFAULT: "hsl(222 47% 9%)", foreground: "hsl(210 40% 96%)" },
        primary: { DEFAULT: "hsl(199 89% 48%)", foreground: "hsl(222 47% 7%)" },
        accent: { DEFAULT: "hsl(199 89% 48%)", foreground: "hsl(222 47% 7%)" },
        warning: { DEFAULT: "hsl(38 92% 50%)" },
      },
      borderRadius: { lg: "0.6rem", md: "0.4rem", sm: "0.25rem" },
    },
  },
  plugins: [],
};
