const path = require('path')
const readdirRecursive = require('fs-readdir-recursive')
const config = require('./config')

const files = readdirRecursive(config.JS_SOURCE_DIR);
const entry = {};
files.forEach(function(value) {
  if (value.endsWith('.ts')) {
    const key = value.substring(0, value.length - 3);
    entry[key] = config.JS_SOURCE_DIR + value;
  } else if (value.endsWith('.tsx')) {
    const key = value.substring(0, value.length - 4);
    entry[key] = config.JS_SOURCE_DIR + value;
  }
});

module.exports = {
  entry: entry,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  mode: 'development',
  devtool: "eval",
  plugins: [],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [
          path.resolve(__dirname, 'source/js'),
        ],
        use: ['ts-loader'],
        exclude: /node_modules/,
      }
    ],
  },
  output: {
    path: path.resolve(__dirname, config.JS_OUT_DIR),
    filename: '[name].min.js',
  },
  watch: true,
};
