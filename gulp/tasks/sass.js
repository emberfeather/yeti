var config = require('../config');
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var sass = require('gulp-sass');

gulp.task('sass', function() {
  gulp.src(config.SASS_SOURCE)
  .pipe(sass({
    outputStyle: 'compressed'
  })).on('error', sass.logError)
  .pipe(rename(function(path) {
    path.basename += '.min';
  }))
  .pipe(autoprefixer({}))
  .pipe(gulp.dest(config.SASS_OUT_DIR));
});
