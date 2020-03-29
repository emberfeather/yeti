module.exports = {
  JS_SOURCE_DIR: './source/js/composite/',
  JS_SOURCES: [
    './partials/**/*.js',
    './partials/**/*.ts',
    './partials/**/*.tsx',
    './source/js/**/*.js',
    './source/js/**/*.ts',
    './source/js/**/*.tsx',
  ],
  JS_OUT_DIR: './dist/js/composite/',
  JS_OPTIONS: {
    uglify: {
      mangle: false
    }
  },
  SASS_SOURCE_DIR: './source/sass/composite/**/*.{sass,scss}',
  SASS_SOURCES: [
    './partials/**/*.{sass,scss}',
    './source/sass/**/*.{sass,scss}',
  ],
  SASS_OUT_DIR: './dist/css/composite/'
}
