const plugin = require("tailwindcss");

module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      scale: ["hover"],
      backgroundColor: ["hover"],
      opacity: ["hover"],
      ring: ["hover"],
    },
  },
  plugins: [],
};
