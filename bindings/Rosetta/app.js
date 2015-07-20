var spawn = require('child_process').spawn,
    uuid = require('node-uuid'),
    path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    _ = require('underscore');

var rosettaExecutable = path.join(__dirname, '../../sip-generator-2/SIP_Generator/');

var Rosetta = module.exports = function() {
};

Rosetta.prototype.start = function(sourceDir, output, cb) {

    console.log('[Rosetta::start] configuration: ' + sourceDir + "  --> " + output);


    mkdirp(output, function(err) {
        var cwd = process.cwd();

        process.chdir(rosettaExecutable);

        //JAVA -jar SIP _Generator.jar D:\input D:\output /exlibris1/transfer/tib_duraark
        var arguments = [sourceDir, output];

        var executable = spawn(path.join(rosettaExecutable, 'sip_generator.bat '), arguments);

        executable.stdout.on('data', function(data) {
            console.log(data.toString());
        });

        executable.stderr.on('data', function(data) {
            console.log('ERROR: ' + data.toString());
        });

        executable.on('close', function(code) {
            console.log('[Rosetta-binding] child process exited with code ' + code);

            cb(output);
        });
    });
};