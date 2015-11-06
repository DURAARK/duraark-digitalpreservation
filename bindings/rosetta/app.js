var spawn = require('child_process').spawn,
  Promise = require('bluebird'),
  uuid = require('node-uuid'),
  path = require('path'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  _ = require('underscore'),
  fs = require('fs'),
  Sftp = require('sftp-upload');

var rosettaExecutable = path.join(__dirname, '../../sip-generator-2/SIP_Generator/');
var depositExecutable = path.join(__dirname, '../../sip-generator-2/rosetta-connector/dps-sdk-deposit');

var Rosetta = module.exports = function() {};

Rosetta.prototype.deposit = function(sourceDir) {
  var rosetta = this;

  console.log('[Rosetta::deposit] configuration: ' + sourceDir);
  var subDir = sourceDir.replace('/', '');

  console.log('[Rosetta::deposit] subdir: ' + subDir);

  return new Promise(function(resolve, reject) {
    var cwd = process.cwd();
    process.chdir(depositExecutable);
    var executable = path.join(depositExecutable, 'deposit.jar');

    var executable = spawn('java', ['-jar', executable, subDir]);
    executable.stdout.on('data', function(data) {
      console.log(data.toString());
    });

    executable.stderr.on('data', function(data) {
      console.log('[Rosetta::deposit] Error during programm execution: ' + data.toString());
      reject(data.toString());
    });

    executable.on('close', function(code) {
      if (code !== 0) {
        console.log('[Rosetta::deposit] child process exited with code ' + code);
        return reject('[Rosetta::deposit] child process exited with code ' + code);
      }

      console.log('[Rosetta::deposit] Successfully deposit ' + subDir);

      resolve(code);
    });
  });
};

Rosetta.prototype.upload = function(sourceDir) {
  return new Promise(function(resolve, reject) {

    var uuid = sourceDir.split('/').pop(),
    privateKey = null;

    try {
      privateKey = fs.readFileSync('/home/hecher/.ssh/id_rsa');
    } catch (err) {
      return reject('Private key for Rosetta upload could not be read.');
    }

    var options = {
        host: 'exchange.tib.eu',
        username: 'duraark',
        path: sourceDir,
        remoteDir: '/tib_extern_deposit_duraark/tmp/' + uuid,
        privateKey: privateKey
      },
      sftp = new Sftp(options);

    sftp.on('error', function(err) {
        reject(err);
      })
      .on('uploading', function(pgs) {
        console.log('Uploading', pgs.file);
        console.log(pgs.percent + '% completed');
      })
      .on('completed', function() {
        console.log('Upload Completed');
        resolve(sourceDir);
      })
      .upload();
  });
};

Rosetta.prototype.start = function(sourceDir, output) {
  var rosetta = this;

  console.log('[Rosetta::start] configuration: ' + sourceDir + "  --> " + output);

  return new Promise(function(resolve, reject) {
    console.log('[Rosetta::start] creating output Dir');
    mkdirp(output, function(err) {
      if (err) return reject(err);

      var cwd = process.cwd();
      process.chdir(rosettaExecutable);

      //JAVA -jar SIP _Generator.jar D:\input D:\output /exlibris1/transfer/tib_duraark
      var args = [sourceDir, output, '/exlibris1/transfer/tib_duraark'],
        executable = path.join(rosettaExecutable, 'SIP_Generator.jar');

      var executable = spawn('java', ['-jar', executable, sourceDir, output, '/exlibris1/transfer/tib_extern_deposit_duraark']);
      executable.stdout.on('data', function(data) {
        console.log(data.toString());
      });

      executable.stderr.on('data', function(data) {
        console.log('[Rosetta::start] Error during programm execution: ' + data.toString());
      });

      executable.on('close', function(code) {
        if (code !== 0) {
          console.log('[Rosetta::start] child process exited with code ' + code);
          return reject('[Rosetta::start] child process exited with code ' + code);
        }

        console.log('[Rosetta::start] child process exited with code ' + code);

        rosetta.upload(output).then(function(sourceDir) {
          var deposits = [];

          var entities = getDirectories(sourceDir);

          for (var idx = 0; idx < entities.length; idx++) {
            var entity = entities[idx];

            // var subDir = 'session_physicalasset_fa3a93318f644fe9bc97f781cdc1d501';
            // var subDir = 'fa3a93318f644fe9bc97f781cdc1d501';
            var subDir = path.join(sourceDir, entity);
            // var subDir = entity;

            deposits.push(rosetta.deposit(subDir));
          }

          Promise.all(deposits).then(function() {
            console.log('deposit finished for all intellectual entities');
            return resolve(output);
          }).catch(function(err) {
            return reject(err);
          });

        }).catch(function(err) {
          console.log('Rosetta upload error: ' + err);
          return reject(err);
        });
      });
    });
  });
};

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}
