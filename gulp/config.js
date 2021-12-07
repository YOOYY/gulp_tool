let path  = require('path'),
    pathJoin = path.join,
    rootPath = process.cwd(),
    fs = require('fs'),

    appPath = pathJoin(rootPath, 'app'),
    imgPath = pathJoin(appPath, 'imgs'),
    pugPath = pathJoin(appPath, 'pug'),
    dataPath = pathJoin(pugPath, 'data'),
    scssPath = pathJoin(appPath, 'scss'),
    jsPath = pathJoin(appPath, 'js'),
    fontPath = pathJoin(appPath, 'fonts'),
    toolPath = pathJoin(__dirname,'../'),
    templatePath = pathJoin(toolPath,'template'),
    mock = require(pathJoin(appPath,'gulp/mock.js')),

    //这里的配置应该改
    appConfig = JSON.parse(fs.readFileSync(pathJoin(appPath,'config.json'))),
    gulpConfig = appConfig.gulp,
    outHtmlDir = gulpConfig.outHtmlDir || false, //修改html文件生成中间目录
    jsConcatDir = gulpConfig.jsConcatDir || ['base'], //数组成员混入config配置
    prefix = gulpConfig.prefix || "$_",
    ext = gulpConfig.ext || "&",
    git = ['./app','README.md','*(debug|build)'], //git上传目录
    gitUrl = gulpConfig.gitUrl || '', //项目git地址
    condition = (process.argv[2] === 'build' ? true : false), //环境判断
    // condition = true,
    browsers = gulpConfig.browsers || [ //css浏览器兼容
        'last 2 versions',
        '> 1% in CN',
        'ie >= 8',
        'maintained node versions',
        'not dead'
    ],

    outPath = pathJoin(rootPath, (condition ? 'build' : 'debug')), //输出文件夹目录
    outImgPath = pathJoin(outPath, 'imgs'),
    outHtmlPath = outPath,
    outdataPath = pathJoin(outPath, 'data'),
    outcssPath = pathJoin(outPath, 'css'),
    outjsPath = pathJoin(outPath, 'js'),
    outFontPath = pathJoin(outPath, 'fonts'),
    outrevPath = pathJoin(outPath, 'rev'),

    server = { //服务器配置
        baseDir: outHtmlPath,
        directory: false,
        index: ["index.html"],
        tunnel: true,
        middleware: mock.data()
    },

    getDirs = function(dir, prefix) {
        var dirArr = [];
        findfile(dir, dirArr, prefix);
        return dirArr;
    
        function findfile(dir, dirArr, prefix) {
            if (!fs.statSync(dir).isDirectory()){
                return false;
            };
            fs.readdirSync(dir)
            .map(function (file) {
                var filePath = pathJoin(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    if (file.includes(prefix)) {
                        dirArr.push(filePath);
                    } else {
                        findfile(filePath, dirArr, prefix);
                    }
                }
            });
        }
    };
    console.log(process.cwd());
exports = module.exports = {
    appPath,
    imgPath,
    pugPath,
    dataPath,
    scssPath,
    jsPath,
    fontPath,

    prefix,
    ext,
    git,
    gitUrl,
    condition,
    browsers,

    outPath,
    outImgPath,
    outHtmlPath,
    outdataPath,
    outcssPath,
    outjsPath,
    outFontPath,
    outrevPath,
    getDirs,
    server,
    outHtmlDir,
    jsConcatDir,
    appConfig,
    gulpConfig,
    templatePath
}