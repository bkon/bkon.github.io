const webpack = require("webpack");
const path = require("path");
const ChunkManifestPlugin = require("chunk-manifest-webpack-plugin");

const UGLIFY_OPTIONS = {
  compress: {
    warnings: false
  }
};

module.exports = {
  context: path.join(__dirname, "."),

  devtool: "source-map",

  entry: {
    "init": "init",
    "using-refs-in-react": "using-refs-in-react"
  },

  externals: {},

  resolve: {
    root: [
      path.join(__dirname, "jsx"),
      path.join(__dirname, "scss"),
      path.join(__dirname, "../node_modules")
    ],

    extensions: [
      "",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".css",
      ".scss"
    ]
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loaders: ["babel-loader", "ts-loader"]
      },
      {
        test: /\.s?css$/,
        loaders: [
          "style-loader",
          "css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5],typed-css-modules",
          "postcss-loader",
          "sass-loader"
        ]
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": "\"production\""
      }
    }),
    new webpack.optimize.CommonsChunkPlugin("common", "common.js"),
    new webpack.optimize.UglifyJsPlugin(UGLIFY_OPTIONS),
    new webpack.optimize.OccurenceOrderPlugin()
  ],

  output: {
    filename: "[name].js",
    chunkFilename: "[name].js",
    path: "src/js",
    publicPath: "/assets/"
  }
};
