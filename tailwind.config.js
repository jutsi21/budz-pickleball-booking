/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#060e1e',
          800: '#0a1628',
          700: '#0f1f38',
          600: '#152a4a',
          500: '#1b3560',
        },
        gold: {
          400: '#ffd84d',
          500: '#f5c518',
          600: '#d4a810',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 32px rgba(0,0,0,0.3)',
        glow: '0 0 40px rgba(245,197,24,0.15)',
        button: '0 4px 20px rgba(245,197,24,0.3)',
        'button-lg': '0 8px 40px rgba(245,197,24,0.4)',
      },
      borderRadius: {
        xl2: '28px',
      },
      animation: {
        'bounce-ball': 'bounceBall 0.8s ease-in-out infinite alternate',
        'scroll-pulse': 'scrollPulse 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in-right': 'fadeInRight 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'modal-in': 'modalIn 0.4s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        bounceBall: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-30px)' },
        },
        scrollPulse: {
          '0%,100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        modalIn: {
          from: { opacity: '0', transform: 'scale(0.85) translateY(20px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
