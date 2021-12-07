var gulp = require("gulp"),
    fs = require('fs'),
    merge = require('merge-stream'),
    gulpif = require('gulp-if'),
    path = require('path'),

    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    typescript = require('gulp-typescript'),
    babel = require('gulp-babel'),
    eslint = require('gulp-eslint'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,

    rev = require('gulp-rev'),
    config = require('./config'),

    folders = [];

gulp.task('jsConcat', function (done) {
    folders = config.getDirs(config.jsPath, config.prefix);
    if (folders.length == 0) {
        done();
    }
    var tasks = folders.map(function (folder) {
        var tempstr = folder.replace(config.jsPath, ''),
            baseName = path.basename(tempstr).replace(config.prefix, '');
        return gulp.src(path.join(folder, '/*.js'))
            .pipe(concat(baseName + '.js'))
            .pipe(gulp.dest(config.outjsPath));
    });

    return merge(tasks);
});

gulp.task('mixConfig', function (done) {
    var folders = config.jsConcatDir,str='debug';
    var tasks = folders.map(function (folder) {
        var file = path.join(config.jsPath,folder+'.js');
        if(config.condition){str = 'build'}
        var dir = [path.join(config.appPath,'config/js/index.js'),path.join(config.appPath,'config/js/'+ str +'.js')];
        if(fs.existsSync(file)){
            dir.push(file);
        }
        return gulp.src(dir,{base:config.outjsPath})
            .pipe(concat(folder + '.js'))
            .pipe(gulp.dest(config.outjsPath));
    });

    return merge(tasks);
});

gulp.task('typescript', function () {
    return gulp.src(config.jsPath + '/**/*.ts')
        .pipe(typescript({
            noImplicitAny: true
        }))
        .pipe(gulp.dest(config.outjsPath))
})

gulp.task('babel', function () {
    return gulp.src(config.outjsPath + '/**/*')
        .pipe(babel({//编译ES6
            presets: ["@babel/env"],
            plugins: ['@babel/transform-runtime']
        }))
        .pipe(gulp.dest(config.outjsPath))
})

gulp.task('eslint', function () {
    return gulp.src(config.outjsPath + '/**/*')
        // .pipe(
        //     gulpif(
        //         config.condition, eslint({
        //             rules: {
        //                 "no-debugger": 2,
        //                 "no-console": 2
        //             },
        //             fix: true
        //         }),
        //         eslint()
        //     )
        // )
        // .pipe(eslint.format())
        // .pipe(eslint.failAfterError())
        .pipe(gulp.dest(config.outjsPath))
        .pipe(reload({ stream: true }));
});

gulp.task('jsUglify', (done) =>{
    if (config.condition) {
        return gulp.src([config.outjsPath + '/**/*'])
        .pipe(uglify({
            warnings:true,
            compress:{
                drop_console:true,
                keep_infinity:true,
                toplevel:true
            },
            mangle: {toplevel: true},
            toplevel:true,
            ie8:true
        }))
        .pipe(rev())
        .pipe(rev.manifest({ merge: true }))
        .pipe(gulp.dest(config.outrevPath))
    } else {
        done();
    }
})

gulp.task('js', gulp.series('jsConcat','typescript','babel','eslint','jsUglify'));