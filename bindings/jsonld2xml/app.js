/**
 * sip-generator.js
 *
 * @description :: TODO: You might write a short summary of how this service works.
 */

var BuildmSchema = require('./buildm-schema'),
  _ = require('underscore');

var Jsonld2xml = module.exports = function() {
  this._attribInfo = new BuildmSchema().getAttributeInfo();
}

// The
Jsonld2xml.prototype.isValidKey = function (key) {
  // console.log('[Jsonld2xml::isValidKey] checking: ' + key);
  var attrName = key.split('/').pop();
  return this._attribInfo.digitalObject[attrName] || this._attribInfo.physicalAsset[attrName]!== undefined;
};

Jsonld2xml.prototype.toXML = function(jsonLd) {
  // console.log('[Jsonld2xml::toXML] : ' + JSON.stringify(jsonLd, null, 4));
  var hasDate = false,
  that = this;

  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<buildm>\n';

  _.forEach(jsonLd, function(item) {
    var type = item['@type'],
      elementStart = null,
      elementEnd = null;

    console.log('type: |' + type + '|');
    //
    // console.log('compare (1): http://data.duraark.eu/vocab/buildm/PhysicalAsset|');
    // console.log('compare (2): ' + type + '|');
    // console.log('  -> flag: ' + (type == 'http://data.duraark.eu/vocab/buildm/PhysicalAsset'));

    // NOTE: using '==' here because the strict '===' was not working for comparing seemingly identical strings:
    if (type == 'http://data.duraark.eu/vocab/buildm/PhysicalAsset') {
      elementStart = '<physicalAsset>';
      elementEnd = '\n</physicalAsset>';
    } else if (type == 'http://data.duraark.eu/vocab/buildm/IFCSPFFile' || type == 'http://data.duraark.eu/vocab/buildm/E57File') {
      elementStart = '\n<digitalObject>'
      elementEnd = '\n</digitalObject>'
    } else {
      throw new Error('[Jsonld2xml] Unknown buildm type: ' + type);
    }

    xml += elementStart;

    _.forEach(item, function(value, key) {
      if (key !== '@id' && key !== '@type' && that.isValidKey(key)) {
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
