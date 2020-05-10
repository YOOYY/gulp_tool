var gulp = require("gulp"),
    browserSync = require('browser-sync'),
    config = require('./config.js');

gulp.task('server', server);

gulp.task('default', server);

function server() {
    browserSync({
        server: config.server
    });
    gulp.watch(config.pugPath + '/**/*', gulp.series('html'));
    gulp.watch(config.scssPath + '/**/*.scss', gulp.series('css'));
    gulp.watch(config.jsPath + '/**/*.js', gulp.series('js'));
    gulp.watch(config.imgPath + '/**/*', gulp.series('img'));
    gulp.watch(config.fontPath + '/**/*', gulp.series('font'));
}