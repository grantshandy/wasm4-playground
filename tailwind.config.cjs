/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.svelte"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"],
  },
};
