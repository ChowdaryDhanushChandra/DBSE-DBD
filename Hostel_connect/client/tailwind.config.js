/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#050816', // Deep Cosmic Background
          900: '#0a0e27', // Deep Surface Glass
          850: '#0f153a', // Elevated Card Surface
          800: '#162052', // Border / Divider Surface
          700: '#23327d', // Active Surface
          600: '#3449ad',
        },
        cosmic: {
          bg: '#050816',
          primary: '#7B61FF',   // Neon Purple
          secondary: '#00E5FF', // Neon Cyan
          accent: '#FF4D9D',    // Neon Pink
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7B61FF', // Primary Neon Purple
          600: '#6d48f7',
          700: '#5b32e6',
          800: '#4c28c4',
          900: '#3f22a1',
          950: '#26126b',
        },
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#00E5FF', // Secondary Neon Cyan
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f472b6',
          400: '#f43f5e',
          500: '#FF4D9D', // Accent Neon Pink
          600: '#db2777',
          700: '#be185d',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(0, 229, 255, 0.45), 0 0 40px -10px rgba(0, 229, 255, 0.25)',
        'neon-purple': '0 0 20px -3px rgba(123, 97, 255, 0.45), 0 0 40px -10px rgba(123, 97, 255, 0.25)',
        'neon-pink': '0 0 20px -3px rgba(255, 77, 157, 0.45), 0 0 40px -10px rgba(255, 77, 157, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(0, 229, 255, 0.15), inset 0 0 0 1px rgba(0, 229, 255, 0.3)',
      },
      backgroundImage: {
        'galaxy-gradient': 'radial-gradient(ellipse at top, #1a1642 0%, #0c1033 45%, #050816 100%)',
        'cyber-gradient': 'linear-gradient(135deg, #7B61FF 0%, #00E5FF 100%)',
        'nebula-gradient': 'radial-gradient(circle at 50% 50%, rgba(123, 97, 255, 0.15), rgba(0, 229, 255, 0.08) 50%, transparent 75%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'orbit': 'orbit 15s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
}
