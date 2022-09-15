const [server, client] = require("nullstack/webpack.config");
const webpack = require("webpack");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

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
  config.plugins.push(new MonacoWebpackPlugin());

  return config;
}

module.exports = [server, customClient];
