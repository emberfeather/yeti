const TerserPlugin = require('terser-webpack-plugin');
const devConfig = require('./webpack.config');

// Make a shallow copy of the dev config and apply the options on top.
module.exports = Object.assign({}, devConfig, {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
  watch: false,
});
