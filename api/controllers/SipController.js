/**
 * SipController
 *
 * @description :: Server-side logic for managing SIP
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require("bluebird"),
  RDFTranslator = require('../../bindings/rdf-translator/app'),
  BagIt = require('../../bindings/bagit/app'),
  Jsonld2xml = require('../../bindings/jsonld2xml/app'),
  fs = Promise.promisifyAll(require('fs-extra')),
  path = require('path'),
  mkdirp = require('mkdirp'),
  _ = require('underscore');

var homeDir = '/tmp';

function newFolderStructure(opts) {
  return new Promise(function(resolve, reject) {
    console.log("ConverterController::Creating directories");

    mkdirp(opts.masterPath, function(err) {
      if (err) return reject(err);
      mkdirp(opts.derivativePath, function(err) {
        if (err) return reject(err);
        mkdirp(opts.sourceMDPath, function(err) {
          if (err) return reject(err);
          resolve(opts);
        });
      });
    });
  });

}

function symLinkToIFC(opts) {
  return new Promise(function(resolve, reject) {

    console.log("ConverterController::Symlink to IFC");

    var sourceIFCPath = opts.digitalObject.path;
    var targetIFCPath = path.join(opts.masterPath, path.basename(sourceIFCPath));

    fs.link(sourceIFCPath, targetIFCPath, function(err) {
      if (err) return reject(err);
      //console.log(JSON.stringify(opts.digitalObject.derivatives, null, 4));
      resolve(opts);
    });
  });
}

function symLinktoDerivates(opts) {

  var promises = [];

  _.forEach(opts.digitalObject.derivatives, function(derivativeObject) {

    var promise = new Promise(function(resolve, reject) {
      console.log("ConverterController::Symlink to derivates");

      var derivatesSourceFilePath = derivativeObject.path;
      var derivatesTargetFilePath = path.join(opts.derivativePath, path.basename(derivatesSourceFilePath));

      fs.link(derivatesSourceFilePath, derivatesTargetFilePath, function(err) {
        if (err) return reject(err);
        resolve(opts);
      });
    });

    promises.push(promise);

  });
  return Promise.all(promises).then(function() {
    return opts;
  });
}

function createBuilMXML(opts) {
  return new Promise(function(resolve, reject) {

    // console.log("[ConverterController::Creating buildm.xml] buildm: " + JSON.stringify(opts.buildm, null, 4));
    var jsonld2xml = new Jsonld2xml();

    var buildmXML = jsonld2xml.toXML(opts.buildm);

    console.log("[ConverterController::Writing buildm.xml] XML:\n\n" + buildmXML);

    fs.writeFile(path.join(opts.sourceMDPath, 'buildm.xml'), buildmXML, function(err) {
      resolve(opts);
    });
  });
}

function createBagIt(bagItOpts, cb) {
  //console.log(JSON.stringify(bagItOpts, null, 4));
  console.log("ConverterController::Bag it");

  var bagit = new BagIt(bagItOpts.source, bagItOpts.target);
  bagit.bagIt(function() {
    cb();
  });

}

module.exports = {
  create: function(req, res, next) {

    // console.log('body: ' + JSON.stringify(req.body, null, 4));

    var session = req.body.session,
      output = req.body.output,
      physicalAsset = session.physicalAssets[0],
      digitalObjects = session.digitalObjects,
      paBuildm = physicalAsset.buildm;

    // console.log('buildm: ' + JSON.stringify(buildm, null, 4));

    var sessionPath = path.join(homeDir, 'session_' + path.basename(paBuildm['@id'])),
      bagItOpts = {
        source: sessionPath,
        target: path.join(homeDir, 'bag.zip')
      },
      promises = [];

    console.log('sessionPath: ' + sessionPath);

    // Remove eventual existing directory:
    fs.removeSync(sessionPath);

    _.forEach(digitalObjects, function(digitalObject, index, value) {
      var folder = index + 1;
      var sipPath = path.join(sessionPath, 'ie_id' + folder);

      var sourceMD = [];
      sourceMD.push(paBuildm);
      sourceMD.push(digitalObject.buildm);

      // console.log('body: ' + JSON.stringify(sourceMD, null, 4));

      var opts = {
        buildm: sourceMD,
        digitalObject: digitalObject,
        sipPath: sipPath,
        masterPath: path.join(sipPath, 'master'),
        derivativePath: path.join(sipPath, 'derivative_copy'),
        sourceMDPath: path.join(sipPath, 'sourcemd'),
      };

      promises.push(newFolderStructure(opts)
        .then(symLinkToIFC)
        .then(symLinktoDerivates)
        .then(createBuilMXML));
    });

    // return;
    Promise.all(promises).then(function() {
      if (output.type == 'bag') {
        createBagIt(bagItOpts, function() {
          return res.send(200, 'bagged it');
        });
      } else {
        return res.send(200, sessionPath);
      }
    }).catch(function(err) {
      console.log('error');
      throw new Error(err);
      return res.send(500, err);
    });
  }
};
