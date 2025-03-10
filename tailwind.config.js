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
        'fpl-purple-dark': 'var(--fpl-purple-dark)',
        'fpl-purple': 'var(--fpl-purple)',
        'fpl-blue': 'var(--fpl-blue)',
        'fpl-cyan': 'var(--fpl-cyan)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-border': 'var(--gradient-border)',
      },
    },
  },
  plugins: [],
};
