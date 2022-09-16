const [server, client] = require("nullstack/webpack.config");
const webpack = require("webpack");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");


function customServer(...args) {
  const config = server(...args);

  if (config.mode === 'production') {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: ['./src/schema.prisma'],
      }),
    );

    config.externals = ['@prisma/client'];
  }

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
  config.plugins.push(new MonacoWebpackPlugin());

  return config;
}

module.exports = [customServer, customClient];
