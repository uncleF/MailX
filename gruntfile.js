//Gruntfile for the MailX Template

var TITLE							= "MailX",									// Title
		BUILD_DIR					= "build",									// Template Build
		LETTER_DIR				= "letter",									// Letter Template
		DEVELOPMENT_DIR		= "dev",										// Template Directory
		IMAGES_DIR				= "images",									// Images
		RESOURCES_DIR			= "res",										// Resources (CSS, Images)
		TEMPLATES_DIR			= "templates",							// Templates
		CSS_TEMPLATE			= "_head.html",							// Template Containing CSS Declarations
		CSS_IMAGES_DIR		= "images",									// Image Resources
		CSS_DIR						= "css",										// Production CSS
		SASS_DIR					= "sass-dev",								// Sass
		CSS_DEV_DIR				= "css-dev",								// Generated CSS
		CSS_FILENAME			= "styles";									// Production CSS Filename

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
			this.dir = DEVELOPMENT_DIR + "/";
			this.images = this.dir + IMAGES_DIR + "/";
			var TEMPLATES_DIR_COMPILED = this.dir + TEMPLATES_DIR + "/",
					RESOURCES_DIR_COMPILED = this.dir + RESOURCES_DIR + "/";
			this.templates = {
				dir: TEMPLATES_DIR_COMPILED,
				css: TEMPLATES_DIR_COMPILED + CSS_TEMPLATE
			};
			this.res = {
				dir: RESOURCES_DIR,
				images: {
					dir: RESOURCES_DIR + CSS_IMAGES_DIR + "/"
				},
				css: {
					dir: RESOURCES_DIR_COMPILED + CSS_DIR + "/",
					devDir: RESOURCES_DIR_COMPILED + CSS_DEV_DIR + "/",
					sass: RESOURCES_DIR_COMPILED + SASS_DIR + "/",
					filename: CSS_FILENAME
				}
			};
			this.build = {
				dir: BUILD_DIR + "/"
			};
			this.letter = {
				dir: LETTER_DIR + "/",
			};
			return this;
		}
	}.init();

	require("load-grunt-tasks")(grunt);

	grunt.initConfig({

		htmlhint: {
			options: {
				"htmlhintrc": ".htmlhintrc"
			},
			htmlHint: {
				cwd: project.dir,
				src: ["*.html"],
				expand: true
			}
		},
		csslint: {
			option: {
				"csslintrc": ".csslintrc"
			},
			cssLint: {
				cwd: project.res.css.devDir,
				src: ["*.css"],
				expand: true
			}
		},
		colorguard: {
			files: {
				src: project.res.css.devDir + "*.css"
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
				map: true,
				browsers: ["> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1", "Explorer >= 7"],
				cascade: false
			},
			prefixCSS: {
				cwd: project.res.css.devDir,
				src: ["**/*.css"],
				dest: project.res.css.devDir,
				expand: true
			}
		},

		concat: {
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
					"./": [project.res.css.dir + "*.css"]
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
					},{
						pattern: /\/\*(.)*(\r?\n|\r){4}/g,
						replacement: ""
					}]
				},
				files: {
					"./": [project.res.css.dir + "*.css"]
				}
			},
			build: {
				options: {
					replacements: [{
						pattern: /@tx-title/gi,
						replacement: project.title + " Template"
					},{
						pattern: /.!-- @tx-css -->(.|\t|\s|\r?\n|\r)*?!-- \/@tx-css -->/gi,
						replacement: "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + project.res.css.dir.replace(project.dir, "") + project.res.css.filename + ".min.css\">"
					}]
				},
				files: {
					"./": [project.build.dir + "*.html"]
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
					},{
						pattern: /-premailer(.*?);/g,
						replacement: ""
					}]
				},
				files: {
					"./": [project.letter.dir + "*.html"]
				}
			},
			premailer: {
				options: {
					replacements: [{
						pattern: /(\r?\n|\r)*(\t)*-premailer(.*?)(;|\r?\n|\r)/g,
						replacement: ""
					}]
				},
				files: {
					"./": [project.build.dir + "**/*.css", project.res.css.dir + "*.css"]
				}
			}
		},

		uncss: {
			cssOptimize: {
				options: {
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
		csscomb: {
			options: {
				config: ".csscombrc"
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
				ext: ".min.css",
				expand: true
			}
		},
		cssmin: {
			cssMin: {
				cwd: project.res.css.dir,
				src: ["*.min.css"],
				dest: project.res.css.dir,
				expand: true
			},
			svg: {
				cwd: project.dir,
				src: ["**/*.svg"],
				dest: project.dir,
				expand: true
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
			options: grunt.file.readJSON(".htmlminrc"),
			cleanup: {
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

		imagemin: {
			images: {
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

		mailgun: {
			mailTest: {
				options: {
					key: grunt.file.readJSON(process.env.buildJSON).mailgun.key,
					sender: grunt.file.readJSON(process.env.buildJSON).mailgun.sender,
					recipient: grunt.file.readJSON(process.env.buildJSON).mailgun.recipient,
					subject: "Test MailX Tempalte"
				},
				cwd: project.letter.dir,
				src: ["*.html"],
				expand: true
			}
		},
		litmus: {
			options: {
				username: grunt.file.readJSON(process.env.buildJSON).litmus.username,
				password: grunt.file.readJSON(process.env.buildJSON).litmus.password,
				url: grunt.file.readJSON(process.env.buildJSON).litmus.url,
				clients: grunt.file.readJSON(".litmusrc").clients
			},
			mailTest: {
				cwd: project.letter.dir,
				src: ["*.html"],
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
		}

	});

	grunt.registerTask("process-css", "CSS processing", function() {
		var CSS_DIR_REGEX = new RegExp("<link(.)*href=\"" + project.res.css.devDir.replace(project.dir, ""), "g"),
				CSS_ALL = grunt.file.read(project.templates.css)
					.replace(/(.|\t|\s|\r?\n|\r)*?<!-- @tx-css -->/, "")
					.replace(/<!-- \/@tx-css -->(.|\t|\s|\r?\n|\r)*/, "")
					.replace(/\t/g, ""),
				CSS = CSS_ALL
					.replace(/<!--(.|\t|\s|\r?\n|\r)*/, "")
					.replace(CSS_DIR_REGEX, "")
					.replace(/\r?\n|\r/g, "")
					.replace(/" \/>$/, ""),
				CSS_ARRAY = CSS.split("\" />"),
				CSS_EXPECTED = CSS_ARRAY.length,
				CSS_ACTUAL = grunt.file.expand([project.res.css.devDir + "*.css"]).length;
		if (CSS_EXPECTED === CSS_ACTUAL || (CSS_ARRAY[0] === "" && CSS_ACTUAL === 0)) {
			if (CSS_ACTUAL === 0) {
				grunt.log.writeln("No .css-files to process.");
			} else {
				var PROCESS_TASKS = [];
				PROCESS_TASKS.push("concat:css");
				grunt.config.set("TASK.CSS_ARRAY", fillAnArray(CSS_ARRAY, project.res.css.devDir));
				PROCESS_TASKS = PROCESS_TASKS.concat(["uncss", "string-replace:commentsFirst", "string-replace:commentsSecond", "csscomb", "cssc", "cssmin:cssMin"]);
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

	grunt.registerTask("quality", ["htmlhint", "csslint", "colorguard"]);

	grunt.registerTask("test", ["mailgun"]);

	grunt.registerTask("process-svg", ["svgmin", "cssmin:svg"]);

	grunt.registerTask("images", ["imagemin", "process-svg"]);

	grunt.registerTask("generate-css", ["sass", "autoprefixer"]);

	grunt.registerTask("watch-project", ["concurrent"]);

	grunt.registerTask("compile", ["clean:res", "processhtml", "generate-css", "process-css"]);

	grunt.registerTask("build", ["compile", "clean:build", "copy:build", "string-replace:build", "htmlmin:cleanup", "premailer", "htmlmin:letterClenup", "string-replace:letter", "copy:letter", "string-replace:premailer", "compress:letter"]);

};