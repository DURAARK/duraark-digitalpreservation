var spawn = require('child_process').spawn,
    uuid = require('node-uuid'),
    path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    _ = require('underscore');

var sourceDir;
var output;
var bagItExecutable = path.join(__dirname, '../../app/bagit-4.9.0/bin');
/**
 * Provides NodeJS-Javascript bindings for the 'orthogen' executable.
 *
 * @module widget
 */
var BagIt = module.exports = function(sourceDir, output) {
  this.sourceDir = sourceDir;
  this.output = output;
};

BagIt.prototype.bagIt = function(cb) {

    var targetOutput = this.output;
    console.log('[BagIt::createElecDetection] configuration: ' + JSON.stringify(this.output, null, 4));

    // TODO: change to session directory here?
    var cwd = process.cwd();

    process.chdir(bagItExecutable);

      var arguments = ['create', this.output,
        this.sourceDir, '--writer', 'zip'
      ];

      var executable = spawn(path.join(bagItExecutable, 'bag.bat '), arguments);

      executable.stdout.on('data', function(data) {
          console.log(data.toString());
      });

      executable.stderr.on('data', function(data) {
          console.log('ERROR: ' + data.toString());
      });

      executable.on('close', function(code) {
          console.log('[BagIt-binding] child process exited with code ' + code);

          cb(targetOutput);
      }.bind(this));
};
