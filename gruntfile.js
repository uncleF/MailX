// Gruntfile for the MailX Template

var PROJECT           = 'MailX';         // Project Name

var DEVELOPMENT_DIR   = 'dev';           // Development
var BUILD_DIR         = 'build';         // Build
var LETTER_DIR        = 'letter';        // Letter
var TESTS_DIR         = 'tests';          // Tests
var IMAGES_DIR        = 'images';        // Content Images
var RESOURCES_DIR     = 'res';           // Resources (CSS, Images, etc.)
var TEMPLATES_DIR     = 'templates';     // Templates
var COMPONENTS_DIR    = 'components';    // Components

var LETTER_PAGE       = 'letter.html';   // Letter Page

var CSS_IMAGES_DIR    = 'images';        // CSS Images (Sprites, Icons, etc.)

var SASS_DIR          = 'sass';          // Sass
var CSS_DIR           = 'css';           // CSS
var CSS_FILENAME      = 'letter';        // CSS Filename

module.exports = function(grunt) {

  var project = {
    init: function() {
      var developmentDirCompiled = DEVELOPMENT_DIR + '/';
      var resourcesDirCompiled = developmentDirCompiled + RESOURCES_DIR + '/';
      var config = {
        name: PROJECT,
        dir: developmentDirCompiled,
        tests: TESTS_DIR + '/',
        images: developmentDirCompiled + IMAGES_DIR + '/',
        page: LETTER_PAGE,
        res: {
          dir: resourcesDirCompiled,
          templates: {
            dir: resourcesDirCompiled + TEMPLATES_DIR + '/',
            comp: resourcesDirCompiled + TEMPLATES_DIR + '/' + COMPONENTS_DIR + '/'
          },
          images: {
            dir: resourcesDirCompiled + CSS_IMAGES_DIR + '/'
          },
          css: {
            dir: resourcesDirCompiled + CSS_DIR + '/',
            sass: resourcesDirCompiled + SASS_DIR + '/',
            filename: CSS_FILENAME
          }
        },
        build: {
          dir: BUILD_DIR + '/'
        },
        letter: {
          dir: LETTER_DIR + '/'
        }
      };
      return config;
    }
  }.init();

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    htmlhint: {
      options: {
        'htmlhintrc': '.htmlhintrc'
      },
      htmlHint: {
        cwd: project.dir,
        src: ['*.html'],
        expand: true
      }
    },
    scsslint: {
      scssLint: {
        cwd: project.res.css.sass,
        src: ['**/*.{scss,sass}'],
        expand: true
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      cssLint: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        expand: true
      }
    },
    colorguard: {
      files: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        expand: true
      }
    },

    backstop: {
      options: {
        'backstop_path': 'node_modules/backstopjs',
        'test_path': project.tests + 'backstop'
      },
      test: {
        options: {
          setup: false,
          configure: false,
          'create_references': false,
          'run_tests': true
        }
      },
      ref: {
        options: {
          setup: false,
          configure: false,
          'create_references': true,
          'run_tests': false
        }
      }
    },

    sass: {
      options: {
        sourceMap: true,
        precision: 5
      },
      generateCSS: {
        cwd: project.res.css.sass,
        src: ['**/*.{scss,sass}'],
        dest: project.res.css.dir,
        ext: '.css',
        expand: true
      }
    },
    autoprefixer: {
      options: {
        map: true,
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'Explorer >= 7'],
        cascade: false
      },
      prefixCSS: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        dest: project.res.css.dir,
        expand: true
      }
    },

    'string-replace': {
      build: {
        options: {
          replacements: [{
            pattern: /@tx-title/gi,
            replacement: project.name
          }, {
            pattern: /(?:<span data-dev-note=".*?">)(.*)(?:<\/span>)/gi,
            replacement: '$1'
          }, {
            pattern: /\sdata-dev-note=".*?"/gi,
            replacement: ''
          }, {
            pattern: new RegExp(project.res.css.dir.replace(project.dir, '') + project.res.css.filename + '.css', 'gi'),
            replacement: project.res.css.dir.replace(project.dir, '') + project.res.css.filename + '.min.css'
          }, {
            pattern: /(?:\s|\t)*.*tx-debug.*(?:\r?\n|\r)/gi,
            replacement: ''
          }]
        },
        files: {
          './': [project.build.dir + '*.html']
        }
      },
      letter: {
        options: {
          replacements: [{
            pattern: /(?:\r?\n|\r|\s|\t)*<style(?:\r?\n|\r|.)*<\/head>/gi,
            replacement: '\n  </head>'
          },{
            pattern: /-premailer(.*?);/g,
            replacement: ''
          }]
        },
        files: {
          './': [project.letter.dir + '*.html']
        }
      },
      cssComments: {
        options: {
          replacements: [{
            pattern: /\/\* line \d*, .* \*\/(?:\r?\n|\r)*/g,
            replacement: ''
          }, {
            pattern: /\/\*# sourceMappingURL(?:.|\t|\s|\r?\n|\r)*?\*\//gi,
            replacement: ''
          }, {
            pattern: /.media \-sass\-debug\-info(?:.|\t|\s|\r?\n|\r)*?\}\}/gi,
            replacement: ''
          }, {
            pattern: /\/\*\*\* uncss>.*\*\*\*\/(?:\r?\n|\r)*/g,
            replacement: ''
          }, {
            pattern: /\*\s(?:.)*\*\/(?:\r?\n|\r)*$/g,
            replacement: ''
          }, {
            pattern: /\*\s(?:.)*\*\/(?:\r?\n\t*|\r\t*)*\//g,
            replacement: ''
          }, {
            pattern: /(?:\r?\n|\r)*\/$/g,
            replacement: ''
          }, {
            pattern: /\/\*(?:.)*(?:\r?\n|\r){4}/g,
            replacement: ''
          }, {
            pattern: /\{(?:\r?\n|\r)\s*\/\*/g,
            replacement: '{\n\n  /*'
          }, {
            pattern: /\}(?:\r?\n|\r)\}/g,
            replacement: '}\n\n}'
          }]
        },
        files: {
          './': [project.res.css.dir + '*.css', '!' + project.res.css.dir + '*.min.css']
        }
      },
      premailer: {
        options: {
          replacements: [{
            pattern: /(\r?\n|\r)*(\t|\s)*-premailer(.*?)(;|\r?\n|\r)/g,
            replacement: ''
          }]
        },
        files: {
          './': [project.build.dir + '**/*.css', project.res.css.dir + '*.css']
        }
      }
    },

    uncss: {
      cssOptimize: {
        options: {
          ignore: [/#outlook/, /\.ExternalClass/, /#backgroundTable/],
          timeout: 1000
        },
        files: {
          cssMinFiles: function() {
            var cssMinFilesObject = {};
            cssMinFilesObject[project.res.css.dir + project.res.css.filename + '.css'] = project.dir + '*.html';
            return cssMinFilesObject;
          }
        }.cssMinFiles()
      }
    },
    csscomb: {
      options: {
        config: '.csscombrc'
      },
      cssSort: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        dest: project.res.css.dir,
        expand: true
      }
    },
    cssc: {
      options: grunt.file.readJSON('.csscrc'),
      cssOptimize: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        dest: project.res.css.dir,
        ext: '.min.css',
        expand: true
      }
    },
    cssmin: {
      cssMin: {
        cwd: project.res.css.dir,
        src: ['*.min.css'],
        dest: project.res.css.dir,
        expand: true
      }
    },

    processhtml: {
      options: {
        includeBase: project.res.templates.comp,
        commentMarker: '@tx-process',
        recursive: true
      },
      templates: {
        cwd: project.res.templates.dir,
        src: ['*.html', '!* copy.html', '!* - Copy.html'],
        dest: project.dir,
        expand: true
      }
    },
    htmlmin: {
      options: grunt.file.readJSON('.htmlminrc'),
      cleanup: {
        cwd: project.build.dir,
        src: ['*.html'],
        dest: project.build.dir,
        expand: true
      },
      letterClenup: {
        options: {
          minifyCSS: true
        },
        cwd: project.letter.dir,
        src: ['*.html'],
        dest: project.letter.dir,
        expand: true
      }
    },
    prettify: {
      options: {
        config: '.jsbeautifyrc'
      },
      formatBuild: {
        cwd: project.build.dir,
        src: ['*.html'],
        dest: project.build.dir,
        expand: true
      },
      formatDev: {
        cwd: project.dir,
        src: ['*.html'],
        dest: project.dir,
        expand: true
      }
    },
    premailer: {
      inlineCSS: {
        option: {
          preserveStyles: false
        },
        cwd: project.build.dir,
        src: ['*.html'],
        dest: project.letter.dir,
        expand: true
      }
    },

    imagemin: {
      images: {
        cwd: project.dir,
        src: ['**/*.{png,jpg,gif}', '!**/tx-*.*', '!**/tx/*.*'],
        dest: project.dir,
        expand: true
      }
    },
    svgmin: {
      options: {
        plugins: [{
          removeViewBox: false
        }]
      },
      images: {
        cwd: project.dir,
        src: ['**/*.svg', '!**/fonts/**/*.svg', '!**/tx-*.*', '!**/tx/*.*'],
        dest: project.dir,
        expand: true
      }
    },

    mailgun: {
      mailTest: {
        options: {
          key: grunt.file.readJSON(process.env.buildJSON).mailgun.key,
          sender: grunt.file.readJSON(process.env.buildJSON).mailgun.sender,
          recipient: grunt.file.readJSON(process.env.buildJSON).mailgun.recipient,
          subject: 'Test MailX Tempalte'
        },
        cwd: project.letter.dir,
        src: ['*.html'],
        expand: true
      }
    },
    litmus: {
      options: {
        username: grunt.file.readJSON(process.env.buildJSON).litmus.username,
        password: grunt.file.readJSON(process.env.buildJSON).litmus.password,
        url: grunt.file.readJSON(process.env.buildJSON).litmus.url,
        clients: grunt.file.readJSON('.litmusrc').clients
      },
      mailTest: {
        cwd: project.letter.dir,
        src: ['*.html'],
        expand: true
      }
    },

    clean: {
      res: [project.res.css.dir],
      build: [project.build.dir, project.letter.dir]
    },
    cleanempty: {
      options: {
        noJunk: true
      },
      build: {
        src: [project.build.dir + '**/*', project.letter.dir + '**/*']
      }
    },
    copy: {
      build: {
        cwd: project.dir,
        src: ['**/*.*', '!**/templates/**', '!**/sass/**', '!**/*.map', '!**/**-dev/**', '!**/tx-*.*', '!**/tx/**'],
        dest: project.build.dir,
        expand: true
      },
      letter: {
        cwd: project.build.dir,
        src: ['**/*.*', '!**/*.html', '!**/*.css'],
        dest: project.letter.dir,
        expand: true,
        flatten: true
      }
    },

    compress: {
      letter: {
        options: {
          mode: 'zip',
          archive: project.name + '.template.zip'
        },
        cwd: project.letter.dir,
        src: ['**'],
        dest: '.',
        expand: true
      }
    },

    watch: {
      options: {
        spawn: false
      },
      html: {
        files: [project.res.templates.dir + '**/*.html'],
        tasks: ['processhtml']
      },
      images: {
        files: [project.res.images.dir + '**/*.{png,jpg,gif,svg}'],
        tasks: ['sass', 'autoprefixer', 'processhtml']
      },
      sass: {
        files: [project.res.css.sass + '**/*.{scss,sass}'],
        tasks: ['sass', 'autoprefixer']
      },
      livereloadWatch: {
        options: {
          livereload: true
        },
        files: [project.dir + '**/*.{html,png,jpg,gif,svg}', project.res.css.dir + '**/*.css']
      }
    },
    concurrent: {
      options: {
        logConcurrentOutput: true,
        limit: 4
      },
      projectWatch: ['watch:html', 'watch:images', 'watch:sass', 'watch:livereload']
    }

  });

  grunt.registerTask('inlineStyles', 'inlining Styles', function() {
    var html = grunt.file.read(project.build.dir + project.page);
    var styles;
    var cssPath = project.build.dir + html.match(/href=".*css\/.*?"/gm);
    cssPath = cssPath.replace(/"|'/gm, '').replace('href=', '');
    styles = '  <style type="text/css">' + grunt.file.read(cssPath) + '</style>\n  </head>';
    grunt.file.recurse(project.letter.dir, function(path, root, sub, filename) {
      var file;
      var filenameArray = filename.split('.');
      var ext = filenameArray[(filenameArray.length - 1)];
      if (ext === 'html') {
        file = grunt.file.read(path);
        file = file.replace(/<\/head>/gm, styles);
        grunt.file.write(path, file);
      }
    });
  });

  grunt.registerTask('reminder', 'Reminder', function() {
    var list = grunt.file.readJSON('reminders.json').reminders;
    if (list.length > 0) {
      grunt.log.writeln('\nDon\'t Forget to Check:'['magenta']);
      list.forEach(function(value) {
        grunt.log.writeln('✔'['green'] + ' ' + value);
      });
    }
  });

  grunt.registerTask('quality', [
    'htmlhint',
    'scsslint',
    'csslint',
    'colorguard'
  ]);

  grunt.registerTask('test', [
    'quality',
    'backstop:test',
    'mailgun'
  ]);

  grunt.registerTask('images', [
    'imagemin',
    'svgmin'
  ]);

  grunt.registerTask('process-css', [
    'sass',
    'autoprefixer',
    'uncss',
    'csscomb',
    'string-replace:cssComments',
    'cssc',
    'cssmin:cssMin'
  ]);

  grunt.registerTask('process-html', [
    'processhtml'
  ]);

  grunt.registerTask('watch-project', [
    'concurrent'
  ]);

  grunt.registerTask('compile', [
    'clean:res',
    'images',
    'process-html',
    'process-css'
  ]);

  grunt.registerTask('build', [
    'compile',
    'clean:build',
    'copy:build',
    'string-replace:build',
    'htmlmin:cleanup',
    'prettify',
    'premailer',
    'string-replace:letter',
    'string-replace:premailer',
    'htmlmin:letterClenup',
    'inlineStyles',
    'copy:letter',
    'compress:letter',
    'cleanempty:build',
    'reminder'
  ]);

};
