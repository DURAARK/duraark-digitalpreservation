var spawn = require('child_process').spawn,
    path = require('path'),
    fs = require('fs'),
    sqlite3 = require('sqlite3').verbose(),
    _ = require('underscore'),
    $ = require('jquery-deferred'),
    rdfstore = require('rdfstore');

var SIPGenerator = module.exports = function(opts) {
    this._appRoot = opts.appRoot;

    console.log('[SIPGenerator::ctor] dbPath: ' + opts.dbPath);
    this._db = new sqlite3.Database(opts.dbPath);
}

SIPGenerator.prototype.archive = function(session, finish_cb) {
    console.log('[SIPGenerator::archiveSession] session_id: ' + session.id);

    this._mapMetsFromSession(session, function(metadata) {
        this._updateMetsData(metadata, session.uuid, function() {
            this._copyFiles(session.files, function(err) {
                if (err) {
                    console.log('[SIPGenerator::_copyFiles] error: ' + err);
                    console.log('ABORTING SIP generation!');
                    return;
                }

                // this._storeBuildmFile(session);
                this._createSIP(session, finish_cb);
            }.bind(this));
        }.bind(this));
    }.bind(this));
}

SIPGenerator.prototype._mapMetsFromSession = function(session, cb) {
    this._rdfToJSON(session.buildm).then(function(model) {
        var metadata = {
            paketuid: session.uuid,
            metsObjId: model.object_identifier.value,
            metsId: 'undefined',
            metsLabel: model.name.value,
            metsType: 'undefined',
            creOrgNamn: model.creator_organization_name.value,
            creIndNamn: model.creator.value,
            creIndTelefon: model.creator_phone.value,
            creIndMail: model.creator_mail.value,
            creSoftwareNamn: model.authoring_tool.value,
            arcOrgNamn: model.creator.value,
            arcOrgOrgNr: model.archiver_organization_phone.value,
            arcSoftwareNamn: model.authoring_tool.value,
            preOrgNamn: 'DURRAARK Consortium',
            preOrgOrgNr: 'undefined',
            altRecDelType: 'undefined',
            altRecDelSpec: 'undefined',
            altRecStartDate: model.buildingStartYear.value,
            altRecSubAgr: 'undefined',
            metsDocId: 'undefined'
        };
        cb(metadata);
    });
};

SIPGenerator.prototype._updateMetsData = function(mets, uuid, cb) {
    console.log('[SIPGenerator::_updateMetsData] inserting uuid: ' + uuid);

    this._db.run('INSERT INTO manuellinfo(paketuid, metsObjId, metsId, metsLabel, metsType, creOrgNamn, \
                                                                           creIndNamn, creIndTelefon, creIndMail, creSoftwareNamn, arcOrgNamn, \
                                                                           arcOrgOrgNr, arcSoftwareNamn, preOrgNamn, preOrgOrgNr, altRecDelType, \
                                                                           altRecDelSpec, altRecStartDate, altRecSubAgr, metsDocId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        uuid, mets.metsObjId, mets.metsId, mets.metsLabel, mets.metsType, mets.creOrgNamn, mets.creIndNamn, mets.creIndTelefon,
        mets.creIndMail, mets.creSoftwareNamn, mets.arcOrgNamn, mets.OrgOrgNr, mets.arcSoftwareNamn, mets.preOrgNamn,
        mets.preOrgOrgNr, mets.altRecDelType, mets.altRecDelSpec, mets.altRecStartDate, mets.altRecSubAgr, mets.metsDocId, cb);
}

