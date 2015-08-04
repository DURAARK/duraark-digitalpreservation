/**
 * sip-generator.js
 *
 * @description :: TODO: You might write a short summary of how this service works.
 */

var _ = require('underscore');

var Jsonld2xml = module.exports = function() {}

Jsonld2xml.prototype.toXML = function(jsonLd) {
  // console.log('[Jsonld2xml::toXML] : ' + JSON.stringify(jsonLd, null, 4));
  var hasDate = false;

  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<buildm>\n';

  _.forEach(jsonLd, function(item) {
    var type = item['@type'][0],
      elementStart = null,
      elementEnd = null;

    // console.log('type: ' + type);

    if (type === 'http://data.duraark.eu/vocab/PhysicalAsset') {
      elementStart = '<physicalAsset>';
      elementEnd = '\n</physicalAsset>';
    } else if (type === 'http://data.duraark.eu/vocab/IFCSPFFile' || type === 'http://data.duraark.eu/vocab/E57File') {
      elementStart = '\n<digitalObject>'
      elementEnd = '\n</digitalObject>'
    } else {
      throw new Error('[Jsonld2xml] Unkown buildm type. Exiting...');
    }

    xml += elementStart;

    _.forEach(item, function(value, key) {
      if (key !== '@id' && key !== '@type') {
        hasDate = key === 'dateCreated' ? true : false; // <dateCreated> is mandatory for the SIP Generator, so we create it in any case
        var prop = key.split('/').pop();

        // console.log('key: ' + prop);

        var propStart = '\n\t<' + prop + '>',
          propEnd = '</' + prop + '>';

        if (_.isArray(value)) {
          _.forEach(value, function(item) {
            var v = item['@value'];

            if (typeof(v) !== 'undefined' && v !== '') {
              xml += propStart;
              xml += v;
              xml += propEnd;
            }

            // console.log('  * ' + item['@value']);
          });
        } else {
          var v = item['@value'];

          if (typeof(v) !== 'undefined' && v !== '') {
            xml += propStart;
            xml += v;
            xml += propEnd;
          }

          // console.log('value: ' + item['@value']);
        }
      }
    });

    if (elementStart === '\n<digitalObject>' && !hasDate) {
      var date = new Date();
      xml += '\n  <dateCreated>' + date.toISOString() + '</dateCreated>\n';
    }
    xml += elementEnd;
  });

  xml += '\n</buildm>'

  return xml;
};
