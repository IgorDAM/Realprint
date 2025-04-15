const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');

// Configuración de rutas
const config = {
  src: {
    css: 'css/*.css',
    js: 'js/*.js',
    images: 'img/*.{jpg,jpeg,png,gif,svg}',
    html: '*.html',
    fonts: 'fonts/*'
  },
  dest: 'dist'
};

// Tarea para CSS
function processCSS() {
  return gulp.src(config.src.css)
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .on('error', function(err) {
      console.error('CSS Error:', err.message);
      this.emit('end');
    })
    .pipe(gulp.dest(`${config.dest}/css`));
}

// Tarea para JavaScript
function processJS() {
  return gulp.src(config.src.js)
    .pipe(uglify())
    .on('error', function(err) {
      console.error('JS Error:', err.message);
      this.emit('end');
    })
    .pipe(gulp.dest(`${config.dest}/js`));
}

// Tarea para imágenes
function processImages() {
  return gulp.src(config.src.images)
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
    .pipe(gulp.dest(`${config.dest}/img`));
}

// Tarea para HTML
function processHTML() {
  return gulp.src(config.src.html)
    .pipe(gulp.dest(config.dest));
}

// Tarea para fuentes
function processFonts() {
  return gulp.src(config.src.fonts)
    .pipe(gulp.dest(`${config.dest}/fonts`));
}

// Tarea principal
const build = gulp.parallel(
  processCSS,
  processJS,
  processImages,
  processHTML,
  processFonts
);

exports.default = build;
exports.build = build;
