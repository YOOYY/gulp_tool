let fs = require('fs'),
    gulp = require("gulp"),
    merge = require('merge-stream'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    path = require('path'),
    rev = require('gulp-rev'),
    config = require("./config");

gulp.task('font', function(done){
    if(fs.existsSync(config.appPath + "/fonts")){
        var runTimestamp = Math.round(Date.now()/1000);
        var tasks = fs.readdirSync(config.fontPath).map(function (file) {
            var {name:fileName,dir:dirName} = path.parse(file);
            return gulp.src(path.join(config.fontPath, file), {base: './'})
            .pipe(iconfontCss({
                fontName: fileName,
                path: path.join(config.templatePath, "/fonts/template.scss"),
                targetPath: path.format({ //相对于字体生成的路径
                    dir:path.relative(config.outFontPath,path.join(config.scssPath, '_fonts', dirName)),
                    name:fileName,
                    ext:'.scss'
                })
            }))
            .pipe(iconfont({
                fontName: fileName, // 具体设置见 https://github.com/nfroidure/svgicons2svgfont#svgicons2svgfontoptions
                prependUnicode: true,
                formats: ['ttf', 'eot', 'woff','woff2','svg'],
                timestamp: runTimestamp
            }))
            // .on('glyphs', function(glyphs, options) {
            //     console.log(glyphs, options);
            // })
            .pipe(gulp.dest(config.outFontPath));
        });

        return merge(tasks);
    }else{
        done();
    }
});


gulp.task('fontrev', function(done){
    if (config.condition) {
        return gulp.src([config.outFontPath + '/**/*'])
        .pipe(rev())
        .pipe(rev.manifest({ merge: true }))
        .pipe(gulp.dest(config.outrevPath))
    } else {
        done();
    }
})