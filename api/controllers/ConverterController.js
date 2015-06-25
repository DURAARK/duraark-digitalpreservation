/**
 * ConverterController
 *
 * @description :: Server-side logic for managing Converters
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
        var buildm = body.sessions[0].buildm[0];


        var sessionPath = path.join(homeDir, 'session1');
        var sipPath = path.join(sessionPath, 'ie_id1');
        var masterPath = path.join(sipPath, 'master');
        var derivativePath = path.join(sipPath, 'derivative_copy');
        var sourceMDPath = path.join(sipPath, 'sourcemd');

        var sourceIFCPath = body.sessions[0].physicalAssets[0].digitalObjects[0].path;
        var targetIFCPath = path.join(masterPath, path.basename(sourceIFCPath));


        //temp for files todo delete:
        sourceIFCPath = path.join(homeDir, "reviewForm.html");
        targetIFCPath = path.join(masterPath, path.basename(sourceIFCPath));



        //create needed directories
        console.log("Creating directories");
        mkdirp(masterPath, function(err) {
            mkdirp(derivativePath, function(err) {
                mkdirp(sourceMDPath, function(err) {
                    console.log("Symlink to IFC");
                    console.log(sourceIFCPath);
                    console.log(targetIFCPath);
					/*
					fs.createReadStream(sourceIFCPath).pipe(fs.createWriteStream(targetIFCPath));
			*/
                    fs.link(sourceIFCPath, targetIFCPath, function() {
                        var rdf = new RDFTranslator();

                        rdf.extractFromJSONLD(buildm, "json-ld", "n3", function(data) {
                            res.send(data);
                        });

                    });
                });
            });
        });

    }
}