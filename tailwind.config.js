/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.3)',
        },
        accent: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
        },
        surface: {
          DEFAULT: '#16213e',
          hover: '#1e2d50',
        },
        dark: {
          DEFAULT: '#0f0f1a',
          secondary: '#1a1a2e',
          card: 'rgba(26, 26, 46, 0.8)',
          glass: 'rgba(22, 33, 62, 0.6)',
          input: 'rgba(15, 15, 26, 0.6)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderColor: {
        glass: 'rgba(99, 102, 241, 0.15)',
        'glass-hover': 'rgba(99, 102, 241, 0.3)',
        'glass-focus': 'rgba(99, 102, 241, 0.5)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideInUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      width: {
        sidebar: '260px',
      },
    },
  },
  plugins: [],
}
