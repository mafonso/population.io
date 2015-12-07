var gulp = require('gulp');
var jade = require('gulp-jade');
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var nib = require('gulp-stylus/node_modules/nib');
var sftp = require('gulp-sftp');
var runSequence = require('run-sequence');
var expectFile = require('gulp-expect-file');


sources = {
  data: [
    'data/populationio_countries/countries.csv',
    'data/populationio_countries/countries_topo.json',
  ],
  scripts: [
    'bower_components/momentjs/moment.js',
    'bower_components/jquery/dist/jquery.js',
    'bower_components/jquery-ui/jquery-ui.js',
    'bower_components/d3/d3.js',
    'bower_components/d3.slider/d3.slider.js',
    'bower_components/topojson/topojson.js',
    'vendor/d3.geo.projection.v0.min.js',
    'bower_components/lodash/dist/lodash.js',
    'bower_components/bowser/bowser.js',
    'bower_components/ics.js/ics.deps.min.js',
    'bower_components/ics.js/ics.js',
    'app/scripts/ga.js',

    'bower_components/angular/angular.js',
    'bower_components/angular-route/angular-route.js',
    'bower_components/angular-scroll/angular-scroll.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-easy-social-share/easy-social-share.js',
    'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    'bower_components/angular-cookies/angular-cookies.js',
    'bower_components/angular-resource/angular-resource.js',
    'bower_components/angular-ui-router/release/angular-ui-router.js',
    'bower_components/angular-sanitize/angular-sanitize.js',
    'bower_components/angular-translate/angular-translate.js',
    'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',

    'app/scripts/app.js',
    'app/scripts/controllers.js',
    'app/scripts/directives.js',
    'app/scripts/directives/*.js',
    'app/scripts/filters.js',
    'app/scripts/services.js',
    'app/scripts/services/*.js',
    'app/scripts/libs/*.js',
  ],
  templates: 'app/views/layouts/*.jade',
  docs: 'app/views/pages/*.jade',
  partials: 'app/views/partials/**/*.jade',
  stylus: ['app/stylus/**/*.styl'],
  style: [
      'bower_components/fontawesome/css/font-awesome.css',
      'app/stylus/main.styl'
  ],
  fonts: [
    'fonts/**',
    'bower_components/fontawesome/fonts/fontawesome-webfont.*'
  ],
  overwatch: [
      'dist/**/*.*',
      '!dist/celebrities/**',
      '!dist/assets/**'
  ],
  images: [
      'assets/sprite-icons.svg',
      'assets/user-female.png',
      'assets/user-male.png',
      'assets/favicon.png',
      'assets/wip.svg',
      'assets/browsers-sprite.png'
  ],
  maps: [
      'bower_components/angular-sanitize/angular-sanitize.min.js.map'
  ],
  translations: [
    'app/i18n/EN.json',
    'app/i18n/ES.json',
    'app/i18n/FR.json',
    'app/i18n/DE.json',
    'app/i18n/ZH.json'
  ]
};

var destinations = {
  scripts: 'dist/scripts/',
  docs: 'dist/',
  partials: 'dist/partials/',
  css: 'dist/css/',
  images: 'dist/images/',
  translations: 'dist/i18n/',
  fonts: 'dist/fonts/'
};

// server task
gulp.task('serve', function (event) {
  connect.server({
    root: destinations.docs,
    port: 1983,
    livereload: true,
    host: '0.0.0.0'
  });
  // sets up a livereload that watches for any changes in the root
  watch({glob: sources.overwatch})
  .pipe(connect.reload());
});

// data files task
gulp.task('data', function (event) {
  return gulp.src(sources.data)
  .pipe(expectFile(sources.data))
  .pipe(plumber())
  .pipe(gulp.dest('dist/data'));
});

// stylus task
gulp.task('stylus', function (event) {
  return gulp.src(sources.style)
  .pipe(expectFile(sources.style))
  .pipe(plumber())
  .pipe(stylus({use: nib()}))
  .pipe(concat('main.css'))
  .pipe(gulp.dest(destinations.css));
});

