const autoprefixer = require('gulp-autoprefixer')
const gulp = require('gulp')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const webpack = require('webpack')
const webpackDevConfig = require('./webpack.config.js')
const webpackProdConfig = require('./webpack.prod.config.js')
const webpackStream = require('webpack-stream')
const config = require('./config')

gulp.task('sass', () => {
  return gulp.src(config.SASS_SOURCE_DIR)
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [
      './node_modules/'
      ]
    }))
    .on('error', sass.logError)
    .pipe(rename(function(path) {
      path.basename += '.min'
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(config.SASS_OUT_DIR))
})

gulp.task('ts-dev', () => {
  return gulp.src(config.JS_SOURCE_DIR)
    .pipe(webpackStream(webpackDevConfig, webpack))
    .pipe(gulp.dest(config.JS_OUT_DIR))
})

gulp.task('ts-prod', () => {
  return gulp.src(config.JS_SOURCE_DIR)
    .pipe(webpackStream(webpackProdConfig, webpack))
    .pipe(gulp.dest(config.JS_OUT_DIR))
})

gulp.task('watch', () => {
  gulp.watch(config.SASS_SOURCES, {ignoreInitial: false}, gulp.series('sass'))
  gulp.watch(config.JS_SOURCES, {ignoreInitial: false}, gulp.series('ts-dev'))
})
gulp.task('build', gulp.parallel('sass', 'ts-prod'))
gulp.task('grow-build', gulp.parallel('sass', 'ts-prod'))
gulp.task('default', gulp.series('watch'))
