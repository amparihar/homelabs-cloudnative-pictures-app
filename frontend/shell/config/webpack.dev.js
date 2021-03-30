const htmlWebpackPlugin = require("html-webpack-plugin");
const moduleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { merge } = require("webpack-merge");

const commonConfig = require("./webpack.common");

const devConfig = {
  mode: "development",
  entry: "./src/index.js",
  devServer: {
    port: 4000,
  },

  plugins: [
    new htmlWebpackPlugin({
      template: "./public/index.html",
    }),

    new moduleFederationPlugin({
      name: "shell",
      remotes: {},
    }),
  ],
};

module.exports = merge(commonConfig, devConfig);
