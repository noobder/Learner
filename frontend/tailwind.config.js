/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Poppins'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#312e81",
          900: "#1e1b4b",
        },
      },
      boxShadow: {
        glow: "0 20px 60px -15px rgba(79, 70, 229, 0.35)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 45%), radial-gradient(circle at bottom right, rgba(255,255,255,0.12), transparent 45%)",
      },
    },
  },
  plugins: [],
}
