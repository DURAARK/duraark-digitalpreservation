define({ "api": [
  {
    "type": "post",
    "url": "/sip",
    "title": "Create BagIt SIP",
    "version": "1.0.0",
    "name": "PostBagItSIP",
    "group": "DigitalPreservation",
    "permission": [
      {
        "name": "none"
      }
    ],
    "description": "<p>Creates a new Submission Information Package (SIP) in the <a href=\"https://en.wikipedia.org/wiki/BagIt\">BagIt</a> format.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "session",
            "description": "<p>Object containing arrays for the 'physicalAssets' and 'digitalObjects' that should go into the SIP.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "output",
            "description": "<p>Object containing a 'type' key with the value <strong>'bag'</strong>.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"url\": \"physical_asset_8a0e49ed-30da-42b5-984e-2cadd25e1cc0/bag.zip\",\n}",
          "type": "json"
        }
      ],
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>Download URL for the BagIt SIP.</p>"
          }
        ]
      }
    },
    "filename": "api/controllers/SipController.js",
    "groupTitle": "DigitalPreservation",
    "sampleRequest": [
      {
        "url": "http://data.duraark.eu/services/api/digitalpreservation/sip"
      }
    ]
  },
  {
    "type": "post",
    "url": "/sip",
    "title": "Create Rosetta SIP",
    "version": "1.0.0",
    "name": "PostRosettaSIP",
    "group": "DigitalPreservation",
    "permission": [
      {
        "name": "none"
      }
    ],
    "description": "<p>Creates a new Submission Information Package (SIP) in the <a href=\"https://developers.exlibrisgroup.com/rosetta/apis/SipWebServices\">Rosetta</a> format.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "session",
            "description": "<p>Object containing arrays for the 'physicalAssets' and 'digitalObjects' that should go into the SIP.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "output",
            "description": "<p>Object containing a 'type' key with the value <strong>'rosetta'</strong>.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"sip_id\": \"33505\",\n}",
          "type": "json"
        }
      ],
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "sip_id",
            "description": "<p>SIP ID from the Rosetta DPS. This can be used to get the download information for the uploaded files from the SIP (see Rosetta's <a href=\"https://developers.exlibrisgroup.com/rosetta/apis/SipWebServices\">web services documentation</a> on how to do that).</p>"
          }
        ]
      }
    },
    "filename": "api/controllers/SipController.js",
    "groupTitle": "DigitalPreservation",
    "sampleRequest": [
      {
        "url": "http://data.duraark.eu/services/api/digitalpreservation/sip"
      }
    ]
  }
] });
