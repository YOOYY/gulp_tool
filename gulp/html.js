var gulp = require("gulp"),
    gulpif = require('gulp-if'),
    data = require('gulp-data'),

    pug = require('gulp-pug'),
    pugLinter = require('gulp-pug-linter'),

    htmllint = require("gulp-htmllint"),
    fancyLog = require('fancy-log'),
    colors = require('ansi-colors'),

    js2json = require('gulp-js2json'),
    rename = require('gulp-rename'),
    htmlmin = require('gulp-htmlmin'),
    revCollector = require('gulp-rev-collector'),
    reload = require('browser-sync').reload,
    config = require('./config'),

    ext = config.gulpConfig.ext || '&';
gulp.task('pug', () =>{
    return gulp.src(config.pugPath + '/**/*.pug')
        .pipe(pugLinter({
            reporter: puglintReporter,
            failAfterError: true
        }))
        .pipe(data(function(){
            let {base, debug, build} = config.appConfig.pug;
            return Object.assign(base,(config.condition?build:debug));
        }))
        .pipe(pug({
            pretty: !config.condition,
            doctype: 'html'
        }))
        .pipe(htmllint({"failOnError":true,"config":".htmllintrc.json"}, htmllintReporter))
        .pipe(
            gulpif(
                function(file){
                    return file.basename.includes(ext);
                },rename(function(path){
                    let [basename,extname] = path.basename.split(ext),
                        obj = {
                            'basename':basename,
                            'extname':'.' + extname
                        };
                    if(config.outHtmlDir !== false){
                        obj.dirname = config.outHtmlDir
                    }
                    return obj;
                })
            )
        )
        .pipe(gulp.dest(config.outHtmlPath))
        .pipe(reload({ stream: true }))
});

gulp.task('revCollector', (done) => {
    if (config.condition) {
        return gulp.src([config.outrevPath + '/**/*.json', config.outHtmlPath + '/**/*.html'])
            .pipe(revCollector())
            .pipe(
                htmlmin({
                    collapseWhitespace: true,
                    removeEmptyAttributes:true,
                    removeRedundantAttributes:true,
                    removeScriptTypeAttributes:true,
                    removeStyleLinkTypeAttributes:true,
                    sortAttributes:true,
                    sortClassName:true,
                    minifyCSS:true,
                    minifyJS:true
                })
            )
            .pipe(gulp.dest(config.outHtmlPath))
    } else {
        done();
    }
});

gulp.task('transformData', function () {
    return gulp.src(config.dataPath + '/*.js',{'allowEmpty':true})
        .pipe(js2json())
        .pipe(gulp.dest(config.outdataPath));
});

gulp.task('html', gulp.series('pug', 'transformData', 'revCollector'))

function puglintReporter(errors){
    if (errors.length > 0) {
        errors.map(function (error) {
            fancyLog(colors.cyan('[gulp-puglint] ') + colors.white(error.filename + ' [' + error.line + ',' + error.column + ']: ') + colors.red('(' + error.code + ') ' + error.msg));
        });
 
        process.exitCode = 1;
    }
}

function htmllintReporter(filepath, issues) {
    if (issues.length > 0) {
        issues.forEach(function (issue) {
            fancyLog(colors.cyan('[gulp-htmllint] ') + colors.white(filepath + ' [' + issue.line + ',' + issue.column + ']: ') + colors.red('(' + issue.code + ') ' + issue.msg));
        });
 
        process.exitCode = 1;
    }
}