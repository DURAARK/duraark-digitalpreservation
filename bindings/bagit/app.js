var Promise = require('bluebird'),
  spawn = require('child_process').spawn,
  uuid = require('node-uuid'),
  path = require('path'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  _ = require('underscore');

var sourceDir;
var output;
var bagItExecutable = path.join(__dirname, '../../app/bagit-4.9.0/bin');
/**
 * @module widget
 */
var BagIt = module.exports = function(sourceDir, output) {
  this.sourceDir = sourceDir;
  this.output = output;
};

BagIt.prototype.bagIt = function() {

  var targetOutput = this.output;
  var targetInput = this.sourceDir;

  return new Promise(function(resolve, reject) {

    try {

      console.log('[BagIt::bagIt] start ');

      var cwd = process.cwd();

      process.chdir(bagItExecutable);
      var args = ['create', targetOutput,
        targetInput, '--writer', 'zip'];

      console.log('[BagIt::start] config: ' + path.join(bagItExecutable, 'bag.bat ') + ' ' + args);

      var executable = spawn(path.join(bagItExecutable, 'bag.bat '), args);

      executable.stdout.on('data', function(data) {
        console.log(data.toString());
      });

      executable.stderr.on('data', function(data) {
        console.log('[BagIt::bagIt] Error during programm execution ' + data.toString());
        //return reject('[BagIt::bagIt] Error during programm execution ' + data.toString());
      });

      executable.on('close', function(code) {
        if(code !== 0)
        {
          console.log('[BagIt::bagIt] child process exited with code ' + code);
          return reject('[BagIt::bagIt] child process exited with code ' + code);
        }
        console.log('[BagIt::bagIt] child process exited with code ' + code);

        resolve(targetOutput);
      }.bind(this));

    } catch (e) {
      console.log('[BagIt::Error] General Error: ' + e);
      return reject('[BagIt::Error] General Error: ' + e);
    }
  });
};
