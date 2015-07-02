/**
 * SipController
 *
 * @description :: Server-side logic for managing SIP
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require("bluebird"),
    RDFTranslator = require('../../bindings/rdf-translator/app'),
    BagIt = require('../../bindings/bagit/app'),
    fs = Promise.promisifyAll(require('fs')),
    path = require('path'),
    mkdirp = require('mkdirp'),
    _ = require('lodash');

var homeDir = '/tmp' ;

function newFolderStructure(opts) {
  return new Promise(function(resolve, reject) {
    console.log("ConverterControler::Creating directories");

    mkdirp(opts.masterPath, function(err) {
        mkdirp(opts.derivativePath, function(err) {
            mkdirp(opts.sourceMDPath, function(err) {
                resolve(opts);
              });
        });
    });
  });

}

function symLinkToIFC(opts) {
  return new Promise(function(resolve, reject) {

    console.log("ConverterControler::Symlink to IFC");

    var sourceIFCPath = opts.digitalObject.path;
    var targetIFCPath = path.join(opts.masterPath, path.basename(sourceIFCPath));


    fs.link(sourceIFCPath, targetIFCPath, function() {
      //console.log(JSON.stringify(opts.digitalObject.derivatives, null, 4));
      resolve(opts);
    });
  });
}

function symLinktoDerivates(opts) {

  return Promise.each(opts.digitalObject.derivatives, function (derivativeObject) {
      return new Promise(function(resolve, reject) {

        console.log("ConverterControler::Symlink to derivates");

            var derivatesSourceFilePath = derivativeObject.path;
            var derivatesTargetFilePath = path.join(opts.derivativePath, path.basename(derivatesSourceFilePath));

            fs.link(derivatesSourceFilePath, derivatesTargetFilePath, function() {
              resolve();
            });
        });
    }).then(function () {
      return opts;
    });
}

function createBuilMXML(opts) {
  return new Promise(function(resolve, reject) {


  console.log("ConverterControler::Creating buildm.xml");
  var rdf = new RDFTranslator();

  rdf.extractFromJSONLD(opts.buildm, "json-ld", "xml", function(data) {
      console.log("ConverterControler::Writing buildm.xml");


      fs.writeFile(path.join(opts.sourceMDPath, 'buildm.xml'), data, function(err) {
        resolve();
      });
  });
});
}

function createBagIt() {
  var bagit = new BagIt('/tmp/session_physicalasset_d86c761c42e440659a8a5b945f695b76', '/tmp/bag.zip');
  bagit.bagIt(function(){
  });

}

module.exports = {
    create: function(req, res, next) {
        var body = req.body;
        var session = body.sessions[0];
        var physicalAsset = session.physicalAssets[0];
        var buildm = session.buildm;

        var pa = _.filter(buildm, function(instance) {
            //console.log(JSON.stringify(instance, null, 4));
            if (instance['@type'].length){
            	console.log(JSON.stringify(instance['@type'][0], null, 4));
                return instance['@type'][0] == "http://data.duraark.eu/vocab/PhysicalAsset";
            }
        });
        if (!pa) {
            return res.send(500, 'Could not find pysical asset in session');
        }


        var sessionPath = path.join(homeDir, 'session_' + path.basename(pa[0]['@id']));

        Promise.each(physicalAsset.digitalObjects, function(digitalObject, index, value){

          var folder = index + 1;
          var sipPath = path.join(sessionPath, 'ie_id' + folder);

          var opts = {
           buildm : buildm,
           digitalObject: digitalObject,
           sipPath : sipPath,
           masterPath : path.join(sipPath, 'master'),
           derivativePath : path.join(sipPath, 'derivative_copy'),
           sourceMDPath : path.join(sipPath, 'sourcemd'),
          };


          return newFolderStructure(opts)
          .then(symLinkToIFC)
          .then(symLinktoDerivates)
          .then(createBuilMXML);
        }).then(createBagIt);


/*
          return newFolderStructure(opts)
          .then(function (){
            return symLinkToIFC(opts);
          }).then(function (derivatives){
            return Promise.each(derivatives, function (derivativeObject) {
              return symLinktoDerivates(derivativeObject, opts);
            });
          }).then(function () {
            return createBuilMXML(opts);
          });
        }).then(function () {
          return createBagIt();
        });


*/
        /*_.forEach(physicalAsset.digitalObjects, function(da, key) {
            var folder = key + 1;
            var sipPath = path.join(sessionPath, 'ie_id' + folder);
            var masterPath = path.join(sipPath, 'master');
            var derivativePath = path.join(sipPath, 'derivative_copy');
            var sourceMDPath = path.join(sipPath, 'sourcemd');

            //create needed directories
            console.log("ConverterControler::Creating directories");
            mkdirp(masterPath, function(err) {
                mkdirp(derivativePath, function(err) {
                    mkdirp(sourceMDPath, function(err) {
                        console.log("ConverterControler::Symlink to IFC");

                        var sourceIFCPath = da.path;
                        var targetIFCPath = path.join(masterPath, path.basename(sourceIFCPath));

                        fs.link(sourceIFCPath, targetIFCPath, function() {
                            console.log("ConverterControler::Symlink to derivates");
                            _.forEach(da.derivatives, function(n, key) {

                                var derivatesSourceFilePath = n.path;
                                var derivatesTargetFilePath = path.join(derivativePath, path.basename(derivatesSourceFilePath));

                                fs.link(derivatesSourceFilePath, derivatesTargetFilePath, function() {

                                });
                            });

                            console.log("ConverterControler::Createing buildm.xml");
                            var rdf = new RDFTranslator();

                            rdf.extractFromJSONLD(buildm, "json-ld", "xml", function(data) {
                                console.log("ConverterControler::Writing buildm.xml");

                                fs.writeFile(path.join(sourceMDPath, 'buildm.xml'), data, function(err) {
                                  //return resolve();
                                    //res.send(data);

                                });
                            });

                        });
                    });
                });
            });
        }).then(function(){

          console.log("ConverterControler::bag it");
          var bagit = new BagIt('/tmp/session_physicalasset_d86c761c42e440659a8a5b945f695b76', '/tmp/bag.zip');
          bagit.bagIt(function(){

          });
        });*/
    }
};
