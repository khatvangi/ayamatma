module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        devanagari: ['"Noto Serif Devanagari"', 'serif'],
        telugu: ['"Noto Sans Telugu"', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
