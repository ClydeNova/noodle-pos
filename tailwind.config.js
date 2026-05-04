/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Noto Sans TC",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
