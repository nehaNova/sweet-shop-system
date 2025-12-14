// tailwind.config.cjs
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f8fafb",
          100: "#f1f6fb",
          200: "#dfeefb",
          300: "#c4e0fb",
          400: "#8bbaf7",
          500: "#3b82f6", // primary blue
          600: "#336fd8",
          700: "#2b57a8",
        },
        muted: {
          100: "#f5f7fa",
          200: "#eef2f6",
          300: "#dfe6ee",
        },
      },
      boxShadow: {
        card: "0 6px 18px rgba(18, 25, 40, 0.06)",
      },
      borderRadius: {
        "lg-2": "14px",
      },
    },
  },
  plugins: [],
};