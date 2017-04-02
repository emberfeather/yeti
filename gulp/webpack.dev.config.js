const path = require('path');
const config = require('./config');

module.exports = {
  entry: {
    yeti: config.JS_SOURCE_DIR + 'yeti.js'
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: "json-loader" }
    ],
  },
  output: {
    path: path.resolve(__dirname, config.JS_OUT_DIR),
    filename: '[name].min.js'
  }
};
