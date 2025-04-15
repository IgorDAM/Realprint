const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');

// Tarea para optimizar CSS
function minifyCss() {
    return gulp.src('css/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css'));
}

// Tarea para optimizar JavaScript
function minifyJs() {
    return gulp.src('js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
}

// Tarea para optimizar imágenes
function optimizeImages() {
    return gulp.src('img/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest('dist/img'));
}

// Tarea para copiar archivos HTML
function copyHtml() {
    return gulp.src('*.html')
        .pipe(gulp.dest('dist'));
}

// Tarea para copiar fuentes
function copyFonts() {
    return gulp.src('fonts/*')
        .pipe(gulp.dest('dist/fonts'));
}

// Tarea para desarrollo que observa cambios
function watchFiles() {
    gulp.watch('css/*.css', minifyCss);
    gulp.watch('js/*.js', minifyJs);
    gulp.watch('img/*', optimizeImages);
    gulp.watch('*.html', copyHtml);
}

const build = gulp.parallel(
    minifyCss,
    minifyJs,
    optimizeImages,
    copyHtml,
    copyFonts
);

exports.default = build;
exports.build = build;
exports.watch = watchFiles;