var uuid = require('node-uuid'),
  fs = require('fs-extra'),
  path = require('path'),
  Promise = require('bluebird'),
  request = require('request');

var _storagePath = sails.config.storagePath;

function _generateURI(duraarkType) {
  var type = duraarkType.split('/').pop().toLowerCase();
  return 'http://data.duraark.eu/' + type + '_' + uuid.v4();
}

// var _baseUrl = process.env.DURAARK_API_ENDPOINT || 'http://juliet.cgv.tugraz.at';
var _baseUrl = 'http://localhost';

module.exports = {
  apiConfig: {
    sessionsUrl: _baseUrl + '/api/v0.7/sessions',
    metadataUrl: 'http://duraark-metadata:5012',
    sdaUrl: _baseUrl + '/api/v0.7/sda',
    geometricEnrichmentUrl: _baseUrl + '/api/v0.7/geometricenrichment',
    digitalPreservationUrl: _baseUrl + '/api/v0.7/digitalPreservation'
  },

  getAPIUrl: function(service) {
    return this.apiConfig[service + 'Url'];
  },

  extractIfcm: function(filename, options) {
    var duraark = this;

    console.log('[duraark] extract ifcm from: ' + filename);
    console.log('[duraark-sessions]\n');

    return new Promise(function(resolve, reject) {
      var metadataUrl = duraark.getAPIUrl('metadata') + '/ifcms';
      // console.log('POST ' + metadataUrl);

      var body = {
        path: filename
      }

      request({
        url: metadataUrl,
        method: 'POST',
        body: JSON.stringify(body)
      }, function(err, response, body) {
        if (err) {
          console.log(err);
          return reject("Request to 'duraark-metadata' service failed: " + err);
        } else {
          return resolve(JSON.parse(body));
        }
      });
    });
  },

  extractE57m: function(filename, options) {
    var duraark = this;

    console.log('[duraark] extract e57m from: ' + filename);
    console.log('[duraark-sessions]\n');

    return new Promise(function(resolve, reject) {
      var metadataUrl = duraark.getAPIUrl('metadata') + '/e57ms';
      // console.log('POST ' + metadataUrl);

      var body = {
        path: filename
      }

      request({
        url: metadataUrl,
        method: 'POST',
        body: JSON.stringify(body)
      }, function(err, response, body) {
        if (err) {
          console.log(err);
          return reject("Request to 'duraark-metadata' service failed: " + err);
        } else {
          return resolve(JSON.parse(body));
        }
      });
    });
  }
};
