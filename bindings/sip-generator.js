var spawn = require('child_process').spawn,
    path = require('path'),
    fs = require('fs'),
    sqlite3 = require('sqlite3').verbose(),
    _ = require('underscore');

var SIPGenerator = module.exports = function(opts) {
    this._appRoot = opts.appRoot;

    console.log('[SIPGenerator::ctor] appRoot: ' + this._appRoot);
    console.log('[SIPGenerator::ctor] dbPath: ' + opts.dbPath);

    this._db = new sqlite3.Database(opts.dbPath);
}

SIPGenerator.prototype.dump = function(sip) {
    var pa = sip.physicalAsset.digitalObjects;

    console.log('\nStarting SIP ingestion to ROSETTA ...');

    console.log('\n-------------------------------------------------------------------------');
    console.log('CONTENT:');
    console.log('-------------------------------------------------------------------------');

    console.log('\n# Physical Asset: ' + sip.label)

    _.each(pa, function(da, idx) {
            console.log('\n  + DigitalObject: ' + idx);
            console.log('          Filename: ' + da.techMD.filename);
            console.log('          Path:     ' + da.path);

            _.each(da.derivatives, function(der, idx) {
                console.log('\n      > Derivative ' + idx);
                console.log('              Filename: ' + der.techMD.filename);
                console.log('              Path:     ' + der.path);
            });

            var techMD = da.techMD.filename ? true : false;
            var descMD = da.descMD.creator ? true : false;
            var semMD = (da.semMD.selection.length > 0) ? true : false;

        console.log('\n  + techMD: ' + techMD); 
        console.log('\n  + descMD: ' + descMD); 
        console.log('\n  + semMD: ' + semMD);
    });

console.log('-------------------------------------------------------------------------');
};

SIPGenerator.prototype._ingestToRosetta = function(sip, finish_cb) {
    setTimeout(finish_cb, 1000);

    // var buildm = {
    //     creOrgNamn: 'DURAARK Consortium',
    //     archiverOrganizationName: 'DURAARK Consortium',
    //     archiverSoftwareName: 'DURAARK Workbench SIP Generator'
    // };

    // var mets = this._mapMetsFromBuildm(sip.uuid, buildm);

    // this._updateMetsData(mets, sip.uuid, function() {
    //     this._copyFiles(sip.files, function(err) {
    //         if (err) {
    //             console.log('[SIPGenerator::_copyFiles] error: ' + err);
    //             console.log('ABORTING SIP generation!');
    //             return;
    //         }

    //         this._createSIP(sip, finish_cb);
    //     }.bind(this));
    // }.bind(this));
};

SIPGenerator.prototype.archive = function(sip, finish_cb) {
    this.dump(sip);
    this._ingestToRosetta(sip, finish_cb);
}

SIPGenerator.prototype._mapMetsFromBuildm = function(uuid, buildm) {

    return {
        paketuid: uuid,
        metsObjId: 'placeholder',
        metsId: 'placeholder',
        metsLabel: 'placeholder',
        metsType: 'placeholder',
        creOrgNamn: buildm.creator,
        creIndNamn: 'placeholder',
        creIndTelefon: 'placeholder',
        creIndMail: 'placeholder',
        creSoftwareNamn: 'placeholder',
        arcOrgNamn: buildm.archiverOrganizationName,
        arcOrgOrgNr: 'placeholder',
        arcSoftwareNamn: buildm.archiverSoftwareName,
        preOrgNamn: 'placeholder',
        preOrgOrgNr: 'placeholder',
        altRecDelType: 'placeholder',
        altRecDelSpec: 'placeholder',
        altRecStartDate: 'placeholder',
        altRecSubAgr: 'placeholder',
        metsDocId: 'placeholder'
    }
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
        console.log('[SIPGenerator::handleFile]  files: ' + JSON.stringify(files, null, 4));
        if (idx <= files.length) {
            if (idx === files.length) {
                finish_cb();
                return;
            }

            var file = files[idx++],
                source = file.path,
                target = path.join(appRoot, 'server', 'executables', 'sipgen', 'SIP_Generator', 'built', 'content', path.basename(file.path));

            copyFile(source, target, handleFile.bind(this, idx, files));
        }
    }

    if (files.length) {
        handleFile(0, files);
    }
};

SIPGenerator.prototype._createSIP = function(sip, finish_cb) {
    console.log('[SIPGenerator::_createSIP] creating SIP...');

    // java -jar server/executables/sipgen/SIP_Generator/run/eARDsip.jar 6e2e1358-f979-4c1d-afb3-09635b575370

    var exec_path = 'java',
        sip_jar = path.join(this._appRoot, 'server', 'executables', 'sipgen', 'SIP_Generator', 'run', 'eARDsip.jar'),
        sip_path = path.join(this._appRoot, 'server', 'executables', 'sipgen', 'SIP_Generator', 'sip', sip.uuid + '.zip'),
        public_path = path.join(this._appRoot, '.tmp', 'public', sip.uuid + '.zip'),
        options = '-jar ' + sip_jar + ' ' + sip.uuid,
        that = this;

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
        that._copyFile(sip_path, public_path, function() {
            var relative_www_path = '/' + sip.uuid + '.zip';
            finish_cb(relative_www_path);
        })
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