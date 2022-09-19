module.exports = {
  content: ["./src/**/*.jsx"],
  tableLayout: ["responsive", "hover", "focus", "fixed"],
  theme: {
    extend: {
      colors: {
        primary: "#762fbe",
        "primary-dark": "#2f1d58",
        secondary: "#dfd8e8",
        paragraph: "#6f6684",
        heading: "#2f1d58",
        light: "#cabfd8",
        background: "#1d1b23",
        "background-secondary": "#2d2c33",
        "background-tertiary": "#47454f",
        "background-quaternary": "#3b3944",
        white: "#e8eaed",
        "red-standard": "#C73535",
        "green-standard": "#68DF98"
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
