//Gruntfile for the MailX Project

var TITLE							= "MailX",									// Title
		DEVELOPMENT				= "dev",										// Development Directory
		IMAGES						= "images",									// Images
		TEMPLATES					= "templates",							// Templates
		CSS_TEMPLATE			= "_head.html",							// Template Containing CSS Declarations
		RESOURCES					= "res",										// Project Resources
		IMAGE_RESOURCES		= "images",									// Image Resources
		DATA_URI					= [],												// List of Images (Relative to the Image Resources Directory) to Convert to DataURI
		SASS							= "sass-dev",								// Sass
		CSS_DEV						= "css-dev",								// Generated CSS
		CSS								= "css",										// Production CSS
		CSS_FILENAME			= "styles",									// Production CSS Filename
		BUILD							= "build";									// Project Build
		LETTER						= "letter"									// Final Letter

function fillAnArray(ARRAY, PATH) {
	var RESULT = [];
	for (var ELEMENT in ARRAY) {
		RESULT.push(PATH + ARRAY[ELEMENT]);
	}
	return RESULT;
}

module.exports = function(grunt) {

	var project = {
		init: function() {
			this.title = TITLE;
			this.dir = DEVELOPMENT + "/";
			this.images = this.dir + IMAGES + "/";
			var TEMPLATES_DIR = this.dir + TEMPLATES + "/",
					RESOURCES_DIR = this.dir + RESOURCES + "/";
			this.templates = {
				dir: TEMPLATES_DIR,
				css: TEMPLATES_DIR + CSS_TEMPLATE
			};
			this.res = {
				dir: RESOURCES_DIR,
				images: {
					dir: RESOURCES_DIR + IMAGE_RESOURCES + "/",
					dataURI: fillAnArray(DATA_URI, RESOURCES_DIR + IMAGE_RESOURCES + "/")
				},
				css: {
					dir: RESOURCES_DIR + CSS + "/",
					devDir: RESOURCES_DIR + CSS_DEV + "/",
					sass: RESOURCES_DIR + SASS + "/",
					filename: CSS_FILENAME
				}
			};
			this.build = {
				dir: BUILD + "/"
			};
			this.letter = {
				dir: LETTER + "/"
			}
			return this;
		}
	}.init();

	require("load-grunt-tasks")(grunt);

	grunt.initConfig({
		
		datauri: {
			options: {
				classPrefix: "image-"
			},
			resImages: {
				src: project.res.images.dataURI,
				dest: project.res.css.sass + "tx/_tx-projectImages-base64.scss"
			}
		},

		htmlhint: {
			options: {
				"tagname-lowercase": true,
				"attr-lowercase": true,
				"attr-value-double-quotes": true,
				"doctype-first": true,
				"tag-pair": true,
				"spec-char-escape": true,
				"id-unique": true,
				"src-not-empty": true,
				"id-class-value": true,
				"style-disabled": true,
				"img-alt-require": true
			},
			htmlHint: {
				cwd: project.dir,
				src: ["*.html"],
				expand: true
			}
		},
		csslint: {
			options: {
				"adjoining-classes": false,
				"box-model": false,
				"box-sizing": false,
				"compatible-vendor-prefixes": false,
				"display-property-grouping": true,
				"duplicate-background-images": false,
				"duplicate-properties": true,
				"empty-rules": true,
				"errors": true,
				"fallback-colors": true,
				"floats": "warning",
				"font-faces": "warning",
				"font-sizes": "warning",
				"gradients": "warning",
				"ids": "warning",
				"import": "warning",
				"important": "warning",
				"known-properties": true,
				"outline-none": "warning",
				"overqualified-elements": "warning",
				"qualified-headings": "warning",
				"regex-selectors": "warning",
				"rules-count": "warning",
				"shorthand": "warning",
				"star-property-hack": "warning",
				"text-indent": "warning",
				"underscore-property-hack": "warning",
				"unique-headings": false,
				"universal-selector": "warning",
				"vendor-prefix": true,
				"zero-units": false
			},
			cssLint: {
				cwd: project.res.css.dir,
				src: ["*.css"],
				expand: true
			}
		},

		mailgun: {
			mailTest: {
				options: {
					key: "key-07720bdc9221f9578a518fdd6a14a6b6",
					sender: "postmaster@sandbox1d3a0f4a935145739d6ae7f76347c5e4.mailgun.org",
					recipient: "uncle.funkay@gmail.com",
					subject: "Test"
				},
				src: [project.letter.dir + "*.html"]
			}
		},

		sass: {
			options: {
				sourceMap: true,
				precision: 5
			},
			generateCSS: {
				cwd: project.res.css.sass,
				src: ["**/*.scss", "**/*.sass", "!**/_*.scss", "!**/_*.sass"],
				dest: project.res.css.devDir,
				ext: ".css",
				expand: true
			}
		},
		autoprefixer: {
			options: {
				browsers: ["> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1", "Explorer >= 7"],
				cascade: false
			},
			prefixCSS: {
				cwd: project.res.css.devDir,
				src: ["**/*.css", "!**/*-IE.css"],
				dest: project.res.css.devDir,
				expand: true
			}
		},

		concat: {
			datauri: {
				options: {
					separator: "\n\n"
				},
				src: [project.res.css.sass + "tx/_tx-projectImages-base64.scss", project.res.css.sass + "tx/_tx-projectImages-IE.scss"],
				dest: project.res.css.sass + "tx/_tx-projectImages.scss"
			},
			css: {
				src: "<%= TASK.CSS_ARRAY %>",
				dest: project.res.css.dir + project.res.css.filename + ".css"
			}
		},

		"string-replace": {
			commentsFirst: {
				options: {
					replacements: [{
						pattern: /\/\* line \d*, .* \*\/(\r?\n|\r)*/g,
						replacement: ""
					},{
						pattern: /\/\*# sourceMappingURL(.|\t|\s|\r?\n|\r)*?\*\//gi,
						replacement: ""
					},{
						pattern: /.media \-sass\-debug\-info(.|\t|\s|\r?\n|\r)*?\}\}/gi,
						replacement: ""
					},{
						pattern: /\*\s(.)*\*\/(\r?\n|\r)*$/g,
						replacement: ""
					},{
						pattern: /\*\s(.)*\*\/(\r?\n|\r)*\//g,
						replacement: ""
					}]
				},
				files: {
					"./": [project.res.css.dir + "*.css"],
				}
			},
			commentsSecond: {
				options: {
					replacements: [{
						pattern: /(\r?\n|\r)*\/$/g,
						replacement: ""
					},{
						pattern: /\/\*(.)*(\r?\n|\r){4}/g,
						replacement: ""
					}]
				},
				files: {
					"./": [project.res.css.dir + "*.css"],
				}
			},
			build: {
				options: {
					replacements: [{
						pattern: /@tx-title/gi,
						replacement: project.title
					},{
						pattern: /.!-- @tx-css -->(.|\t|\s|\r?\n|\r)*?!-- \/@tx-css -->/gi,
						replacement: '<link rel="stylesheet" type="text/css" href="' + project.res.css.dir.replace(project.dir, "") + project.res.css.filename + '.css">'
					}]
				},
				files: {
					"./": [project.build.dir + "*.html"],
				}
			},
			letter: {
				options: {
					replacements: [{
						pattern: /\t+(\r?\n|\r)/g,
						replacement: "\n"
					},{
						pattern: /(\r?\n|\r){3}/g,
						replacement: "\n"
					},{
						pattern: "<style ",
						replacement: "\t\t<style "
					},{
						pattern: "</style></head><body",
						replacement: "</style>\n\t</head>\n\n\t<body"
					},{
						pattern: /src="[.\S]*\//gi,
						replacement: "src=\""
					},{
						pattern: /url\([.\S]*\//gi,
						replacement: "url("
					}]
				},
				files: {
					"./": [project.letter.dir + "*.html"],
				}
			}
		},

		csscomb: {
			options: {
				config: "csscombConfig.json"
			},
			cssSortBuild: {
				cwd: project.res.css.dir,
				src: ["*.css"],
				dest: project.res.css.dir,
				expand: true
			},
			cssSortDev: {
				cwd: project.res.css.devDir,
				src: ["*.css"],
				dest: project.res.css.devDir,
				expand: true
			}
		},
		cssc: {
			cssOptimize: {
				cwd: project.res.css.dir,
				src: ["*.css"],
				dest: project.res.css.dir,
				ext: ".css",
				expand: true
			}
		},
		uncss: {
			cssOptimize: {
				options: {
					ignore: [/(.)*-is-(.)*/, /(.)*-has-(.)*/, /(.)*-are-(.)*/],
					stylesheets: [project.res.css.dir.replace(project.dir, "") + project.res.css.filename + ".css"]
				},
				files: {
					cssMinFiles: function() {
						var cssMinFilesObject = {};
						cssMinFilesObject[project.res.css.dir + project.res.css.filename + ".css"] = project.dir + "*.html";
						return cssMinFilesObject;
					}
				}.cssMinFiles()
			}
		},

		processhtml: {
			options: {
				includeBase: project.templates.dir,
				commentMarker: "@tx-process",
				recursive: true
			},
			templates: {
				cwd: project.templates.dir,
				src: ["*.tmp.html", "!_*.html"],
				dest: project.dir,
				ext: ".html",
				expand: true
			}
		},

		htmlmin: {
			cleanup: {
				options: {
					removeComments: true,
					removeCommentsFromCDATA: true,
					collapseBooleanAttributes: true,
					removeRedundantAttributes: true,
					removeEmptyAttributes: true
				},
				cwd: project.build.dir,
				src: ["*.html"],
				dest: project.build.dir,
				expand: true
			},
			letterClenup: {
				options: {
					minifyCSS: true
				},
				cwd: project.letter.dir,
				src: ["*.html"],
				dest: project.letter.dir,
				expand: true
			}
		},
		premailer: {
			inlineCSS: {
				cwd: project.build.dir,
				src: ["*.html"],
				dest: project.letter.dir,
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
				src: ["**/*.*", "!**/tx-*.*", "!**/templates/**", "!**/**-dev/**", "!**/tx/**"],
				dest: project.build.dir,
				expand: true
			},
			letter: {
				cwd: project.build.dir,
				src: ["**/*.*", "!**/*.html", "!**/*.css"],
				dest: project.letter.dir,
				expand: true,
				flatten: true
			}
		},

		imagemin: {
			images: {
				cwd: project.dir,
				src: ["**/*.{png,jpg,gif}", "!**/tx-*.*", "!tx/*.*"],
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
				src: ["**/*.{png,jpg,gif}", "!**/tx-*.*", "!tx/*.*"],
				dest: project.dir,
				expand: true
			}
		},
		svgmin: {
			svg: {
				cwd: project.dir,
				src: ["**/*.svg"],
				dest: project.dir,
				expand: true
			}
		},

		compress: {
			letter: {
				options: {
					mode: "zip",
					archive: project.title + ".template.zip"
				},
				cwd: project.letter.dir,
				src: ["**"],
				dest: ".",
				expand: true
			}
		},

		watch: {
			htmlTemplates: {
				files: [project.templates.dir + "*.html"],
				tasks: ["processhtml"]
			},
			sassStyles: {
				files: [project.res.css.sass + "**/*.scss", project.res.css.sass + "**/*.sass", "!" + project.res.css.sass + "**/_*.scss", "!" + project.res.css.sass + "**/_*.sass"],
				tasks: ["newer:sass", "newer:autoprefixer"]
			},
			sassPartials: {
				files: [project.res.css.sass + "**/_*.scss", project.res.css.sass + "**/_*.sass"],
				tasks: ["sass", "newer:autoprefixer"]
			},
			sassImages: {
				files: [project.res.images.dir + "**/*.{png,jpg,gif,svg}"],
				tasks: ["sass", "autoprefixer", "processhtml"]
			},
			livereloadWatch: {
				options: {
					livereload: true
				},
				files: [project.dir + "*.html", project.res.css.devDir + "**/*.css", project.images + "**/*.{png,jpg,gif,svg}"]
			}
		},
		concurrent: {
			options: {
				logConcurrentOutput: true,
				limit: 5
			},
			projectWatch: ["watch:htmlTemplates", "watch:sassStyles", "watch:sassPartials", "watch:sassImages", "watch:livereloadWatch"]
		}

	});

	grunt.registerTask("datauri-cleanup", "Cleanup After datauri-fallback", function() {
		if (grunt.file.isFile(project.res.css.sass + "tx/_tx-projectImages-base64.scss")) {
			grunt.file.delete(project.res.css.sass + "tx/_tx-projectImages-base64.scss");
		}
	});

	grunt.registerTask("process-css", "CSS processing", function() {
		var CSS_DIR_REGEX = new RegExp("<link(.)*href=\"" + project.res.css.devDir.replace(project.dir, ""), "g"),
				CSS_IE_DIR_REGEX = new RegExp("<!--(.)*href=\"" + project.res.css.devDir.replace(project.dir, ""), "g"),
				CSS_ALL = grunt.file.read(project.templates.css)
					.replace(/(.|\t|\s|\r?\n|\r)*?<!-- @tx-css -->/, "")
					.replace(/<!-- \/@tx-css -->(.|\t|\s|\r?\n|\r)*/, "")
					.replace(/\t/g, ""),
				CSS = CSS_ALL
					.replace(/<!--(.|\t|\s|\r?\n|\r)*/, "")
					.replace(CSS_DIR_REGEX, "")
					.replace(/\r?\n|\r/g, "")
					.replace(/">$/, ""),
				CSS_IE = CSS_ALL
					.replace(/^<link(.)*/gm, "")
					.replace(CSS_IE_DIR_REGEX, "")
					.replace(/\r?\n|\r/g, "")
					.replace(/"> <\!\[endif\]-->$/, ""),
				CSS_ARRAY = CSS.split("\">"),
				CSS_IE_ARRAY = CSS_IE.split("\"> <![endif]-->"),
				CSS_EXPECTED = CSS_ARRAY.length,
				CSS_ACTUAL = grunt.file.expand([project.res.css.devDir + "*.css"]).length;
		if (CSS_EXPECTED === CSS_ACTUAL || (CSS_ARRAY[0] === "" && CSS_ACTUAL === 0)) {
			if (CSS_ACTUAL === 0) {
				grunt.log.writeln("No .css-files to process.");
			} else {
				var PROCESS_TASKS = [];
				PROCESS_TASKS.push("concat:css");
				grunt.config.set("TASK.CSS_ARRAY", fillAnArray(CSS_ARRAY, project.res.css.devDir));
				PROCESS_TASKS = PROCESS_TASKS.concat(["uncss", "string-replace:commentsFirst", "string-replace:commentsSecond", "csscomb", "cssc"]);
				grunt.task.run(PROCESS_TASKS);
			}
		} else {
			var ERROR_MESSAGE = "";
			if (CSS_EXPECTED > CSS_ACTUAL) {
				ERROR_MESSAGE += "There's got to be more .css-files. ";
			} else if (CSS_EXPECTED < CSS_ACTUAL) {
				ERROR_MESSAGE += "Not all of the .css-files has been referenced. ";
			}
			grunt.fail.warn(ERROR_MESSAGE);
		}
	});

	grunt.registerTask("lint", ["htmlhint", "csslint"]);

	grunt.registerTask("test", ["mailgun"]);

	grunt.registerTask("images-datauri", ["datauri", "concat:datauri", "datauri-cleanup"]);

	grunt.registerTask("images", ["imagemin", "images-datauri", "svgmin"]);

	grunt.registerTask("generate-css", ["sass", "autoprefixer"]);

	grunt.registerTask("watch-project", ["concurrent"]);

	grunt.registerTask("compile", ["clean:res", "processhtml", "generate-css", "process-css"]);

	grunt.registerTask("build", ["compile", "clean:build", "copy:build", "string-replace:build", "htmlmin:cleanup", "premailer", "htmlmin:letterClenup", "string-replace:letter", "copy:letter", "compress:letter"]);

};