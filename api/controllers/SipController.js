/**
 * SipController
 *
 * @description :: Server-side logic for managing sips
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var RDFTranslator = require('../../bindings/rdf-translator/app'),
    fs = require('fs'),
    path = require('path'),
    cwd = process.cwd();

module.exports = {
    create: function(req, res, next) {
        var body = req.body,
            session = body.sessions[0],
            physicalAsset = session.physicalAssets[0],
            buildm = session.buildm[0],
            sessionPath = path.join(homeDir, 'session_' + path.basename(buildm['@id'])),
            sipPath = path.join(sessionPath, 'ie_id1'),
            masterPath = path.join(sipPath, 'master'),
            derivativePath = path.join(sipPath, 'derivative_copy'),
            sourceMDPath = path.join(sipPath, 'sourcemd');


        //create needed directories
        console.log("ConverterControler::Creating directories");
        mkdirp(masterPath, function(err) {
            mkdirp(derivativePath, function(err) {
                mkdirp(sourceMDPath, function(err) {
                    console.log("ConverterControler::Symlink to IFC");

                    var sourceIFCPath = physicalAsset.digitalObjects[0].path;
                    var targetIFCPath = path.join(masterPath, path.basename(sourceIFCPath));

                    //temp for files todo delete:
                    console.log("ConverterControler::Temp: redirect file: " + sourceIFCPath + " -> " + targetIFCPath);
                    sourceIFCPath = path.join(homeDir, "reviewForm.html");
                    targetIFCPath = path.join(masterPath, path.basename(physicalAsset.digitalObjects[0].path));
                    //enddelete

                    fs.link(sourceIFCPath, targetIFCPath, function() {
                        _.forEach(physicalAsset.digitalObjects[0].derivatives, function(n, key) {
                            console.log("ConverterControler::Symlink to derivates");

                            var derivatesSourceFilePath = n.path;
                            var derivatesTargetFilePath = path.join(derivativePath, path.basename(derivatesSourceFilePath));

                            //temp for files todo delete:
                            console.log("ConverterControler::Temp: redirect file: " + derivatesSourceFilePath + " -> " + derivatesTargetFilePath);
                            derivatesSourceFilePath = path.join(homeDir, "reviewForm.html");
                            derivatesTargetFilePath = path.join(derivativePath, path.basename(n.path));
                            //enddelete


                            fs.link(derivatesSourceFilePath, derivatesTargetFilePath, function() {

                            });
                        });


                        console.log("ConverterControler::Createing buildm.xml");
                        var rdf = new RDFTranslator();

                        rdf.extractFromJSONLD(buildm, "json-ld", "xml", function(data) {
                            console.log("ConverterControler::Writing buildm.xml");

                            fs.writeFile(path.join(sourceMDPath, 'buildm.xml'), data, function(err) {
                                res.send(data);
                            });
                        });

                    });
                });
            });
        });
    }
};