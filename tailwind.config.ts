/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Colores corporativos oficiales de Bon Marché
        brand: {
          blue: "#0081c9", // Azul vibrante del logo
          orange: "#f07f07", // Zapote / Naranja del logo
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
