'use strict';

var server = require('./src/lib/initializeServer.js');
var nunjucs = require('nunjucks');
require('minilog').enable();
var logger = require('minilog')('app.js');

//Listen for expirations
require('./src/lib/checkExpirations.js');

//All dependecies
require('./src/lib/serverRegisters.js')(server);

//User routes
require('./src/routes/user.js')(server);

//Rooms routes
require('./src/routes/rooms.js')(server);

//Reservations routes no time check
require('./src/routes/reservations.js')(server);

//Login and register
require('./src/routes/notAuthenticated.js')(server);

//Handle static data
server.register(require('inert'), function(err) {
  if (err) {
    throw err;
  }

  server.route({
    method: 'GET',
    path: '/{param*}',
    config: {
      handler: {
        directory: {
          path: '.',
          redirectToSlash: true,
          index: true
        }
      },
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': { redirectTo: false }
      }
    }
  });
});

//Start listening
server.start(function(err) {
  if (err) {
    throw err;
  }

  logger.log('Server runing at:', server.info.uri);
});
