/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [`./views/**/*.html`],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["cyberpunk"],
  },
};
