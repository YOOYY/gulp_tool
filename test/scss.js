var gulp = require("gulp"),
    path = require('path'),
    fs = require('fs'),
    merge = require('merge-stream'),
    gulpif = require('gulp-if'),
    data = require('gulp-data'),
    pug = require('gulp-pug'),
    htmlmin = require('gulp-htmlmin'),
    pugLinter = require('gulp-pug-linter'),
    htmllint = require("gulp-htmllint"),
    fancyLog = require('fancy-log'),
    colors = require('ansi-colors');

//css
gulp.task('css', function () {
    return gulp.src(scssPath + '/*.scss')
        .pipe(scsslint({
            customReport: myCustomReporter
        }))
        .pipe(sass().on('error', sass.logError).on('error',function(){
            throw('scss转css错误');
        }))
        .pipe(styleLint({
            failAfterError: true,
            // 输出结果
            reporters: [
                { formatter: 'verbose', console: true },
            ]
        }))
        .pipe(
            gulpif(
                condition, autoprefixer({
                    browsers: [
                        "last 2 versions",
                        "> 1% in CN",
                        "ie >= 8",
                        "maintained node versions",
                        "not dead"
                    ]
                })
            )
        )
        .pipe(
            gulpif(
                condition, cleanCSS({
                    compatibility: 'ie8'
                })
            )
        )
        .pipe(
            gulpif(
                condition, rev()
            )
        )
        .pipe(gulp.dest(outcssPath))
        .pipe(
            gulpif(
                condition, rev.manifest({ merge: true })
            )
        )
        .pipe(
            gulpif(
                condition, gulp.dest(outrevPath)
            )
        )
        .pipe(reload({ stream: true }));
});
//清理无用css
gulp.task('uncss', function(done) {
    if (condition) {
        return gulp.src(outcssPath + '/**/*.css')
            .pipe(uncss({
                html: [outhtmlPath + '/**/*.html']
            }))
            .pipe(gulp.dest(outcssPath));
    } else {
        done();
    }
});
gulp.task('html', gulp.series('pug', 'revCollector', 'uncss','cleanRev'))

var myCustomReporter = function(file) {
    if (!file.scsslint.success) {
      gutil.log(file.scsslint.issues.length + ' issues found in ' + file.path);
    }
  };