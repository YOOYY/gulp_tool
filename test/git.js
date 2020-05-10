var gulp = require("gulp"),
    fs = require('fs'),
    git = require('gulp-git'),
    config = require('../gulp/config.js'),
    gitinit = false,
    gitLog = (process.argv[3] || (config.condition?'build':'fixed bugs'));

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
            var error = 'pull出错！可以尝试运行git pull origin master指令';
            console.log(error);
            throw error;
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