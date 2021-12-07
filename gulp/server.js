var gulp = require("gulp"),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    config = require('./config.js');

function server() {
    browserSync({
        server: config.server
    });
    gulp.watch(config.pugPath + '/**/*', { ignoreInitial: false }, gulp.series('html'));
    gulp.watch(config.scssPath + '/**/*.scss', { ignoreInitial: false }, gulp.series('css'));
    gulp.watch(config.jsPath + '/**/*.js', { ignoreInitial: false }, gulp.series('js'));
    gulp.watch(config.imgPath + '/**/*', { ignoreInitial: false }, gulp.series('img'));
    gulp.watch(config.fontPath + '/**/*', { ignoreInitial: false }, gulp.series('font'));

    // gulp.watch(config.pugPath + '/**/*', {ignoreInitial: false}, gulp.series('html', reload));
}

gulp.task('debug', server);
gulp.task('build', gulp.series(['cleanDir', 'img','css', 'js','font','html']));
gulp.task('default', server);