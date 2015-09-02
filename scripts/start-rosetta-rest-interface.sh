#!/bin/bash

docker run -it --rm -p 8080:8080 -v $(pwd)/../tomcat/webapps:/usr/local/tomcat/webapps tomcat:8.0
