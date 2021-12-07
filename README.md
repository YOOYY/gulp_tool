# 简介
这是一个基于gulp构建的前端自动化工具，它主要有2种用途：
码代码时：
    1.创造一个模拟后端环境,拦截ajax请求并返回假数据,实时编译scss,pug以及js  
    2.自动刷新页面  
    3.同一局域网设备可以访问页面并同步页面  
编译debug版本文件  
    1.生成雪碧图  
    2.pug转html,html检查  
    3.scss转css,css检查  
    4.合并js,js检查  
    4.提交git  
编译build版本文件  
    1.压缩图像  
    2.html压缩,添加版本号  
    3.清理无用css,添加浏览器前缀,css压缩  
    4.js压缩  
-----
# 约定:
1.所有原始文件放在app目录下  
2.雪碧图文件夹以$_为开头  
3.输出生产环境文件夹为build  
4.输出开发环境文件夹为debug  
5.版本文件夹为rev  
6.html文件中必须使用&nbsp来代替空格来输出一个空格的间距.  
-----
# 工作流程流程:
0.建立github仓库  
1.接收psd文件,备份psd文件;  
2.Ps处理,转换成画板方便标注,标记需要导出的图层,ps生成图像资源输出切图,用pxcook标注;  

图像处理:  
3.将需要生成雪碧图的png图片放入以$_为开头命名的文件夹中  
4.生成雪碧图到debug/img目录  
5.编写pug,scss,js  

