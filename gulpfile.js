var fs = require('fs'),
    vm = require('vm'),
    merge = require('deeply'),
    gulp = require('gulp'),
    rjs = require('gulp-requirejs'),
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
    return rjs(requireJsOptimizerConfig)
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
    return gulp.src('./src/index.html')
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

gulp.task('default', function(callback) {
    return runSequence(['html', 'js', 'css', 'cname'], callback);
});
