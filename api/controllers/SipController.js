/**
 * SipController
 *
 * @description :: Server-side logic for managing SIP
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var RDFTranslator = require('../../bindings/rdf-translator/app'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

var homeDir = '/tmp'

module.exports = {
    create: function(req, res, next) {
        var body = req.body;
        var session = body.sessions[0];
        var physicalAsset = session.physicalAssets[0];
        var buildm = session.buildm[0];

        var sessionPath = path.join(homeDir, 'session_' + path.basename(buildm['@id']));

        _.forEach(physicalAsset.digitalObjects, function(da, key) {
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
                            _.forEach(da.derivatives, function(n, key) {
                                console.log("ConverterControler::Symlink to derivates");

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
                                    res.send(data);
                                });
                            });

                        });
                    });
                });
            });
        });
    }
}