module.exports = {
    content: ["./src/**/*.{html,jsx,njs}", "./node_modules/nullstack-tailwind/src/components/**/*.nts"],
    theme: {
      extend: {
        colors: {
          primary: '#762fbe',
          'primary-dark': '#2f1d58',
          secondary: '#dfd8e8',
          paragraph: '#6f6684',
          heading: '#2f1d58',
          light: '#cabfd8',
          background: '#1d1b23',
          'background-secondary': '#2d2c33',
          'background-tertiary': '#47454f',
          'background-quaternary': '#3b3944',
          white: '#e8eaed',
        },
      },
    },
    plugins: [require("@tailwindcss/forms")],
  };