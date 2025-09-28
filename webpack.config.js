const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const deps = require("./package.json").dependencies;

module.exports = {
  entry: path.resolve(__dirname, "./src/index.js"),
  mode: "development",
  devtool: "eval-source-map",
  output: {
    publicPath: "auto",
    clean: true,
    path: path.resolve(__dirname, "dist"),
    uniqueName: "hostApp",
  },
  devServer: {
    port: 3000,
    static: { directory: path.resolve(__dirname, "public"), watch: true },
    headers: { "Access-Control-Allow-Origin": "*" },
    hot: false,
    liveReload: true,
    historyApiFallback: true,
    watchFiles: {
      paths: ["src/**/*", "public/**/*"],
      options: { usePolling: true, interval: 300 },
    },
    client: { overlay: true, progress: true },
    open: false,
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" }, // uses .babelrc
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },

  resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },

  plugins: [
    new ModuleFederationPlugin({
      name: "hostApp",
      remotes: {}, // runtime-attached
      // exposes: {
      //   "./AppStore": "./src/mf/AppStoreBridge.ts",
      //   "./Hooks": "./src/hooks.ts",
      // },
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
        "react-redux": { singleton: true, requiredVersion: deps["react-redux"] },
        "@reduxjs/toolkit": { singleton: true, requiredVersion: deps["@reduxjs/toolkit"] },
      },
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html", cache: false }),
  ],
};
