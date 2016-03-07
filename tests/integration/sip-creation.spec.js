var request = require('supertest'),
  fs = require('fs'),
  path = require('path'),
  assert = require('chai').assert;

describe('The public DigitalPreservation endpoint', function() {
  var testFileA = '/duraark-storage/sessions/fixed/CITA_NikolajKunsthal/master/CITA_NikolajKunsthal-0_04.e57n/duraark-storage/sessions/fixed/CITA_NikolajKunsthal/master/CITA_NikolajKunsthal-0_04.e57n';
  request = request.bind(request, 'http://mimas.cgv.tugraz.at/api/v0.7/digitalpreservation');

  describe('when GET /sip', function() {
    it('should return an array', function(done) {
      request(sails.hooks.http.app)
        .get('/sip')
        .expect(200, done);
    });
  });

  describe('when requesting a BagIt file', function() {
    it('should return a SIP record', function(done) {
      var sessionPath = path.join(__dirname, '..', 'fixtures', 'test-session.json');
      var session = fs.readFileSync(sessionPath, 'utf8');

      request(sails.hooks.http.app)
        .post('/sip')
        .send({
          session: JSON.parse(session),
          output: {
            type: 'bag'
          }
        })
        .expect(function(res) {
          var result = res.body;

          assert.isDefined(result.url, '"url" not present');
        })
        .expect(200, done)
    });
  });
});
