/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        navbar: 'var(--navbar)',
        danger: 'var(--danger)',
        'data-blue': 'var(--data-blue)',
        'card-bg': 'var(--card-bg)',
      },
    },
  },
  plugins: [],
}; 