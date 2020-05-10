
//清理缓存
gulp.task('cleanDir', function (done) {
    if (fs.existsSync(outPath)) {
        return gulp.src(outPath).pipe(clean());
    } else {
        done();
    }
}) 
 
//图片处理
//可以考虑一个base64插件
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