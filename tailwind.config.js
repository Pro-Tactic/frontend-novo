/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pt: {
          bg: "var(--pt-bg)",
          surface: "var(--pt-surface)",
          primary: "var(--pt-lime)",
          secondary: "var(--pt-white)",
          slate: "var(--pt-slate)",
          white: "var(--pt-white)",
          text: {
            DEFAULT: "var(--pt-text-primary)",
            muted: "var(--pt-text-muted)",
          }
        }
      }
    },
  },
  plugins: [],
};
