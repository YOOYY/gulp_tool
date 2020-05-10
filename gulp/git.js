var fs = require("fs"),
    gulp = require("gulp"),
    git = require('gulp-git'),
    config = require('./config'),
    gitLog = (process.argv[3] || (config.condition?'build':'fixed bugs')),
    branch = config.condition?'build':'master';

gulp.task('gitInit', function () {
    return git.init(function (err) {
        if (err) throw err;
    });
})

gulp.task('cbranch', function(){
    return git.branch('build', function (err) {
      if (err) throw err;
    });
});

gulp.task('checkout', function(done){
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
    return git.pull('origin', 'build', function (err) {
        if (err) throw err;
    });
});

gulp.task('gitAdd', function () {
    return gulp.src(config.git,{allowEmpty:true})
        .pipe(git.add())
});

gulp.task('gitCommit', function () {
    return gulp.src(config.git,{allowEmpty:true})
        .pipe(git.commit(gitLog))
});

gulp.task('gitPush', function (done) {
    return git.push('origin', branch, function (err) {
        if (err) throw err;
        done();
    });
});

gulp.task('git',function(done){
    // if(!fs.existsSync('.git')){
    //     _branch = branch;
    //     branch = 'master';
    //     return gulp.series('gitInit', 'gitAddremote', 'gitAdd', 'gitCommit', 'gitPush','cbranch',function(){
    //         branch = 'build';
    //         gulp.series('gitPushBuild',function(){
    //             branch = _branch;
    //             return gulp.series('checkout');
    //             done();
    //         });
    //     });
    // }else{
    //     return gulp.series('checkout','gitPull','gitAdd', 'gitCommit', 'gitPush');
    //     done();
    // }
    gulp.series('checkout','gitPull','gitAdd', 'gitCommit', 'gitPush');
    done();
})