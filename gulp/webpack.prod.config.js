const devConfig = require('./webpack.dev.config');
const config = require('./config');
const extend = require('deep-extend');
const path = require('path');
const webpack = require('webpack');
const BabiliPlugin = require("babili-webpack-plugin");

// Extend the dev settings and add in extra plugins.
module.exports = extend({
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new BabiliPlugin({})
  ]
}, devConfig);
