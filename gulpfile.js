var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  map = require('map-stream'),
  autoprefixer = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  minifyCSS = require('gulp-minify-css'),
  webserver = require('gulp-webserver'),
  watch = require('gulp-watch'),
  uglify = require('gulp-uglify'),
  rename    = require('gulp-rename'),
  imagemin = require('gulp-imagemin'),
  clean = require('gulp-clean'),
  runSequence = require('run-sequence'); 

var myReporter = map(function (file, cb) {
  if (!file.jshint.success) {
    console.log('JSHINT fail in '+file.path);
    file.jshint.results.forEach(function (err) {
	err = err.error;
      if (err) {
        console.log(' '+file.path + ': line ' + err.line + ', col ' + err.character + ', code ' + err.code + ', ' + err.reason);
      }
    });
  }
  cb(null, file);
});

gulp.task('scripts', function() {
  gulp.src('app/scripts/prism.js')
    .pipe(gulp.dest('./dist/js'));

  gulp.src('app/scripts/site.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'))

  return gulp.src('app/scripts/soundpeek.js')
    // .pipe(jshint())
    // .pipe(myReporter)
    .pipe(uglify())
    .pipe(rename('soundpeek.min.js'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('images', function() {
  return gulp.src('app/images/*')
    .pipe(imagemin({
        progressive: true,
    }))
    .pipe(gulp.dest('./dist/images'));
});

gulp.task('html', function() {
  return gulp.src('app/index.html')
    .pipe(gulp.dest('./dist/'))
});

gulp.task('build', function(callback) {
  runSequence('clean',
               ['scripts', 'styles', 'images', 'html', 'watch'],
               'webserver',
               callback);
});

gulp.task('styles', function() {
  return gulp.src('app/styles/*.scss')
          .pipe(sass())
          .pipe(autoprefixer())
          .pipe(minifyCSS())
          .pipe(gulp.dest('./dist/css'));
});
gulp.task('webserver', function() {
  return gulp.src('./dist/')
    .pipe(webserver({
      open: true
    }));
});

gulp.task('clean', function () {
  return gulp.src('./dist', {read: false})
    .pipe(clean());
});

gulp.task('watch', function() {
  return gulp.watch(['./app/styles/*.scss', './app/index.html', './app/scripts/*.js'], ['styles', 'html', 'scripts']);
});

gulp.task('default', ['build']);