// stylus watch task for development
gulp.task('stylus:watch', function (event) {
  watch({glob: sources.stylus}, function (files) {
    gulp.src(sources.style)
    .pipe(plumber())
    .pipe(stylus({use: nib()}))
    .pipe(concat('main.css'))
    .pipe(gulp.dest(destinations.css));
  });
});

// scripts tasks
gulp.task('scripts', function (event) {
  return gulp.src(sources.scripts)
  .pipe(sourcemaps.init())
  .pipe(concat('main.js'))
  .pipe(uglify({mangle: false, drop_console: true}))
  .pipe(sourcemaps.write('../maps'))
  .pipe(gulp.dest(destinations.scripts));
});

// scripts watch task for development
gulp.task('scripts:watch', function (event) {
  gulp.src(sources.vendor)
  .pipe(plumber())
  .pipe(gulp.dest(destinations.vendor));

  watch({glob: sources.scripts}, function (files) {
    gulp.src(sources.scripts)
    .pipe(plumber())
    .pipe(gulp.dest(destinations.scripts));
  });
});

gulp.task('trans', function (event) {
  return gulp.src(sources.translations)
  .pipe(expectFile(sources.translations))
  .pipe(gulp.dest(destinations.translations));
});

// jade tasks
gulp.task('jade', function (event) {
  gulp.src(sources.partials)
  .pipe(expectFile(sources.partials))
  .pipe(plumber())
  .pipe(jade({ pretty:true} ))
  .pipe(gulp.dest(destinations.partials));

  return gulp.src(sources.docs)
  .pipe(expectFile(sources.docs))
  .pipe(plumber())
  .pipe(jade( {pretty: true} ))
  .pipe(gulp.dest(destinations.docs));
});

// jade watch task for development
gulp.task('jade:watch', function (event) {
  var _compileAll = function () {
    gulp.src(sources.partials)
    .pipe(plumber())
    .pipe(jade( {pretty: true} ))
    .pipe(gulp.dest(destinations.partials));

    gulp.src(sources.docs)
    .pipe(plumber())
    .pipe(jade( {pretty: true} ))
    .pipe(gulp.dest(destinations.docs));
  };

  watch({glob: sources.templates}, function () {
    _compileAll();
  });

  watch({glob: sources.partials}, function () {
    _compileAll();
  });

  watch({glob: sources.docs}, function () {
    _compileAll();
  });
});

gulp.task('images:watch', function () {
  watch({glob: sources.images}, function (files) {
    gulp.src(sources.images)
    .pipe(gulp.dest(destinations.images));
  });
});

gulp.task('images', function () {
  return gulp.src(sources.images)
  .pipe(expectFile(sources.images))
  .pipe(gulp.dest(destinations.images));
});

gulp.task('fonts', function () {
  return gulp.src(sources.fonts)
  .pipe(gulp.dest(destinations.fonts));
});

gulp.task('maps', function () {
  return gulp.src(sources.maps)
  .pipe(gulp.dest(destinations.scripts));
});

// jshint task
gulp.task('lint', function () {
  return gulp.src(['app/scripts/**/*.js', '!app/scripts/libs/**/*.js'])
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

// jshint watch task for development
gulp.task('lint:watch', function () {
  gulp.watch('app/scripts/**/*.js', ['lint']);
});

// upload to server task
gulp.task('upload', function () {
  return gulp.src('dist/**')
  .pipe(sftp({
    host: '162.209.106.29',
    auth: 'keyMain',
    remotePath: '/html/'
  }));
});

// default tasks
gulp.task('default', [
  'serve',
  'fonts',
  'data',
  'images:watch',
  'jade:watch',
  'scripts',
  'trans',
  'lint:watch',
  'stylus:watch'
]);

// deployment and necessary pre-deploy tasks
gulp.task('deploy', function(callback) {
  runSequence(
    [
      'fonts',
      'data',
      'images',
      'jade',
      'scripts',
      'trans',
      'stylus'
    ],
    'upload',
    callback
  );
});
