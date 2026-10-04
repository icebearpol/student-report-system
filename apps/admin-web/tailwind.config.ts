import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          primary: '#1B4332',
          accent: '#40916C',
          danger: '#D00000',
          warning: '#E85D04',
        },
      },
    },
  },
  plugins: [],
};

export default config;
