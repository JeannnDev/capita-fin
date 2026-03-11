/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(circle at 50% 50%, #ff7e5f, #feb47b)', // exemplo
      },
    },
  },
  plugins: [],
}