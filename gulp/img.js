const { src:gSrc, dest:gDest, series:gSeries, task:gTask } = require('gulp'),
    {
        join:pJoin,
        dirname:pDirname,
        basename:pBasename,
        relative:pRelative,
        format:pFormat,
        posix:pPosix
    } = require('path'),
    merge = require('merge-stream'),
    clean = require('gulp-clean'),
    spritesmith = require('gulp.spritesmith'),
    tinypng = require('gulp-tinypng'),
    rev = require('gulp-rev'),
    reload = require('browser-sync').reload,
    {
        imgPath,
        scssPath,
        outImgPath,
        outrevPath,
        templatePath,
        getDirs,
        condition,
        gulpConfig
    } = require('gulp-tool/gulp/config'),

    prefix = gulpConfig.prefix || '$_'; //雪碧图文件夹标志
let spritesDirs = [],
    needSprite = false;

function copyImgDir(){
    return gSrc(pJoin(imgPath, '**', '*'))
        .pipe(gDest(outImgPath))
}

//将带有$_前缀的文件夹中的图片文件合并成雪碧图
function sprites(done) {
    spritesDirs = getDirs(outImgPath, prefix);
    needSprite = !!spritesDirs.length;
    if (!needSprite) {
        done();
    }

    var tasks = spritesDirs.map(function (spritesDir) {
        var tempstr = spritesDir.replace(outImgPath,''),
            dirName = pJoin('./',pDirname(tempstr)),
            baseName = pBasename(tempstr).replace(prefix, '');

        return gSrc(pJoin(spritesDir, '/*.{png,jpg}'))
            .pipe(spritesmith({
                imgName: pFormat({ //生成后的sprites图片路径
                    dir: dirName,
                    name: baseName,
                    ext: '.png'
                }),
                cssName: pFormat({ //相对于生成sprites的文件夹
                    dir:pRelative(outImgPath,pJoin(scssPath, '_sprites', dirName)),
                    name:baseName,
                    ext:'.scss'
                }),
                imgPath: pPosix.format({ // css中sprites引入路径
                    dir:dirName,
                    name:baseName,
                    ext:'.png'
                }),
                padding: 5,//合并时两个图片的间距
                algorithm: 'binary-tree',//生成模式
                cssFormat: 'scss',
                cssTemplate: pJoin(templatePath, "/sprites/template.handlebars"),
                cssHandlebarsHelpers:{
                    'rename':function (dir,name) {
                        return dir.replace('.png', '').replace('/', '_') + '_' + name;
                    }
                }
            }))
            .pipe(gDest(outImgPath));
    });
    return merge(tasks);
}

function cleanSprites(done) {
    if (!needSprite) {
        done();
    } else {
        return gSrc(spritesDirs).pipe(clean());
    }
}

//有损压缩图片
function tinyImg(done) {
    if (condition) {
        return gSrc(outImgPath + '/**/*.{png,jpg}')
            .pipe(tinypng('L8AJPOaiMhx8bO2jozWdWi4T5WZIZiSk'))
    } else {
        done();
    }
}

function imgrev(done){
    if (condition) {
        return gSrc([outImgPath + '/**/*'])
        .pipe(rev())
        .pipe(rev.manifest({ merge: true }))
        .pipe(gDest(outrevPath))
    } else {
        done();
    }
}

gTask('img',gSeries(copyImgDir, sprites, cleanSprites, tinyImg, imgrev))