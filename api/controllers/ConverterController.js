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
        var body = req.body,
            buildm = body.sessions[0].buildm[0],
            rdf = new RDFTranslator();

        rdf.extractFromJSONLD(buildm, "json-ld", "n3", function(data) {
            res.send(data);
        });
    }
}