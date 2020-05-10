var gulp = require("gulp"),
    path = require('path'),
    fs = require('fs'),
    merge = require('merge-stream'),
    gulpif = require('gulp-if'),
    data = require('gulp-data'),

    spritesmith = require('gulp.spritesmith'),
    tinypng = require('gulp-tinypng'),

    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    styleLint = require('gulp-stylelint'),
    //2个pie

    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    eslint = require('gulp-eslint'),
             
    browserSync = require('browser-sync'),
    reload = browserSync.reload,

    git = require('gulp-git'),
    clean = require('gulp-clean'),
    config = require('./config.json');
    
    //图片配置
    var rootPath = 'app',
    imgPath = "./" + rootPath + "/imgs",
    prefix = config.prefix,
    scssPath = "./" + rootPath + "/scss",
    htmlPath = "./" + rootPath + "/pug",
    jsPath = "./" + rootPath + "/js",
    gitUrl = config.gitUrl,
    
    condition = (process.argv[2] === 'build' ? true : false),
    gitLog = (process.argv[3] || (condition?'build':'fixed bugs')),
    outPath = (condition === true ? "build" : "debug"),
    
    outhtmlPath = outPath + "/html",
    outcssPath = outPath + "/css",
    outjsPath = outPath + "/js",
    outimgPath = outPath + "/imgs",
    outrevPath = outPath + "/rev",
    gitinit = false;


//清理缓存
gulp.task('cleanDir', function (done) {
    if (fs.existsSync(outPath)) {
        return gulp.src(outPath).pipe(clean());
    } else {
        done();
    }
}) 
 
//图片处理

//复制文件夹作为操作文件夹
gulp.task('copyDir', function () {
return gulp.src(imgPath + '/**/* ')
    .pipe(gulp.dest(outimgPath))
})

//将带有$_前缀的文件夹中的png文件合并成雪碧图
gulp.task('sprites', function (done) {
    //获取生成雪碧图的目录
    var folders = getFolders(outimgPath, prefix);
    if (folders.length == 0) {
        console.log('没有需要生成雪碧图的文件夹');
        done();
    }

    var tasks = folders.map(function (folder) {
        var str = folder.replace(outimgPath.replace('/', '\\'), ''),
            namedir = str.substr(0, str.lastIndexOf('\\') + 1),
            name = str.substr(str.search(prefix) + str.match(prefix)[0].length);
        return gulp.src(path.join(folder, '/*.png'))
            .pipe(spritesmith({
                imgName: '.' + namedir + name + '.png',//保存合并后图片的地址
                imgPath:(namedir + name + '.png').replace(/\\/g,'/').substr(1), // 手动指定路径, 会直接出现在background属性的值中
                cssName: '../../' + rootPath + '/scss/sprites/' + name + '.scss',//保存合并后对于css样式的地址
                padding: 5,//合并时两个图片的间距
                algorithm: 'binary-tree',//生成模式
                // cssFormat:'css'
                //cssTemplate: "css/handlebarsStr.css"//
            }))
            .pipe(gulp.dest(outimgPath));
    });

    return merge(tasks);
})

gulp.task('cleanSprites', function (done) {
    var folders = getFolders(outimgPath, prefix);
    if (folders.length == 0) {
        done();
    } else {
        return gulp.src(folders).pipe(clean());
    }
})

//有损压缩图片
gulp.task('tinypng', function (done) {
    if (condition) {
        return gulp.src(outimgPath + '/**/*')
            .pipe(tinypng('L8AJPOaiMhx8bO2jozWdWi4T5WZIZiSk'))
            .pipe(rev())
            .pipe(gulp.dest(outimgPath))
            .pipe(rev.manifest({ merge: true }))
            .pipe(gulp.dest(outrevPath));
    } else {
        done();
    }
});

gulp.task('img', gulp.series('copyDir', 'sprites', 'cleanSprites', 'tinypng'));

//清理rev版本文件
gulp.task('cleanRev', (done) => {
    if (condition) {
        return gulp.src(outrevPath).pipe(clean());
    } else {
        done();
    }
});

gulp.task('html', gulp.series('pug', 'revCollector', 'uncss','cleanRev'))

