/**
 * sip-generator.js
 *
 * @description :: TODO: You might write a short summary of how this service works.
 */

var rdfTranslatorUrl = 'http://localhost:8080/',
  request = require('request');

var RDFTranslator = module.exports = function() {}

RDFTranslator.prototype.extractFromJSONLD = function(jsonLd, from, to, cb) {
  console.log('[RDFTranslator::extractFromJSONLD] : ' + JSON.stringify(jsonLd, null, 4));

  //http://localhost:8080/convert/json-ld/xml/content
  query = rdfTranslatorUrl + "convert/" + from + "/" + to + "/content";
  console.log(query);
  //console.log(JSON.stringify(jsonLd,null,4));


  request.post({
      url: query,
      form: {
        content: JSON.stringify(jsonLd)
      }
    },
    function(err, httpResponse, body) {
      cb(body, err);
    });

};
