/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        secondary: '#F97316',
        background: '#F3F4F6',
        textDark: '#0F172A',
        textLight: '#475569',
      },
    },
  },
  plugins: [],
}