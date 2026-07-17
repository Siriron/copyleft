/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12253E',
          50: '#EAF0F5',
          100: '#CBD9E6',
          300: '#6F8CA8',
          500: '#2A4463',
          700: '#182E48',
          900: '#0B1626',
        },
        paper: {
          DEFAULT: '#EAEBE3',
          50: '#F7F7F3',
          100: '#EAEBE3',
          200: '#DDDED2',
          300: '#C7C9B8',
        },
        seal: {
          DEFAULT: '#A47C1B',
          light: '#C79A34',
          dark: '#7C5C13',
        },
        slate: {
          DEFAULT: '#3C6E71',
          light: '#5A8C8F',
          dark: '#274B4D',
        },
        violation: '#8B1E1E',
        compliant: '#2E6B4F',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
};
