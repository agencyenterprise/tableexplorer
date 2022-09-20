module.exports = {
  content: [
    "./src/**/*.njs",
    "./src/**/*.jsx",
    "./src/**/*.nts",
    "./src/**/*.tsx",
  ],
  tableLayout: ["responsive", "hover", "focus", "fixed"],
  theme: {
    extend: {
      colors: {
        "button-primary": "#E1C2D8",
        "button-hover": "#E3A9D2",
        "input-placeholder": "#969696",
        "checkbox-checked": "#b74c9f",
        primary: "#762fbe",
        "primary-dark": "#2f1d58",
        secondary: "#dfd8e8",
        paragraph: "#6f6684",
        heading: "#2f1d58",
        light: "#cabfd8",
        background: "#050505",
        "background-secondary": "#1E1E1E",
        "background-tertiary": "#47454f",
        "background-quaternary": "#3b3944",
        white: "#e8eaed",
        "red-standard": "#C73535",
        "green-standard": "#68DF98",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
