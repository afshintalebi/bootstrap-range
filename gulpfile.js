// Base Gulp File
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    notify = require('gulp-notify'),
    browserSync = require('browser-sync'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    runSequence = require('run-sequence'),
    rename = require("gulp-rename"),
    argv = require('yargs').argv;

var isProduction = argv.production ? true : false,
    cssOutputStyle = isProduction ? 'compressed' : 'expanded',
    outputDir = './dist',
    sourceDir = './src',
    sassOutputDir = outputDir+'/css',
    jsOutputDir = outputDir+'/js';

var jsSources=[
        sourceDir + '/js/*.js',
    ],
    sassSources=[
        sourceDir + '/scss/bootstrap-range.scss',
    ],
    htmlSources=[
        sourceDir+'/*.html',
    ];

// Compile SCSS
gulp.task('sass', function () {
  return gulp.src(sassSources)
    .pipe(sass({
      // errLogToConsole: false,
      outputStyle: cssOutputStyle,
      // paths: [ path.join(__dirname, 'scss', 'includes') ]
    })
    .on("error", notify.onError(function(error) {
      return "Failed to Compile SCSS: " + error.message;
    })))
    .pipe(gulpif(isProduction, rename({suffix: ".min"})))
    .pipe(gulp.dest(sassOutputDir))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(notify('Sass sources compiled'));
});


// Copy & minify JS files
gulp.task('js', function() {
    return gulp.src(jsSources)
        .pipe(gulpif(isProduction, uglify()))
        .pipe(gulpif(isProduction, rename({suffix: ".min"})))
        .pipe(gulp.dest(jsOutputDir))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(notify('JS sources compiled'));
});

// Html preprocess
gulp.task('html', function() {
    gulp.src(htmlSources)
        .pipe(gulp.dest(outputDir))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(notify('Html sources compiled'));
});

// BrowserSync Task (Live reload)
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: outputDir
        }
    })
});

// Gulp Watch Task
gulp.task('watch', ['browserSync'], function () {
    gulp.watch(sassSources, ['sass']);
    gulp.watch(jsSources, ['js']);
    gulp.watch(htmlSources,['html']);
});

// Gulp Default Task
gulp.task('default', ['watch']);

// Gulp Build Task
gulp.task('build',[],function () {
    runSequence('sass','js','html');
});