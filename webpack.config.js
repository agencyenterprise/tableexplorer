const [server, client] = require("nullstack/webpack.config");
const webpack = require("webpack");

const path = require("path");

function customServer(...args) {
  const config = server(...args);
  return config;
}

function customClient(...args) {
  const config = client(...args);

  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve("buffer/"),
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    })
  );
  
  const rule = config.module.rules.find((rule) => rule.test.test('.css'));
  
  rule.use.push({
    loader: require.resolve('postcss-loader'),
    options: {
      postcssOptions: {
        plugins: {
          tailwindcss: {},
        }
      },
    },
  });

  // config.plugins.push(
  //   new MonacoWebpackPlugin({
  //     languages: ["sql"],
  //     features: ["wordHighlighter"],
  //     globalAPI: false,
  //   })
  // );

  return config;
}

module.exports = [customServer, customClient];
