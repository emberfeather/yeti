const gulp = require('gulp');
const config = require('../config');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const webpackConfig = require('../webpack.dev.config');

gulp.task('watch', () => {
  gulp.watch(config.SASS_SOURCE, ['sass']);
  webpackConfig.watch = true;

  gulp.src(config.JS_SOURCES)
    .pipe(webpackStream(
      webpackConfig, webpack
    ))
    .pipe(gulp.dest(config.JS_OUT_DIR));
});
