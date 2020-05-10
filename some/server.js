var gulp = require("gulp"),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    config = require('./config');

gulp.task('server', server);

gulp.task('default', server);
gulp.task('build', server);

function server() {
    browserSync({
        server: config.server
    });
    gulp.watch(config.pugPath + '/**/*', { ignoreInitial: false }, gulp.series('html',reload));
    // gulp.watch(config.scssPath + '/**/*.scss', { ignoreInitial: false }, gulp.series('css',reload));
    // gulp.watch(config.jsPath + '/**/*.js', { ignoreInitial: false }, gulp.series('js',reload));
    gulp.watch(config.imgPath + '/**/*', { ignoreInitial: false }, gulp.series('img'));
    // gulp.watch(config.fontPath + '/**/*', { ignoreInitial: false }, gulp.series('font',reload));
}

// gulp.task('default', gulp.series(['pug','scss','js','server']));
// gulp.task('build', gulp.series(['pug','scss','js']));