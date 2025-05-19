/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#1a2438',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.8), 0 0 30px rgba(79, 70, 229, 0.5)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 10px rgba(59, 130, 246, 0.5)',
        'glow-indigo': '0 0 10px rgba(79, 70, 229, 0.5)',
      },
    },
  },
  plugins: [],
}