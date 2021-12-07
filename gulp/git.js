var fs = require("fs"),
    gulp = require("gulp"),
    git = require('gulp-git'),
    config = require('./config'),
    gitLog = (process.argv[3] || (config.condition ? 'build' : 'fixed bugs')),
    branch = config.condition ? 'build' : 'master',
    gitinit = !fs.existsSync('.git');
    
gulp.task('gitInit', function () {
    return git.init(function (err) {
        if (err) throw err;
    });
})

gulp.task('cbranch', function () {
    return git.branch('build', function (err) {
        if (err) throw err;
    });
});

gulp.task('checkout', function (done) {
    git.checkout(branch, function (err) {
        if (err) throw err;
        done()
    });
});

gulp.task('gitAddremote', function () {
    return git.addRemote('origin', config.gitUrl, function (err) {
        if (err) throw err;
    });
});

gulp.task('gitPull', function () {
    return git.pull('origin', branch, function (err) {
        if (err) throw err;
    });
});

gulp.task('gitAdd', function () {
    return gulp.src(config.git, {
            allowEmpty: true
        })
        .pipe(git.add())
});

gulp.task('gitCommit', function () {
    return gulp.src(config.git, {
            allowEmpty: true
        })
        .pipe(git.commit(gitLog))
});

gulp.task('gitPush', function (done) {
    return git.push('origin', branch, function (err) {
        if (err) throw err;
        done();
    });
});

if (gitinit) {
    gulp.task('git', gulp.series('gitInit', 'gitAddremote', 'gitAdd', 'gitCommit', 'gitPush','cbranch'))
} else {
    gulp.task('git', gulp.series('checkout', 'gitPull', 'gitAdd', 'gitCommit', 'gitPush'))
}