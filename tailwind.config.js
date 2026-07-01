/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marca Myflat
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcddff',
          300: '#8ec7ff',
          400: '#59a6ff',
          500: '#3182f6', // azul principal / perfil social
          600: '#1f66db',
          700: '#1a51b0',
          800: '#1b458c',
          900: '#1b3d73',
        },
        // Identidad verificada
        gold: {
          400: '#f5c451',
          500: '#e6a817',
          600: '#c2860a',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(16, 24, 40, 0.25)',
      },
    },
  },
  plugins: [],
};
