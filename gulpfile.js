const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');

// Tarea para CSS
function css() {
  return gulp.src('css/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist/css'));
}

// Tarea para JS
function js() {
  return gulp.src('js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
}

// Tarea para imágenes
function images() {
  return gulp.src('img/*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(gulp.dest('dist/img'));
}

// Tarea para HTML
function html() {
  return gulp.src('*.html')
    .pipe(gulp.dest('dist'));
}

// Tarea para fuentes
function fonts() {
  return gulp.src('fonts/*')
    .pipe(gulp.dest('dist/fonts'));
}

// Tarea principal
const build = gulp.parallel(css, js, images, html, fonts);

exports.default = build;
exports.build = build;