'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function () {
  gulp.src('./app/src/style/style.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./app/dist/'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./app/src/style/*.sass', ['sass']);
});
