//Gruntfile for the MailX Template

var TITLE             = 'MailX';       // Title
var BUILD_DIR         = 'build';       // Template Build
var LETTER_DIR        = 'letter';      // Letter Template
var DEVELOPMENT_DIR   = 'dev';         // Template Directory
var IMAGES_DIR        = 'images';      // Images
var RESOURCES_DIR     = 'res';         // Resources (CSS, Images)
var TEMPLATES_DIR     = 'templates';   // Templates
var CSS_TEMPLATE      = '_head.html';  // Template Containing CSS Declarations
var CSS_IMAGES_DIR    = 'images';      // Image Resources
var CSS_DIR           = 'css';         // Production CSS
var SASS_DIR          = 'sass-dev';    // Sass
var CSS_DEV_DIR       = 'css-dev';     // Generated CSS
var CSS_FILENAME      = 'styles';      // Production CSS Filename

function fillAnArray(array, path) {
  var result = [];
  for (var element in array) {
    result.push(path + array[element]);
  }
  return result;
}

module.exports = function(grunt) {

  var project = {
    init: function() {
      this.title = TITLE;
      this.dir = DEVELOPMENT_DIR + '/';
      this.images = this.dir + IMAGES_DIR + '/';
      var templatesDirCompiled = this.dir + TEMPLATES_DIR + '/',
          resourcesDirCompiled = this.dir + RESOURCES_DIR + '/';
      this.templates = {
        dir: templatesDirCompiled,
        css: templatesDirCompiled + CSS_TEMPLATE
      };
      this.res = {
        dir: RESOURCES_DIR,
        images: {
          dir: RESOURCES_DIR + CSS_IMAGES_DIR + '/'
        },
        css: {
          dir: resourcesDirCompiled + CSS_DIR + '/',
          devDir: resourcesDirCompiled + CSS_DEV_DIR + '/',
          sass: resourcesDirCompiled + SASS_DIR + '/',
          filename: CSS_FILENAME
        }
      };
      this.build = {
        dir: BUILD_DIR + '/'
      };
      this.letter = {
        dir: LETTER_DIR + '/',
      };
      return this;
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
        src: ['*.scss'],
        expand: true
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      cssLint: {
        cwd: project.res.css.devDir,
        src: ['*.css'],
        expand: true
      }
    },
    colorguard: {
      files: {
        src: project.res.css.devDir + '*.css'
      }
    },

    sass: {
      options: {
        sourceMap: true,
        precision: 5
      },
      generateCSS: {
        cwd: project.res.css.sass,
        src: ['**/*.{scss,sass}', '!**/tx/*.{scss,sass}'],
        dest: project.res.css.devDir,
        ext: '.css',
        expand: true
      },
      generateDebugCSS: {
        cwd: project.res.css.sass + 'project/tx/',
        src: ['*.scss', '*.sass'],
        dest: project.res.css.devDir + '/tx',
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
        cwd: project.res.css.devDir,
        src: ['**/*.css'],
        dest: project.res.css.devDir,
        expand: true
      }
    },

    concat: {
      css: {
        src: '<%= task.cssArray %>',
        dest: project.res.css.dir + project.res.css.filename + '.css'
      }
    },

    'string-replace': {
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
      build: {
        options: {
          replacements: [{
            pattern: /@tx-title/gi,
            replacement: project.title + ' Template'
          }, {
            pattern: /.!-- @tx-css -->(.|\t|\s|\r?\n|\r)*?!-- \/@tx-css -->/gi,
            replacement: '<link rel="stylesheet" type="text/css" href="' + project.res.css.dir.replace(project.dir, '') + project.res.css.filename + '.min.css">'
          }, {
            pattern: /(?:\<span data-dev-note=".*?"\>)(.*)(?:\<\/span\>)/gi,
            replacement: '$1'
          }, {
            pattern: /\sdata-dev-note=".*?"/gi,
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
            pattern: /\s+(\r?\n|\r)/g,
            replacement: '\n'
          }, {
            pattern: /(\r?\n|\r){3}/g,
            replacement: '\n'
          }, {
            pattern: /<style.*<\/style>/g,
            replacement: '<style type="text/css">' + grunt.file.read(project.res.css.dir + project.res.css.filename + '.min.css') + '</style>'
          }, {
            pattern: '</style></head><body',
            replacement: '</style>\n  </head>\n\n  <body'
          }, {
            pattern: '<style',
            replacement: '    <style'
          }, {
            pattern: '  <head>',
            replacement: '\n  <head>'
          }, {
            pattern: '<html',
            replacement: '\n<html'
          }, {
            pattern: '</html>',
            replacement: '\n</html>'
          }, {
            pattern: /src='[.\S]*\//gi,
            replacement: 'src="'
          }, {
            pattern: /url\([.\S]*\//gi,
            replacement: 'url('
          }, {
            pattern: /-premailer(.*?);/g,
            replacement: ''
          }]
        },
        files: {
          './': [project.letter.dir + '*.html']
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
          stylesheets: [project.res.css.dir.replace(project.dir, '') + project.res.css.filename + '.css'],
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
      cssSortBuild: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        dest: project.res.css.dir,
        expand: true
      },
      cssSortDev: {
        cwd: project.res.css.devDir,
        src: ['*.css'],
        dest: project.res.css.devDir,
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
        includeBase: project.templates.dir,
        commentMarker: '@tx-process',
        recursive: true
      },
      templates: {
        cwd: project.templates.dir,
        src: ['*.html', '!_*.html'],
        dest: project.dir,
        ext: '.html',
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
    premailer: {
      inlineCSS: {
        option: {
          preserveStyles: true
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
        src: ['**/*.{png,jpg,gif}', '!**/tx-*.*', '!tx/*.*'],
        dest: project.dir,
        expand: true
      }
    },
    svgmin: {
      options: {
        plugins: [
          { removeViewBox: false }
        ]
      },
      svg: {
        cwd: project.dir,
        src: ['**/*.svg'],
        dest: project.dir,
        expand: true
      }
    },
    imageoptim: {
      images: {
        options: {
          jpegMini: true,
          quitAfter: true
        },
        cwd: project.dir,
        src: ['**/*.{png,jpg,gif}', '!**/tx-*.*', '!tx/*.*'],
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
      build: [project.build.dir, project.letter.dir],
    },
    copy: {
      build: {
        cwd: project.dir,
        src: ['**/*.*', '!**/tx-*.*', '!**/templates/**', '!**/**-dev/**', '!**/tx/**'],
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
          archive: project.title + '.template.zip'
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
      htmlTemplates: {
        files: [project.templates.dir + '*.html'],
        tasks: ['processhtml']
      },
      sass: {
        files: [project.res.css.sass + '**/*.scss', project.res.css.sass + '**/*.sass'],
        tasks: ['sass', 'autoprefixer']
      },
      sassImages: {
        files: [project.res.images.dir + '**/*.{png,jpg,gif,svg}'],
        tasks: ['sass', 'autoprefixer', 'processhtml']
      },
      livereloadWatch: {
        options: {
          livereload: true
        },
        files: [project.dir + '*.html', project.res.css.devDir + '**/*.css', project.images + '**/*.{png,jpg,gif,svg}']
      }
    },
    concurrent: {
      options: {
        logConcurrentOutput: true,
        limit: 4
      },
      projectWatch: ['watch:htmlTemplates', 'watch:sass', 'watch:sassImages', 'watch:livereloadWatch']
    }

  });

  grunt.registerTask('process-css', 'CSS processing', function() {
    var cssDirRegEx = new RegExp('<link(.)*href="' + project.res.css.devDir.replace(project.dir, ''), 'g'),
        cssAll = grunt.file.read(project.templates.css)
          .replace(/(.|\t|\s|\r?\n|\r)*?<!-- @tx-css -->/, '')
          .replace(/<!-- \/@tx-css -->(.|\t|\s|\r?\n|\r)*/, ''),
        css = cssAll
          .replace(/<!--(.|\t|\s|\r?\n|\r)*/, '')
          .replace(cssDirRegEx, '')
          .replace(/\r?\n|\r/g, '')
          .replace(/\s/g, '')
          .replace(/"\/>$/, ''),
        cssArray = css.split('"/>'),
        cssExpected = cssArray.length,
        cssActual = grunt.file.expand([project.res.css.devDir + '*.css']).length;
    if (cssExpected === cssActual || (cssArray[0] === '' && cssActual === 0)) {
      if (cssActual === 0) {
        grunt.log.writeln('No .css-files to process.');
      } else {
        var processTasks = [];
        processTasks.push('concat:css');
        grunt.config.set('task.cssArray', fillAnArray(cssArray, project.res.css.devDir));
        processTasks = processTasks.concat(['uncss', 'csscomb', 'string-replace:cssComments', 'cssc', 'cssmin:cssMin']);
        grunt.task.run(processTasks);
      }
    } else {
      var errorMessage = '';
      if (cssExpected > cssActual) {
        errorMessage += 'There is got to be more .css-files. ';
      } else if (cssExpected < cssActual) {
        errorMessage += 'Not all of the .css-files has been referenced. ';
      }
      grunt.fail.warn(errorMessage);
    }
  });

  grunt.registerTask('quality', ['htmlhint', 'scsslint', 'csslint', 'colorguard']);

  grunt.registerTask('test', ['mailgun']);

  grunt.registerTask('process-svg', ['svgmin']);

  grunt.registerTask('images', ['imagemin', 'process-svg']);

  grunt.registerTask('generate-css', ['sass', 'autoprefixer']);

  grunt.registerTask('watch-project', ['concurrent']);

  grunt.registerTask('compile', ['clean:res', 'processhtml', 'generate-css', 'process-css', 'images']);

  grunt.registerTask('build', ['compile', 'clean:build', 'copy:build', 'string-replace:build', 'htmlmin:cleanup', 'premailer', 'htmlmin:letterClenup', 'string-replace:letter', 'copy:letter', 'string-replace:premailer', 'compress:letter']);

};
