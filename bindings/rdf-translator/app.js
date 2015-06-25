/**
 * sip-generator.js
 *
 * @description :: TODO: You might write a short summary of how this service works.
 */

/*var spawn = require('child_process').spawn,
    rdf = require('rdf-ext')(),
    jsonld = require('jsonld');*/

var RDFTranslator = module.exports = function() {}
var rdfTranslatorUrl = 'http://localhost:8080/';
var request = require('request');


RDFTranslator.prototype.extractFromJSONLD = function(jsonLd, from, to, cb) {
    console.log('[RDFTranslator::extractFromJSONLD] : ' + jsonLd);

    //http://localhost:8080/convert/json-ld/xml/content
    query = rdfTranslatorUrl + "convert/" + from + "/" + to + "/content";
    console.log(query);
    //console.log(JSON.stringify(jsonLd,null,4));


    request.post({
        url: query, 
        form: { content: JSON.stringify(jsonLd)}}, 
        function(err,httpResponse,body){ 
            cb(body);
     });

};
