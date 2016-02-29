/**
 * SipController
 *
 * @description :: Server-side logic for managing SIP
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require("bluebird"),
  BagIt = require('../../bindings/bagit/app'),
  Rosetta = require('../../bindings/rosetta/app'),
  Jsonld2xml = require('../../bindings/jsonld2xml/app'),
  fs = Promise.promisifyAll(require('fs-extra')),
  path = require('path'),
  mkdirp = require('mkdirp'),
  UUID = require('node-uuid'),
  _ = require('underscore');

var homeDir = '/tmp';

function newFolderStructure(opts) {
  return new Promise(function(resolve, reject) {
    console.log("ConverterController::Creating directories");

    mkdirp(opts.masterPath, function(err) {
      if (err) return reject(err);
      // mkdirp(opts.derivativePath, function(err) {
      // if (err) return reject(err);
      mkdirp(opts.sourceMDPath, function(err) {
        if (err) return reject(err);
        resolve(opts);
      });
      // });
    });
  });

}

function symLinkToIFC(opts) {
  return new Promise(function(resolve, reject) {

    console.log("ConverterController::Symlink to IFC");

    var sourceIFCPath = opts.digitalObject.path;
    var targetIFCPath = path.join(opts.masterPath, path.basename(sourceIFCPath));

    // fs.link(sourceIFCPath, targetIFCPath, function(err) {
    fs.copy(sourceIFCPath, targetIFCPath, function(err) {
      if (err) return reject(err);
      //console.log(JSON.stringify(opts.digitalObject.derivatives, null, 4));
      resolve(opts);
    });
  });
}

function symLinktoDerivates(opts) {
  var promises = [];

  return new Promise(function(resolve, reject) {
    if (opts.digitalObject.derivatives.length) {
      mkdirp(opts.derivativePath, function(err) {
        if (err) return reject(err);

        _.forEach(opts.digitalObject.derivatives, function(derivativeObject) {

          var promise = new Promise(function(resolve, reject) {
            console.log("[ConverterController::symLinktoDerivates]");

            var derivatesSourceFilePath = derivativeObject.path;
            var derivatesTargetFilePath = path.join(opts.derivativePath, path.basename(derivatesSourceFilePath));

            fs.copy(derivatesSourceFilePath, derivatesTargetFilePath, function(err) {
              if (err) return reject(err);
              resolve(opts);
            });
          });

          promises.push(promise);
        });

        return Promise.all(promises).then(function() {
          return opts;
        });
      });
    } else {
      resolve(opts);
    }
  });
}

function storeTechnicalMetadata(opts) {
  var promises = [];

  var filepath = opts.masterFile,
    fileExt = filepath.split('.').pop().toLowerCase();

  console.log('[SipController] Processing technical metadata for file: ' + filepath);

  // FIXXME: this should be DRY code, shouldn't it ...
  return new Promise(function(resolve, reject) {
    if (fileExt === 'ifc') {
      Duraark.extractIfcm(filepath).then(function(result) {
        var targetFileName = 'ifcm-' + filepath.split('/').pop(),
          targetFilePath = path.join(opts.sessionFolder, 'sourcemd', targetFileName);

        if (!result.metadata || !result.metadata['application/xml']) {
          return reject('No valid metadata returned for file: ' + filepath);
        }

        var xmlSerialization = result.metadata['application/xml'];

        try {
          var fileSourceMDPath = path.join(opts.sourceMDPath, 'ifcm.xml');
          fs.writeFile(fileSourceMDPath, xmlSerialization, function(err) {
            if (err) {
              console.log('Error copying file: ' + err);
              return reject(err);
            }

            console.log('[SipController] Wrote technical metadata to file: ' + targetFilePath);

            fs.copySync(fileSourceMDPath, targetFilePath, function(err) {
              // FIXXME: 'err' is set even if everything went fine. Does 'copySync' has a different signature?
              // if (err) {
              //   console.log('Error copying file: ' + err);
              //   return reject('Error copying technical metadata file to "sourcemd" folder: ' + fileSourceMDPath);
              // }

              resolve(opts);
            });
          });
        } catch (err) {
          reject('Cannot write metadata to file: ' + targetFilePath + '\nError: ' + err);
        }
      });
    } else if (fileExt === 'e57') {
      Duraark.extractE57m(filepath).then(function(result) {
        var targetFileName = 'e57m-' + filepath.split('/').pop(),
          targetFilePath = path.join(opts.sessionFolder, 'sourcemd', targetFileName);

        if (!result.metadata || !result.metadata['application/xml']) {
          return reject('No valid metadata returned for file: ' + filepath);
        }

        var xmlSerialization = result.metadata['application/xml'];

        try {
          var fileSourceMDPath = path.join(opts.sourceMDPath, 'e57m.xml');
          console.log('fileSourceMDPath' + fileSourceMDPath);
          fs.writeFile(fileSourceMDPath, xmlSerialization, function(err) {
            if (err) {
              console.log('Error copying file: ' + err);
              return reject(err);
            }

            console.log('[SipController] Wrote technical metadata to file: ' + fileSourceMDPath);

            fs.copySync(fileSourceMDPath, targetFilePath, function(err) {
              // FIXXME: 'err' is set even if everything went fine. Does 'copySync' has a different signature?
              // if (err) {
              //   console.log('Error copying file: ' + err);
              //   return reject('Error copying technical metadata file to "sourcemd" folder: ' + fileSourceMDPath);
              // }

              resolve(opts);
            });
          });
        } catch (err) {
          return reject('Cannot write metadata to file: ' + targetFilePath + '\nError: ' + err);
        }
      });
    }
  });
}

function createBuildMXML(opts) {
  return new Promise(function(resolve, reject) {

    // console.log("[ConverterController::Creating buildm.xml] buildm: " + JSON.stringify(opts.buildm, null, 4));

    var jsonld2xml = new Jsonld2xml();

    var buildmXML = jsonld2xml.toXML(opts.buildm);
    // var buildmXML = "<dummy></dummy>";

    console.log("[ConverterController::createBuildMXML]: " + opts.sourceMDPath);
    var buildmFileName = 'buildm-' + opts.digitalObject.label.replace(' ', '_'),
      buildmFilePath = path.join(opts.sessionFolder, 'sourcemd', buildmFileName);

    fs.writeFile(buildmFilePath, buildmXML,
      function(err) {
        resolve(opts);
      });

    fs.writeFile(path.join(opts.sourceMDPath, 'buildm.xml'), buildmXML, function(err) {
      resolve(opts);
    });

  });
}

function createBagIt(bagItOpts) {
  //console.log(JSON.stringify(bagItOpts, null, 4));
  console.log("ConverterController::Bag it");

  return new Promise(function(resolve, reject) {
    var bagit = new BagIt(bagItOpts.source, bagItOpts.target);
    resolve(bagit.bagIt());
  });
}

function createRosetta(rosettaOpts, cb) {
  console.log("ConverterController::createRosetta");
  var rosetta = new Rosetta();
  return rosetta.start(rosettaOpts.source, rosettaOpts.target);
}

module.exports = {

  /**
   * @api {post} /sip Create BagIt SIP
   * @apiVersion 0.7.0
   * @apiName PostBagItSIP
   * @apiGroup DigitalPreservation
   * @apiPermission none
   *
   * @apiDescription Creates a new Submission Information Package (SIP) in the [BagIt](https://en.wikipedia.org/wiki/BagIt) format.
   *
   * @apiParam {Object} session Object containing arrays for the 'physicalAssets' and 'digitalObjects' that should go into the SIP.
   * @apiParam {Object} output Object containing a 'type' key with the value **'bag'**.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "url": "physical_asset_8a0e49ed-30da-42b5-984e-2cadd25e1cc0/bag.zip",
   *     }
   *
   * @apiSuccess {String} url Download URL for the BagIt SIP.
   *
   */

  /**
   * @api {post} /sip Create Rosetta SIP
   * @apiVersion 0.7.0
   * @apiName PostRosettaSIP
   * @apiGroup DigitalPreservation
   * @apiPermission none
   *
   * @apiDescription Creates a new Submission Information Package (SIP) in the [Rosetta](https://developers.exlibrisgroup.com/rosetta/apis/SipWebServices) format.
   *
   * @apiParam {Object} session Object containing arrays for the 'physicalAssets' and 'digitalObjects' that should go into the SIP.
   * @apiParam {Object} output Object containing a 'type' key with the value **'rosetta'**.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "sip_id": "33505",
   *     }
   *
   * @apiSuccess {String} sip_id SIP ID from the Rosetta DPS. This can be used to get the download information for the uploaded files from the SIP (see Rosetta's [web services documentation](https://developers.exlibrisgroup.com/rosetta/apis/SipWebServices) on how to do that).
   *
   */
  create: function(req, res, next) {

    // console.log('body: ' + JSON.stringify(req.body, null, 4));

    var session = req.body.session,
      output = req.body.output,
      physicalAsset = session.physicalAssets[0],
      digitalObjects = session.digitalObjects,
      paBuildm = physicalAsset.buildm;

    // console.log('session: ' + JSON.stringify(digitalObjects, null, 4));

    var sessionPath = path.join(homeDir, 'session_' + path.basename(paBuildm['@id'])),
      opts = {
        source: sessionPath,
      },
      promises = [];

    // Remove existing directory, if exists:
    fs.removeSync(sessionPath);

    _.forEach(digitalObjects, function(digitalObject, index, value) {
      var folder = index + 1;
      var sipPath = path.join(sessionPath, 'ie_id' + folder);

      var sourceMD = [];
      sourceMD.push(paBuildm);
      sourceMD.push(digitalObject.buildm);

      var opts = {
        buildm: sourceMD,
        digitalObject: digitalObject,
        sipPath: sipPath,
        masterPath: path.join(sipPath, 'master'),
        derivativePath: path.join(sipPath, 'derivative_copy'),
        sourceMDPath: path.join(sipPath, 'sourcemd'),
        sessionFolder: session.sessionFolder,
        masterFile: digitalObject.path
      };

      // console.log('body: ' + JSON.stringify(opts, null, 4));

      promises.push(newFolderStructure(opts)
        // .then(storeTechnicalMetadata)
        .then(symLinkToIFC)
        .then(symLinktoDerivates)
        .then(createBuildMXML));
    });

    Promise.all(promises).then(function() {
      if (output.type == 'bag') {
        var uuid = UUID.v4();
        opts.target = path.join(homeDir, uuid, 'bag.zip');

        createBagIt(opts)
          .then(function(outputPath) {
            console.log('Created output at: ' + outputPath);

            var url = outputPath.replace('/tmp/', '/public/');

            return res.send({
              url: url
            }).status(200);
          });
      } else if (output.type == 'rosetta') {
        var uuid = UUID.v4();
        opts.target = path.join(homeDir, uuid);

        createRosetta(opts)
          .then(function(outputPath) {
            console.log('Created output at: ' + outputPath);

            var url = outputPath.replace('/tmp/', '/public/');

            res.send({
              url: url
            }).status(200);
          })
          .catch(function(err) {
            console.log('[SipController] SIP generation/upload error: ' + err);
            return res.send(500, err);
          });
      }
    }).catch(function(err) {
      console.log('[SipController] Error: ' + err);
      return res.send(500, err);
    });
  }
};