SIPGenerator.prototype._copyFiles = function(files, finish_cb) {
    console.log('[SIPGenerator::_copyFiles] copying files...');

    var idx_file = 0,
        appRoot = this._appRoot,
        copyFile = this._copyFile;

    function handleFile(idx, files) {
        console.log('[SIPGenerator::handleFile]  idx: ' + idx);
        if (idx <= files.length) {
            if (idx === files.length) {
                finish_cb();
                return;
            }

            var file = files[idx++],
                source = null,
                target = path.join(appRoot, 'executables', 'sipgen', 'SIP_Generator', 'built', 'content', path.basename(file.path));

            // If file.path is absolute use it:
            if (path.resolve(file.path) === path.normalize(file.path)) {
                source = file.path;
            } else { // ... else join with appRoot:
                source = path.join(appRoot, file.path);
            }
            copyFile(source, target, handleFile.bind(this, idx, files));
        }
    }

    if (files.length) {
        handleFile(0, files);
    }
};

// SIPGenerator.prototype._storeBuildmFile = function(session) {
//     console.log('[SIPGenerator::_createSIP] creating SIP ...');

//     var buildm_file = path.join(this._appRoot, 'executables', 'sipgen', 'SIP_Generator', 'built', 'content', 'buildm.ttl');
//     fs.writeFileSync(buildm_file, session.buildm);

//     var content = fs.readFileSync(buildm_file);
//     console.log('content: ' + content);
// };

SIPGenerator.prototype._createSIP = function(session, finish_cb) {
    console.log('[SIPGenerator::_createSIP] creating SIP...');

    // java -jar server/executables/sipgen/SIP_Generator/run/eARDsip.jar 6e2e1358-f979-4c1d-afb3-09635b575370

    var exec_path = 'java',
        sip_jar = path.join(this._appRoot, 'executables', 'sipgen', 'SIP_Generator', 'run', 'eARDsip.jar'),
        sip_path = path.join(this._appRoot, 'executables', 'sipgen', 'SIP_Generator', 'sip', session.uuid + '.zip'),
        options = '-jar ' + sip_jar + ' ' + session.uuid;

    console.log('[SIPGenerator::identify] About to execute: ' + exec_path + ' ' + options);

    var bla = options.split(' ');

    var executable = spawn(exec_path, bla);

    executable.stdout.on('data', function(data) {
        console.log(data.toString());
    });

    executable.stderr.on('data', function(data) {
        console.log('[SIPGenerator::_createSIP] error: ' + data);
        console.log(data.toString());
    });

    executable.on('close', function() {
        finish_cb(sip_path);
    })
};

SIPGenerator.prototype._copyFile = function(source, target, cb) {
    console.log('[SIPGenerator::_copyFile] source: ' + source);
    console.log('[SIPGenerator::_copyFile] target: ' + target);

    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", done);

    var wr = fs.createWriteStream(target);
    wr.on("error", done);
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

SIPGenerator.prototype._rdfToJSON = function(rdf) {
    var defer = $.Deferred();
    var s = new rdfstore.Store({}, function(store) {
        store.load("text/turtle", rdf, function(success, results) {
            store.execute("SELECT * WHERE { $s $p $o . }", function(succes, results) {
                var blanks = {},
                    json = {};

                var formatKey = function(a) {
                    var b = a.indexOf('#') > -1 ? a.split('#') : a.split('/');
                    return b[b.length - 1];
                };
                results.forEach(function(result) {
                    if (result.o.token === 'blank') {
                        blanks[result.o.value] = result;
                    }
                });
                results.forEach(function(result) {
                    if (result.o.token !== 'blank') {
                        var key = formatKey(result.p.value);
                        var val = result.o.value;
                        var ty = result.o.type;
                        var blanknode_predicate, blanknode_identifier;
                        blanknode_predicate = blanknode_identifier = null;
                        if (result.s.token === 'blank') {
                            blanknode_predicate = blanks[result.s.value].p.value;
                            blanknode_identifier = result.s.value;
                            key = formatKey(blanks[result.s.value].p.value) + ' > ' + key;
                        }
                        json[key] = {
                            subject: result.s.value,
                            predicate: result.p.value,
                            value: val,
                            value_type: ty,
                            blanknode_predicate: blanknode_predicate,
                            blanknode_identifier: blanknode_identifier
                        };
                    }
                });
                defer.resolve(json);
            });
        });
    });
    return defer;
};