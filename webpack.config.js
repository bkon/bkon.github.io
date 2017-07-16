const webpack = require("webpack");
const path = require("path");

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
    "using-refs-in-react": "using-refs-in-react",
    "dealing-with-jarred-animation-in-react": "dealing-with-jarred-animation-in-react"
  },

  externals: {},

  resolve: {
    modules: [
      path.join(__dirname, "jsx"),
      path.join(__dirname, "scss"),
      path.join(__dirname, "../node_modules")
    ],

    extensions: [
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
    new webpack.optimize.CommonsChunkPlugin({
      name: "common",
      filename: "common.js"
    }),
    new webpack.optimize.UglifyJsPlugin(UGLIFY_OPTIONS)
  ],

  output: {
    filename: "[name].js",
    chunkFilename: "[name].js",
    path: path.join(__dirname, "js"),
    publicPath: "/assets/"
  }
};
