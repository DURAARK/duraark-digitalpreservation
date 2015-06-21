var  _ = require('underscore');

var JsonSchemaConverter = module.exports = function() {
}

JsonSchemaConverter.mapToPhysicalAssetXML = function(desc) {
    return desc;
}

JsonSchemaConverter.mapToDigitalObjectTechnicalMDXML = function(desc) {
    return desc;
}

JsonSchemaConverter.mapToDigitalObjectDescriptiveMDXML = function(desc) {
    return desc;
}

JsonSchemaConverter.mapToDigitalObjectSemEnrichmentRDF = function(desc) {
    return desc.selection;
}

JsonSchemaConverter.mapToPhysicalAssetMETSXML = function(desc) {
    return desc;
}

// JsonSchemaConverter.prototype._mapMetsFromBuildm = function(uuid, buildm) {
//     return {
//         paketuid: uuid,
//         metsObjId: 'placeholder',
//         metsId: 'placeholder',
//         metsLabel: 'placeholder',
//         metsType: 'placeholder',
//         creOrgNamn: buildm.creator,
//         creIndNamn: 'placeholder',
//         creIndTelefon: 'placeholder',
//         creIndMail: 'placeholder',
//         creSoftwareNamn: 'placeholder',
//         arcOrgNamn: buildm.archiverOrganizationName,
//         arcOrgOrgNr: 'placeholder',
//         arcSoftwareNamn: buildm.archiverSoftwareName,
//         preOrgNamn: 'placeholder',
//         preOrgOrgNr: 'placeholder',
//         altRecDelType: 'placeholder',
//         altRecDelSpec: 'placeholder',
//         altRecStartDate: 'placeholder',
//         altRecSubAgr: 'placeholder',
//         metsDocId: 'placeholder'
//     }
// };