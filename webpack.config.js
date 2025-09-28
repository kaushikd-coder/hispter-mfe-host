const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const deps = require("./package.json").dependencies;

module.exports = (env = {}, argv = {}) => {
  const isProd = argv.mode === "production";

  // static remotes for prod (Netlify URLs)
  const prodRemotes = {
    authApp: "authApp@https://neon-moonbeam-2e9483.netlify.app/remoteEntry.js",
    bookingApp: "bookingApp@https://hispter-mfe-booking-app.netlify.app/remoteEntry.js",
    reportingApp: "reportingApp@https://hipster-mfe-report.netlify.app/remoteEntry.js",
  };

  return {
    entry: path.resolve(__dirname, "./src/index.js"),
    mode: isProd ? "production" : "development",
    devtool: isProd ? "source-map" : "eval-source-map",
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
          use: { loader: "babel-loader" },
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
        remotes: isProd ? prodRemotes : {}, // 👈 key change
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
};
