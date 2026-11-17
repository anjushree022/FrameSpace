/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Colours are CSS variables (see index.css) so every utility switches with the theme.
      colors: {
        paper: token('paper'),
        sand: token('sand'),
        line: token('line'),
        ink: token('ink'),
        mute: token('mute'),
        surface: token('surface'),
        danger: { DEFAULT: token('danger'), soft: token('danger-soft') },
        // "Cyanotype" blue, a nod to the earliest photographic prints.
        cyano: { DEFAULT: token('cyano'), dark: token('cyano-dark'), soft: token('cyano-soft'), text: token('cyano-text') },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
