const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');

// Tarea para optimizar CSS
gulp.task('minify-css', () => {
    return gulp.src('css/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css'));
});

// Tarea para optimizar JavaScript
gulp.task('minify-js', () => {
    return gulp.src('js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

// Tarea para optimizar imágenes
gulp.task('optimize-images', () => {
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
});

// Tarea para copiar archivos HTML
gulp.task('copy-html', () => {
    return gulp.src('*.html')
        .pipe(gulp.dest('dist'));
});

// Tarea para copiar fuentes
gulp.task('copy-fonts', () => {
    return gulp.src('fonts/*')
        .pipe(gulp.dest('dist/fonts'));
});

// Tarea por defecto que ejecuta todas las tareas
gulp.task('build', gulp.parallel(
    'minify-css',
    'minify-js',
    'optimize-images',
    'copy-html',
    'copy-fonts'
));

// Tarea para desarrollo que observa cambios
gulp.task('watch', () => {
    gulp.watch('css/*.css', gulp.series('minify-css'));
    gulp.watch('js/*.js', gulp.series('minify-js'));
    gulp.watch('img/*', gulp.series('optimize-images'));
    gulp.watch('*.html', gulp.series('copy-html'));
}); 