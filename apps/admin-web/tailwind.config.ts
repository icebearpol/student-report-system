import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e7f6fa',
          100: '#a5eeff',
          200: '#6ee4fd',
          300: '#5ed6ee',
          400: '#46C3DB',
          500: '#0A3C58',
          600: '#0A3C58',
          700: '#00263b',
          800: '#001e30',
          900: '#001e30',
        },
        'brand-gradient-start': '#0A3C58',
        'brand-gradient-end': '#46C3DB',
        background: '#effcff',
        surface: '#effcff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#e7f6fa',
        'surface-container': '#e2f1f4',
        'surface-container-high': '#dcebef',
        'surface-variant': '#d6e5e9',
        'on-surface': '#101e21',
        'on-surface-variant': '#42474d',
        outline: '#72787e',
        'outline-variant': '#c2c7ce',
        'status-urgent': '#EF4444',
        'status-progress': '#F59E0B',
        'status-resolved': '#10B981',
        'status-review': '#3B82F6',
        'primary-container': '#0a3c58',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.5rem',
        'login-card': '36px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
