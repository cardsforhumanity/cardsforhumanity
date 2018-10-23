var coverageFolder = process.env.CIRCLE_TEST_REPORTS == undefined ? 'coverage' : process.env.CIRCLE_TEST_REPORTS + '/coverage';

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      local: {
        options: {
          reporter: 'spec',
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
          ui: 'tdd'
        },
        src: ['test/**/*.js']
      },
      circleci: {
        options: {
          ui: 'tdd',
          reporter: 'mocha-junit-reporter',
          quiet: false,
          reporterOptions: {
            mochaFile: process.env.CIRCLE_TEST_REPORTS + '/mocha/results.xml'
          }
        },
        src: ['test/**/*.js']
      },
      shippable: {
        options: {
          ui: 'tdd',
          reporter: 'mocha-junit-reporter',
          quiet: false,
          reporterOptions: {
            mochaFile: 'shippable/testresults/mocha/results.xml'
          }
        },
        src: ['test/**/*.js']
      },
    },
    mocha_istanbul: {
      coverage: {
        src: 'test', // a folder works nicely
        options: {
          mochaOptions: ['--ui', 'tdd'], // any extra options for mocha
          istanbulOptions: ['--dir', coverageFolder],
          reporter: 'spec',
          reportFormats: ['lcovonly']
        }
      }
    },
    instrument: {
      api: {
        files: 'app/*.js',
        options: {
          basePath: 'test/coverage/instrument/'
        }
      }
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  // Default task(s).
  grunt.registerTask('default', []);
  // Test
  grunt.registerTask('test', ['mochaTest:local']);
  // CircleCI
  grunt.registerTask('circleci', ['mochaTest:circleci', 'mocha_istanbul']);
  grunt.registerTask('shippable', ['mochaTest:shippable', 'mocha_istanbul']);
  //Coverage
  grunt.registerTask('coverage', ['mocha_istanbul']);
};
