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
        var body = req.body;
        var buildm = body.sessions[0].buildm[0];

        var rdf = new RDFTranslator();

        rdf.extractFromJSONLD(buildm, "json-ld", "n3", function(data){
        	res.send(data);
        });


    }
};