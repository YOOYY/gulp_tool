var gulp = require("gulp"),
    gulpif = require('gulp-if'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    base64 = require('gulp-base64'),
    hash = require('gulp-css-assets-hash'),
    sassVariables = require('gulp-sass-variables'),
    uncss = require('gulp-uncss-sp'),
    styleLint = require('gulp-stylelint'),
    postcss = require('gulp-postcss'),
    // postcss2 = require('postcss'),
    opacity = require('postcss-opacity'),
    pe = require('postcss-pseudoelements'),
    gradient = require('postcss-filter-gradient'),
    autoprefixer = require('autoprefixer'),
    px2rem = require('gulp-px3rem'),
    revCollector  = require('gulp-rev-collector'),
    rev = require('gulp-rev'),
    reload = require('browser-sync').reload,
    config = require("./config");

//css
gulp.task('scss', function () {
    let processorsIe = [
        opacity({legacy: true}), //透明度
        gradient, //渐变
        // autoprefixer({overrideBrowserslist: config.browsers}),
    ];
    let processors = [
        // pe, //伪元素兼容
        // autoprefixer({overrideBrowserslist: config.browsers}),
        // px2rem({                    //处理SASS或LESS时，只能使用/*...*/注释，以便持续存在注释
        //     baseDpr: 2,             // 基本设备像素比 (default: 2)
        //     threeVersion: true,    // 是否生成@1x,@2x和@3x版本 (default: false)
        //     remVersion: true,       // 是否生成rem版本 (default: true)
        //     remUnit: 100,            // px:1rem (default: 100)
        //     remPrecision: 6         // rem值精度 (default: 6)
        // })
    ];
    let scssConfig = config.appConfig.scss;
    return gulp.src(config.scssPath + '/*.scss')
        // .pipe(styleLint({
        //     failAfterError: true,
        //     // 输出结果
        //     reporters: [
        //         { formatter: 'verbose', console: true },
        //     ]
        // }))
        .pipe(sassVariables(Object.assign(scssConfig.base,config.condition?scssConfig.build:scssConfig.debug)))
        .pipe(sass().on('error', sass.logError).on('error',function(){
            throw('scss转css错误');
        }))
        // .pipe(postcss(processors))
        .pipe(px2rem({                    //处理SASS或LESS时，只能使用/*...*/注释，以便持续存在注释
            baseDpr: 2,             // 基本设备像素比 (default: 2)
            threeVersion: true,    // 是否生成@1x,@2x和@3x版本 (default: false)
            remVersion: true,       // 是否生成rem版本 (default: true)
            remUnit: 100,            // px:1rem (default: 100)
            remPrecision: 6         // rem值精度 (default: 6)
        }))
        // .pipe(base64({
        //     baseDir:config.outcssPath,
        //     extensions: [/#base64$/i],
        //     exclude:    [],
        //     maxImageSize: 8*1024,
        //     debug: true
        // }))
        // .pipe(cleanCSS({
        //     compatibility: 'ie8',
        //     level: {
        //         1: {
        //             roundingPrecision: 3
        //         },
        //         2: {
        //             restructureRules: true,
        //             removeUnusedAtRules:true,
        //             mergeSemantically:true
        //         }
        //     },
        //     format: (config.condition?'':'beautify')
        // }))
        .pipe(gulp.dest(config.outcssPath))
        .pipe(
            gulpif(
                config.condition, rev()
            )
        )
        .pipe(
            gulpif(
                config.condition, rev.manifest({ merge: true })
            )
        )
        .pipe(
            gulpif(
                config.condition, gulp.dest(config.outrevPath)
            )
        )
        .pipe(reload({ stream: true }));
});

//清理无用css
gulp.task('uncss', function(done) {
    if (config.condition) {
        return gulp.src(config.outcssPath + '/**/*.css')
            .pipe(uncss({
                html: [config.outhtmlPath + '/**/*.html']
            }))
            .pipe(gulp.dest(config.outcssPath));
    } else {
        done();
    }
});

gulp.task('ht',function(){
    return gulp.src(config.outHtmlPath + '/*.html')
        .pipe(base64({
            baseDir:config.outHtmlPath,
            extensions: [/#base64$/i],
            exclude: [],
            maxImageSize: 8*1024,
            debug: true
        }))
        .pipe(gulp.dest(config.outHtmlPath))
})

gulp.task('cssrev',function(){
    return gulp.src([config.outrevPath + '/**/*.json', config.outcssPath + '/**/*.css'])
        .pipe(revCollector())
        .pipe(gulp.dest(config.outcssPath))
})

gulp.task('css', gulp.series('scss', 'uncss'))

        // pixrem({
        //     rootValue: 100,         //可以px，rem，em，%，或无单位像素值
        //     replace: false, 
        //     atrules: true, 
        //     html: false, 
        //     browsers: config.browsers, 
        //     unitPrecision: 6
        // })
