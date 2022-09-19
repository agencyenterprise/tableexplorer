module.exports = {
  content: ["./src/**/*.jsx"],
  tableLayout: ["responsive", "hover", "focus", "fixed"],
  theme: {
    extend: {
      colors: {
        "button-primary": "#E1C2D8",
        "button-hover": "#E3A9D2",
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
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
