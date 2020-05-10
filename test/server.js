//服务器
gulp.task('server', function () {
    browserSync({
        server: {
            baseDir: 'debug/html',
            directory: true,
            index: ["index.html"],
            tunnel: true,
            middleware: mock.data()
        }
    });
    gulp.watch(htmlPath + '/**/*', gulp.series('html'));
    gulp.watch([scssPath + '/**/*.scss', '!' + scssPath + '/sprites/**'], gulp.series('css'));
    gulp.watch(jsPath + '/**/*.js', gulp.series('js'));
});