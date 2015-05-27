var fs = require('fs'),
    vm = require('vm'),
    sh = require('sync-exec'),
    merge = require('deeply'),
    gulp = require('gulp'),
    rjs = require('gulp-requirejs-optimize'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    replace = require('gulp-replace'),
    uglify = require('gulp-uglify'),
    insert = require('gulp-insert'),
    htmlreplace = require('gulp-html-replace'),
    streamqueue = require('streamqueue'),
    es = require('event-stream'),
    runSequence = require('run-sequence'),
    requireJsRuntimeConfig = vm.runInNewContext(fs.readFileSync('src/js/requirejs-config.js') + '; require;');
    requireJsOptimizerConfig = merge(requireJsRuntimeConfig, {
        out: 'scripts.js',
        baseUrl: './src',
        name: 'js/startup',
        optimize: 'none',
        paths: {
            requireLib: 'bower_components/requirejs/require'
        },
        include: [
            'requireLib',
            'components/navBar/navBar',
            'components/issueList/issueList',
            'components/loginStatus/loginStatus',
            'components/triageEditor/triageEditor',
            'text!components/progressPanel/progressPanel.html'
        ]
    });

gulp.task('js', function () {
    // The current version of gulp-requirejs-optimize doesn't work with only an RJS config specifying files to include.
    // It does nothing unless you also feed it at least one input file. Arbitrarily send 'startup.js' to it.
    return gulp.src('gulpfile.js')
        .pipe(rjs(requireJsOptimizerConfig))
        .pipe(insert.append('\nrequire(["js/startup"]);'))
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(gulp.dest('./deploy/'));
});

gulp.task('css', function () {
    var bowerCss = gulp.src('src/bower_components/components-bootstrap/css/bootstrap.min.css')
            .pipe(replace(/url\((')?\.\.\/fonts\//g, 'url($1fonts/')),
        appCss = gulp.src('src/css/*.css'),
        emitCss = streamqueue({ objectMode: true }, bowerCss, appCss)
            .pipe(concat('css.css'))
            .pipe(gulp.dest('./deploy/')),
        emitFonts = gulp.src('./src/bower_components/components-bootstrap/fonts/*', { base: './src/bower_components/components-bootstrap/' })
            .pipe(gulp.dest('./deploy/'));
    return es.concat(emitCss, emitFonts);
});

gulp.task('html', function() {
    return gulp.src('./src/*.html')
        .pipe(htmlreplace({
            'css': 'css.css',
            'js': 'scripts.js'
        }))
        .pipe(gulp.dest('./deploy/'));
});

gulp.task('cname', function() {
    return gulp.src('./src/CNAME')
        .pipe(gulp.dest('./deploy/'));
});

gulp.task('clean', function() {
    return gulp.src('./deploy', { read: false })
        .pipe(clean());
});

gulp.task('publish', function() {
    // This task commits the current contents of the 'deploy' directory to the 'gh-pages' branch.
    // Run this, and then push gh-pages to GitHub - that will update http://triage.knockoutjs.com/
    // Don't edit gh-pages by any other means, or your changes will later be overwritten.
    // Technique based on http://happygiraffe.net/blog/2009/07/04/publishing-a-subdirectory-to-github-pages/
    var sourceDirectory = 'deploy',
        targetBranch = 'gh-pages',
        parentSha = sh.exec('git show-ref -s refs/heads/' + targetBranch).stdout.split(/\n/)[0],
        deploySha = sh.exec('git ls-tree -d HEAD ' + sourceDirectory).stdout.split(/[\s\t]/)[2],
        commitCommand = 'git commit-tree ' + deploySha + ' -p ' + parentSha + ' -m \'Updating "' + targetBranch + '" to match "' + sourceDirectory + '" directory\'',
        commitResult = sh.exec(commitCommand),
        commitSha = commitResult.stdout.replace(/\n/, '');
    if (commitResult.code !== 0) {
        throw new Error('git commit-tree error: ' + commitResult.stdout);
    }
    var updateRefCommand = 'git update-ref refs/heads/' + targetBranch + ' ' + commitSha,
        updateRefResult = sh.exec(updateRefCommand);
    if (updateRefResult.code !== 0) {
        throw new Error('git update-ref error: ' + updateRefResult.stdout);
    }
    console.log('Updated ' + targetBranch + ' to ' + commitSha);
});

gulp.task('default', function(callback) {
    return runSequence(['html', 'js', 'css', 'cname'], function() {
        callback();
        console.log('\nUpdated the \'deploy\' directory. To publish:');
        console.log(' - gulp publish');
        console.log(' - git push origin gh-pages\n');
    });
});
