// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#f59e0b",
          600: "#d97706",
          400: "#fb923c",
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};
