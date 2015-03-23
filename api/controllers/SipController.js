/**
 * SipController
 *
 * @description :: Server-side logic for managing sips
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var SIPGenerator = require('../../bindings/sip-generator'),
	path = require('path'),
	uuid = require('node-uuid');

module.exports = {
	build: function(req, res, next) {
		var files = req.param('files');

		console.log('About to store files: ' + JSON.stringify(files, null, 4));

		console.log('cwd: ' + process.cwd());

		var sipGenerator = new SIPGenerator({
			appRoot: process.cwd(),
			dbPath: path.join(process.cwd(), 'sip_db.db')
		});

		var session = {
			id: 1,
			uuid: uuid.v4(),
			files: files
		};

		sipGenerator.archive(session, function(sip_path) {
			console.log('[SIPGenerator] created archive: ' + sip_path);
			res.json({
				url: sip_path
			});
		});
	}
};
