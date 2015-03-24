# microservice-sipgenerator

This microservice provides functionality to create a Submission Information Package (SIP) which can be ingested into a long-term archival system. Currently we are supporting the ExLibris/Rosetta system format. In future an independent format will be added, called the 'BagIT' format.

## Demo-Server

A showcasing demo incorporating the service running on our [development system](http://juliet.cgv.tugraz.at). It is a development system, not a production one. You will always have the newest version running there, but it is also possible to experience bugs. A production demo will be available soon at http://workbench.duraark.eu. Currently we have the first prototype version running there.

## Setup & Installation

The deployment setup is based on the repository [microservice-base](https://github.com/DURAARK/microservice-base). It provides development scripts and docker deployment. Have a look at the link to get more detailed information.

### POST http://localhost:5007/sip/build

### Description

Creates a SIP container with the given files and returns a download URL.

#### Payload

```json  
{
  "files": [ { "path": "/tmp/file.ifc" } ]
}
```

#### Response

```json
{
	"url": "http://localhost:5007/sip.zip" 
}
```

Enjoy!
