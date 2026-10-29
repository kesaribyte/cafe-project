
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          cream: "#F7F1E7",
          brown: "#40291F",
          caramel: "#B77945",
          beige: "#E8D8C4",
        },
      },
      fontFamily: {
        heading: ["Georgia", "serif"],
        body: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
