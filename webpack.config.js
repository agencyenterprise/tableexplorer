const [server, client] = require("nullstack/webpack.config");
const webpack = require("webpack");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const path = require("path");

function customServer(...args) {
  const config = server(...args);

  if (config.mode === "production") {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: ["./src/schema.prisma"],
      })
    );

    config.externals = ["@prisma/client"];
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
  config.plugins.push(new MonacoWebpackPlugin({ languages: ["sql"] }));

  config.module.rules.push({
    test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
    use: {
      loader: "url-loader",
      options: {
        limit: 100000,
        name: "[name].[ext]",
      },
    },
  });

  // config.entry = {
  //   ...config.entry,
  //   "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
  //   "json.worker": "monaco-editor/esm/vs/language/json/json.worker",
  //   "css.worker": "monaco-editor/esm/vs/language/css/css.worker",
  //   "html.worker": "monaco-editor/esm/vs/language/html/html.worker",
  //   "ts.worker": "monaco-editor/esm/vs/language/typescript/ts.worker",
  // }

  return config;
}

module.exports = [customServer, customClient];
