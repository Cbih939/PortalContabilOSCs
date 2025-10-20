/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Informa que todos os arquivos .js/.jsx em 'src' usarão Tailwind
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}