const config = require('../config');
const gulp = require('gulp');
const webpack = require('webpack');
const webpackConfig = require('../webpack.prod.config');
const webpackStream = require('webpack-stream');

gulp.task('compilejs', function() {
  return gulp.src(config.JS_SOURCES)
      .pipe(webpackStream(
        webpackConfig, webpack
      ))
      .pipe(gulp.dest(config.JS_OUT_DIR));
});