//css
gulp.task('css', function () {
    var processors = [        

    ];
    return gulp.src(scssPath + '/*.scss')
        .pipe(sass().on('error', sass.logError).on('error',function(){
            throw('scss转css错误');
        }))
        // .pipe(styleLint({
        //     failAfterError: true,
        //     // 输出结果
        //     reporters: [
        //         { formatter: 'verbose', console: true },
        //     ]
        // }))
        .pipe(postcss(processors))
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

//js
gulp.task('concat', function (done) {
    var taskArr = [];
    if (fs.existsSync(outPath)) {
        taskArr.push(
            gulp.src(jsPath + '/payment/*.js')
                .pipe(concat('payment.js'))
                .pipe(gulp.dest(outjsPath))
        );
    }

    if (fs.existsSync(outPath)) {
        taskArr.push(
            gulp.src(jsPath + '/sidepage/*.js')
                .pipe(concat('sidepage.js'))
                .pipe(gulp.dest(outjsPath))
        );
    }

    if (fs.existsSync(outPath)) {
        taskArr.push(
            gulp.src(jsPath + '/index/*.js')
                .pipe(concat('index.js'))
                .pipe(gulp.dest(outjsPath))
        );
    }
    if(taskArr.length === 0){
        done();
    }
    return merge(taskArr);
});

gulp.task('eslint', function () {
    return gulp.src(outjsPath + '/**/*.js')
        .pipe(
            gulpif(
                condition, eslint({
                    rules: {
                        "no-debugger": 2,
                        "no-console": 2
                    },
                    fix: true
                }),
                eslint()
            )
        )
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        // .pipe(babel({//编译ES6
        //     presets: ["@babel/env"],
        //     plugins: ['@babel/transform-runtime']
        // }))
        .pipe(
            gulpif(
                condition, uglify()
            )
        )
        .pipe(
            gulpif(
                condition, rev()
            )
        )
        .pipe(gulp.dest(outjsPath))
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

gulp.task('js', gulp.series('concat', 'eslint'));

//git

gulp.task('init', function (done) {
    if (fs.existsSync('.git')) {
        console.log('init运行了');
        done();
    } else {
        gitinit = true;
        return git.init(function (err) {
            if (err) throw err;
        });
    }
})

gulp.task('addremote', function (done) {
    if (gitinit) {
        return git.addRemote('origin', gitUrl, function (err) {
            if (err) throw err;
        });
    } else {
        console.log('addremote运行了');
        done();
    }
});

gulp.task('pull', function (done) {
    if (gitinit) {
        done();
    } else {
        console.log('pull运行了');
        return git.pull('origin', 'master', { args: '--rebase' }, function (err) {
            if (err) {
                var error = 'pull出错！可以尝试运行git pull origin master指令';
                console.log(error);
                throw error;
            };
        });
    }
});

gulp.task('clone', function(){
    git.clone(gitUrl, function (err) {
      if (err) throw err;
    });
});

gulp.task('add', function () {
    return gulp.src(config.git)
        .pipe(git.add())
});

gulp.task('commit', function () {
    return gulp.src(config.git)
        .pipe(git.commit(gitLog))
});

gulp.task('push', function (done) {
    git.push('origin', 'master',{ args: '-u' },function (err) {
        if (err) throw err;
    });
    done();
});

gulp.task('git', gulp.series('init','addremote', 'add', 'commit', 'pull', 'push'));
gulp.task('gitClone', gulp.series('init', 'add', 'commit', 'clone', 'push'));

//服务器
gulp.task('serve', function () {
    browserSync({
        server: {
            baseDir: 'debug/html',
            directory: true,
            index: ["index.html"],
            tunnel: true,
            middleware: mock.data()
        }
    });
    gulp.watch(htmlPath + '/**/*.pug', gulp.series('html'));
    gulp.watch([scssPath + '/**/*.scss', '!' + scssPath + '/sprites/**'], gulp.series('css'));
    gulp.watch(jsPath + '/**/*.js', gulp.series('js'));
});

//打包
gulp.task('debug', gulp.series('cleanDir', 'img', 'css', 'js', 'html', 'git'));
gulp.task('build', gulp.series('cleanDir', 'img', 'css', 'js', 'html', 'git'));
gulp.task('default', gulp.series('cleanDir', 'img', 'css', 'js', 'html', 'git'));

function getFolders(dir, prefix) {
    var imgdirArr = [];
    findfile(dir, imgdirArr, prefix);
    return imgdirArr;

    function findfile(dir, imgdirArr, prefix) {
        fs.readdirSync(dir)
            .map(function (file) {
                var filePath = path.join(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    if (file.match(prefix)) {
                        imgdirArr.push(filePath);
                    } else {
                        findfile(filePath, imgdirArr, prefix);
                    }
                }
            });
    }
}