# 技术栈
1.[node](http://nodejs.cn/)  
    小部分文件检测功能用到了node   
2.[npm](https://www.npmjs.com/search?q=keywords:gulpplugin)  
    依赖包安装工具,建议全局安装,节省空间  
    1.npm config set prefix "D:\nodejs\node_global"(末尾不要加/,否则npm命令提示找不到命令)  
    2.npm config set cache "D:\nodejs\node_cache"  
    3.环境变量Path:D:\nodejs\node_global  
    4.环境变量NODE_PATH:D:\nodejs\node_global\node_modules  
    5.重启电脑  
2.[gulp](https://www.gulpjs.com.cn/)  
    前端打包工具包括gulp,grunt,wepack.  
    对于小型项目而言,gulp和grunt任选其一,而wepack基本上是构建大型项目必学的  
3.[tinpng](https://tinypng.com/)  
    图片压缩工具  
    因为网络的原因,gulp的tinpng插件比网站直接压缩慢得多  
4.[gulp.spritesmith](https://www.npmjs.com/package/gulp.spritesmith)  
    css模板如下(https://www.jianshu.com/p/e5a408e0df34):  
        gulp.spritesmith\node_modules\spritesheet-templates\lib\spritesheet-templates.js  
            176:px[key] = item[key] + 'px'; =>        
                if(item[key] !== 0){  
                    px[key] = (item[key]/100) + 'rem';  
                }else{  
                    px[key] = 0;  
                }  
        gulp.spritesmith\node_modules\spritesheet-templates\lib\templates\scss.template.handlebars  
            89:background-image: url(#{$sprite-image}) => background-image: url($imgUrl+#{$sprite-image}) imgUrl为引入scss文件时外部传入的图片路径  
            91 添加:  
            @mixin sprite-size($sprite){  
                $sprite-total-width: nth($sprite,7);  
                $sprite-total-height: nth($sprite,8);  
                background-size:$sprite-total-width $sprite-total-height;  
            }  
            103 添加:  
                @include sprite-size($sprite);  
    版本插件修改(https://www.jianshu.com/p/934ca1a5f189):  
        node_modules\gulp-rev\index.js  
            135:manifest[originalFile] = revisionedFile; => manifest[originalFile] = originalFile + '?v=' + file.revHash;  
        node_modules\rev-path\index.js  
            9:return modifyFilename(pth, (filename, ext) => `${filename}-${hash}${ext}`); => return modifyFilename(pth, (filename, ext) => `${filename}${ext}`)  
            17:return modifyFilename(pth, (filename, ext) => filename.replace(new RegExp(`-${hash}$`), '') + ext); => return modifyFilename(pth, (filename, ext) => filename + ext);  
        node_modules\gulp-rev-collector\index.js  
            40:var cleanReplacement =  path.basename(json[key]).replace(new RegExp( opts.revSuffix ), '' ); => var cleanReplacement =  path.basename(json[key]).split('?')[0];  
        node_modules\gulp-rev-collector\index.js  
            172:regexp: new RegExp( prefixDelim + pattern, 'g' ) =>regexp: new RegExp( prefixDelim + pattern + '(\\?v=\\w{10})?', 'g' )  
5.[pug|jade](https://pug.bootcss.com/api/getting-started.html)  
    便于编写html的模板语言,复用html代码  
6.[gulp-pug-linter](https://www.npmjs.com/package/gulp-pug-linter)  
    pug检查工具  
    规则文档 https://github.com/pugjs/pug-lint/blob/master/docs/rules.md  
7.[gulp-htmllint](https://www.npmjs.com/package/gulp-htmllint)  
    html检查工具  
    规则文档 https://github.com/htmllint/htmllint/wiki/Options  
8.[htmlmin](https://github.com/kangax/html-minifier)  
    html压缩工具  
6.[sass](https://www.sass.hk/)  
    sass和less任选其一  
7.[stylelint](https://stylelint.io/user-guide/rules)  
    css检查工具  
7.[eslint](https://eslint.cn/)  
    es检查工具  
7.[git](https://www.liaoxuefeng.com/wiki/896043488029600)  
    版本管理  
    如果项目根目录下没有.git文件,默认走的是项目关联空仓库的流程,所以如果仓库这时有文件存在的情况下会报错,可以删除.git文件夹走gulp gitClone流程,还是不行就git命令下看吧  
8.[browser-sync](http://www.browsersync.cn/docs/gulp/)  
    自动刷新浏览器,而且同一局域网下能够浏览项目,屏幕同步滚动  
10.[mock.js](http://mockjs.com/)  
    假数据模拟  

# 考虑  
    因为现在的工作主要是从接收psd文件到输出静态页面,用ajax与后端交换数据,而我也一直想规范自己的前端流程,所以就有了这个东西.  

    首先,这套东西主要是用来做简单的静态网页,而且暂时也没有学习webpack,所以构建工具选用的是简单容易上手的gulp,对于js的处理也只是简单的合并文件,之所以不用browerify是因为我觉得这种项目的js复杂程度不高,require的方式反而会加大js复杂度,那还不如直接使用webpack来构建项目.正是因为这样的原因,所以babel无法转译es6的api(因为需要require js文件),es6的语法在这里是不能用的.  

    其次,个人建议是npm全局安装,这样就不用npm install,而且不用担心gulp-rev的代码被更改,虽然依赖包没办法更新到最新版本,但影响不大.  

    工具中添加了对html,css的校验,但是并没有对scss和pug进行校验,scss和pug的校验主要依赖编辑器,但可能近期校验的报错会很多,因为没有实际测试过好坏,所以很多校验规则需要去除.  

    本来想添加类似于wepack的tree shaking功能,但是没有在gulp上找到类似插件  

// gulp init  
// gulp gitAdd gulp gitCommit gulp gitPull  
// git pull origin master  
// refusing to merge unrelated histories  
// 修改文件  
// git pull origin master --allow-unrelated-histories  
// Please commit your changes or stash them before you merge.  
// 合并冲突  
// gulp gitAdd  
// git commit -a  

// Please move or remove them before you merge.  

gulp-base64修改  
encode.js   
21 var rImages = /([\s\S]*?)((?:(?:src\s*=\s*|url)[\'|\"|\(])([^>\s)]+)[\'|\"|\)])(?!\s*[;,>]?\s*\/\*\s*base64:skip\s*\*\/)|([\s\S]+)/img;  
136 var url = group[2].replace(group[3],resp);  

文件需要完全匹配才能更换缓存  