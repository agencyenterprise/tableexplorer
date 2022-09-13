const [server, client] = require("nullstack/webpack.config");
const webpack = require("webpack");

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

  return config;
}

module.exports = [server, customClient];