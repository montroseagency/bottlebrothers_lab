import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Luxury monochrome palette
        luxury: {
          black: '#0a0a0a',
          'gray-950': '#121212',
          'gray-900': '#1a1a1a',
          'gray-800': '#252525',
          'gray-700': '#333333',
          'gray-600': '#4a4a4a',
          'gray-500': '#666666',
          'gray-400': '#8a8a8a',
          'gray-300': '#adadad',
          'gray-200': '#d1d1d1',
          'gray-100': '#e8e8e8',
          'gray-50': '#f5f5f5',
          white: '#ffffff',
        },
        // Accent colors - refined gold/champagne
        accent: {
          champagne: {
            50: '#fdfbf7',
            100: '#f9f4ec',
            200: '#f3e8d6',
            300: '#e8d5b7',
            400: '#d4b895',
            500: '#c09a6e',  // Main accent
            600: '#a6814d',
            700: '#8a6a3b',
            800: '#6f5530',
            900: '#5a4427',
          },
          // Subtle secondary accent
          steel: {
            50: '#f8f9fa',
            100: '#e9ecef',
            200: '#cbd5e0',
            300: '#a0aec0',
            400: '#718096',
            500: '#4a5568',
            600: '#2d3748',
            700: '#1a202c',
            800: '#171923',
            900: '#0d0f14',
          },
        },
      },
      fontFamily: {
        // Elegant serif for headings (uses CSS variable from Next.js font)
        display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
        // Clean sans for body (uses CSS variable from Next.js font)
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        // Monospace for special elements
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        'display-lg': ['5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'luxury-lg': '0 35px 60px -15px rgba(0, 0, 0, 0.6)',
        'luxury-xl': '0 45px 80px -20px rgba(0, 0, 0, 0.7)',
        'inner-luxury': 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
        'glow-champagne': '0 0 20px rgba(192, 154, 110, 0.3)',
        'glow-champagne-lg': '0 0 40px rgba(192, 154, 110, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'luxury-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #252525 100%)',
        'accent-gradient': 'linear-gradient(135deg, #d4b895 0%, #c09a6e 50%, #a6814d 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        'luxury': '2px',
      },
      letterSpacing: {
        'luxury': '0.05em',
        'luxury-wide': '0.1em',
      },
    },
  },
  plugins: [],
}

export default config
