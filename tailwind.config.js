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
          bg: "#000000",
          surface: "rgba(20, 20, 20, 0.6)",
          "surface-solid": "#101508",
          "surface-bright": "#353b2c",
          primary: "#9ffb00",
          "primary-dim": "#8bdc00",
          secondary: "#b7c4ff",
          "secondary-bright": "#dce1ff",
          blue: "#0249df",
          text: {
            DEFAULT: "#dfe5cf",
            muted: "#c0caad",
            inverse: "#1f3700"
          },
          border: "rgba(255, 255, 255, 0.07)"
        }
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        geist: ['Geist', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(162, 255, 1, 0.15)',
      }
    },
  },
  plugins: [],
};
