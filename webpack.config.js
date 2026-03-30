const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProd ? "production" : "development",
  devtool: isProd ? false : "source-map",

  entry: {
    // ─── Frontend JS ──────────────────────────────────────────────
    // Add / rename entries to match your plugin's JS files.
    // Each entry = one output file in dist/js/
    popup: "./assets/js/popup.js",

    // ─── Styles ───────────────────────────────────────────────────
    // Each entry = one output CSS file in dist/css/
    styles: "./assets/scss/main.scss",
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isProd ? "js/[name].min.js" : "js/[name].js",
    clean: true,
  },

  module: {
    rules: [
      // ── JavaScript (Babel transpile) ──────────────────────────
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },

      // ── SCSS / CSS ────────────────────────────────────────────
      {
        test: /\.(scss|css)$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { sourceMap: !isProd, importLoaders: 1 },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: !isProd,
              sassOptions: {
                outputStyle: isProd ? "compressed" : "expanded",
              },
            },
          },
        ],
      },

      // ── Images / Fonts ────────────────────────────────────────
      {
        test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext][query]",
        },
      },
    ],
  },

  optimization: {
    minimize: isProd,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: { comments: false },
          compress: { drop_console: isProd },
        },
      }),
      new CssMinimizerPlugin(),
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: isProd ? "css/[name].min.css" : "css/[name].css",
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "assets"),
      "@scss": path.resolve(__dirname, "assets/scss"),
      "@js": path.resolve(__dirname, "assets/js"),
    },
  },
};
