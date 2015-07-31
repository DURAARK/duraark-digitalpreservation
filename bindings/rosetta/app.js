var spawn = require('child_process').spawn,
  uuid = require('node-uuid'),
  path = require('path'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  _ = require('underscore');

var rosettaExecutable = path.join(__dirname, '../../sip-generator-2/SIP_Generator/');

var Rosetta = module.exports = function() {};

Rosetta.prototype.start = function(sourceDir, output) {

  console.log('[Rosetta::start] configuration: ' + sourceDir + "  --> " + output);

  return new Promise(function(resolve, reject) {
    console.log('[Rosetta::start] creating output Dir');
    mkdirp(output, function(err) {
      if(err) return reject(err);

      var cwd = process.cwd();
      process.chdir(rosettaExecutable);

      //JAVA -jar SIP _Generator.jar D:\input D:\output /exlibris1/transfer/tib_duraark
      var args = [sourceDir, output];

      var executable = spawn(path.join(rosettaExecutable, 'sip_generator.bat '), args);

      executable.stdout.on('data', function(data) {
        console.log(data.toString());
      });

      executable.stderr.on('data', function(data) {
        console.log('[Rosetta::start] Error during programm execution: ' + data.toString());
      });

      executable.on('close', function(code) {
        if(code !== 0)
        {
          console.log('[Rosetta::start] child process exited with code ' + code);
          return reject('[Rosetta::start] child process exited with code ' + code);
        }

        console.log('[Rosetta::start] child process exited with code ' + code);

        resolve(output);
      });
    });
  });
};
