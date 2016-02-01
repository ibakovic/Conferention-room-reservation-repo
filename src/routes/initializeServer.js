'use strict';

var hapi = require('hapi');
var Path = require('path');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 7070;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var server = new hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, '../../app/dist/')
      }
    }
  }
});

server.connection({
  address: server_ip_address,
  port: server_port
});

module.exports = server;
