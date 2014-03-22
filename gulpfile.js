var gulp = require('gulp'),
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
    requireJsConfig = {
        out: "scripts.js",
        baseUrl: ".",
        name: "js/startup",
        include: [
            "requireLib",
            "components/navBar/navBar",
            "components/issueList/issueList",
            "components/loginStatus/loginStatus",
            "components/triageEditor/triageEditor",
            "text!components/progressPanel/progressPanel.html"
        ],
        paths: {
            "requireLib":   "bower_components/requirejs/require",
            "jquery":       "bower_components/jquery/dist/jquery",
            "bootstrap":    "bower_components/components-bootstrap/js/bootstrap.min",
            "crossroads":   "bower_components/crossroads/dist/crossroads.min",
            "hasher":       "bower_components/hasher/dist/js/hasher.min",
            "signals":      "bower_components/js-signals/dist/signals.min",

            "text": "js/lib/require.text",
            "knockout": "js/lib/knockout-3.1.0",
            "knockout-components": "js/lib/knockout-components",
            "knockout-customElements": "js/lib/knockout-customElements",
            "knockout-mapping": "js/lib/knockout.mapping-latest",
            "knockout-batch": "js/lib/knockout-batch",
        },
        shim: {
            "bootstrap": { deps: ["jquery"] }
        }
    };

gulp.task('js', function () {
    return rjs(requireJsConfig)
        .pipe(insert.append('\nrequire(["js/startup"]);'))
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(gulp.dest('./deploy/'));
});

gulp.task('css', function () {
    var bowerCss = gulp.src('bower_components/components-bootstrap/css/bootstrap.min.css')
            .pipe(replace(/url\((')?\.\.\/fonts\//g, 'url($1fonts/')),
        appCss = gulp.src('css/*.css'),
        emitCss = streamqueue({ objectMode: true }, bowerCss, appCss)
            .pipe(concat('css.css'))
            .pipe(gulp.dest('./deploy/')),
        emitFonts = gulp.src('./bower_components/components-bootstrap/fonts/*', { base: './bower_components/components-bootstrap/' })
            .pipe(gulp.dest('./deploy/'));
    return es.concat(emitCss, emitFonts);
});

gulp.task('html', function() {
    return gulp.src('./index.html')
        .pipe(htmlreplace({
            'css': 'css.css',
            'js': 'scripts.js'
        }))
        .pipe(gulp.dest('./deploy/'));
});

gulp.task('clean', function() {
    return gulp.src('./deploy', { read: false })
        .pipe(clean());
});

gulp.task('default', function(callback) {
    return runSequence(['html', 'js', 'css'], callback);
});
